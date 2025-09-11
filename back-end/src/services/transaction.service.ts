import pool from '@/config/database.js';
import { type transaction_type } from '@/models/transaction.model.js';
import { findPixKeyByValue } from './pix.service.js';
import { getAccountsByUserId } from './account.service.js';

interface CreateTransactionArgs {
  accountId: string;
  userId: string;
  type: transaction_type;
  amount: number;
  description: string;
}

export async function createTransaction({ accountId, userId, type, amount, description }: CreateTransactionArgs) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get the current balance and check if the account belongs to the user
    const accountResult = await client.query(
      'SELECT balance FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [accountId, userId]
    );

    if (accountResult.rows.length === 0) {
      throw new Error('Account not found or access denied.');
    }

    const currentBalance = parseFloat(accountResult.rows[0].balance);
    let newBalance;

    // 2. Calculate new balance and check for overdraft
    if (type === 'debit') {
      if (currentBalance < amount) {
        throw new Error('Insufficient funds.');
      }
      newBalance = currentBalance - amount;
    } else {
      newBalance = currentBalance + amount;
    }

    // 3. Update account balance
    await client.query('UPDATE accounts SET balance = $1 WHERE id = $2', [newBalance, accountId]);

    // 4. Insert the transaction record
    const newTransactionResult = await client.query(
      'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [accountId, type, amount, description]
    );

    await client.query('COMMIT');
    return newTransactionResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getTransactionsByAccountId(accountId: string, userId: string) {
    // First, verify the user owns the account
    const accountCheck = await pool.query('SELECT id FROM accounts WHERE id = $1 AND user_id = $2', [accountId, userId]);
    if (accountCheck.rows.length === 0) {
        throw new Error('Access to account denied.');
    }

    const result = await pool.query(
        'SELECT * FROM transactions WHERE account_id = $1 ORDER BY created_at DESC',
        [accountId]
    );
    return result.rows;
}

import { markTransferKeyAsUsed } from './transferKey.service.js';

export async function createPixTransfer({ senderUserId, amount, pixKey, description, transferKey }: { senderUserId: string; amount: number; pixKey: string; description: string; transferKey?: string }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (transferKey) {
            await markTransferKeyAsUsed(transferKey);
        }

        // 1. Find recipient's PIX key
        const recipientPixKey = await findPixKeyByValue(pixKey);
        if (!recipientPixKey) {
            throw new Error('Recipient PIX key not found.');
        }
        const recipientUserId = recipientPixKey.user_id;

        if(senderUserId === recipientUserId) {
            throw new Error('Sender and receiver cannot be the same person.');
        }

        // 2. Get sender and recipient accounts
        const senderAccounts = await getAccountsByUserId(senderUserId);
        const recipientAccounts = await getAccountsByUserId(recipientUserId);

        if (senderAccounts.length === 0) {
            throw new Error('Sender account not found.');
        }
        if (recipientAccounts.length === 0) {
            throw new Error('Recipient account not found.');
        }
        const senderAccount = senderAccounts[0];
        const recipientAccount = recipientAccounts[0];

        // 3. Check sender's balance
        const accountResult = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [senderAccount.id]);
        const currentBalance = parseFloat(accountResult.rows[0].balance);
        if (currentBalance < amount) {
            throw new Error('Insufficient funds.');
        }

        // 4. Debit from sender
        const senderNewBalance = currentBalance - amount;
        const debitDescription = `Transfer to ${recipientAccount.account_number}${description ? `: ${description}` : ''}`;
        await client.query('UPDATE accounts SET balance = $1 WHERE id = $2', [senderNewBalance, senderAccount.id]);
        await client.query(
            'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)',
            [senderAccount.id, 'debit', amount, debitDescription]
        );

        // 5. Credit to recipient
        const recipientAccountResult = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [recipientAccount.id]);
        const recipientCurrentBalance = parseFloat(recipientAccountResult.rows[0].balance);
        const recipientNewBalance = recipientCurrentBalance + amount;
        const creditDescription = `Transfer from ${senderAccount.account_number}${description ? `: ${description}` : ''}`;
        await client.query('UPDATE accounts SET balance = $1 WHERE id = $2', [recipientNewBalance, recipientAccount.id]);
        const newTransactionResult = await client.query(
            'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [recipientAccount.id, 'credit', amount, creditDescription]
        );

        await client.query('COMMIT');
        return newTransactionResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}


interface GetStatementArgs {
  accountId: string;
  userId: string;
  startDate: string;
  endDate: string;
  type?: 'credit' | 'debit';
  page: number;
  limit: number;
}

export async function getStatement({ accountId, userId, startDate, endDate, type, page, limit }: GetStatementArgs) {
    const accountCheck = await pool.query('SELECT id, balance FROM accounts WHERE id = $1 AND user_id = $2', [accountId, userId]);
    if (accountCheck.rows.length === 0) {
        throw new Error('Access to account denied.');
    }
    const account = accountCheck.rows[0];

    // Build the count query
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE account_id = $1 AND created_at >= $2 AND created_at < $3';
    const countQueryParams: any[] = [accountId, startDate, endDate];
    if (type) {
        countQuery += ' AND type = $4';
        countQueryParams.push(type);
    }
    const totalTransactionsResult = await pool.query(countQuery, countQueryParams);
    const totalTransactions = parseInt(totalTransactionsResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalTransactions / limit);

    // To calculate the initial balance for the current page, we need to consider all transactions before this page
    const offset = (page - 1) * limit;
    const transactionsBeforePageResult = await pool.query(
        `SELECT type, amount FROM transactions WHERE account_id = $1 AND created_at >= $2 AND created_at < $3 ORDER BY created_at ASC`,
        [accountId, startDate, endDate]
    );

    let initialBalance = parseFloat(account.balance);
    const transactionsAfterStartResult = await pool.query(
        `SELECT type, amount FROM transactions WHERE account_id = $1 AND created_at >= $2`,
        [accountId, startDate]
    );
    for (const t of transactionsAfterStartResult.rows) {
        if (t.type === 'credit') initialBalance -= parseFloat(t.amount);
        else initialBalance += parseFloat(t.amount);
    }

    let balanceAtPageStart = initialBalance;
    for (let i = 0; i < offset && i < transactionsBeforePageResult.rows.length; i++) {
        const t = transactionsBeforePageResult.rows[i];
        if (t.type === 'credit') balanceAtPageStart += parseFloat(t.amount);
        else balanceAtPageStart -= parseFloat(t.amount);
    }

    // Build the query to get transactions for the period with pagination
    let query = 'SELECT * FROM transactions WHERE account_id = $1 AND created_at >= $2 AND created_at < $3';
    const queryParams: any[] = [accountId, startDate, endDate];
    if (type) {
        query += ' AND type = $4';
        queryParams.push(type);
    }
    query += ' ORDER BY created_at ASC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);

    const transactionsResult = await pool.query(query, queryParams);
    const transactions = transactionsResult.rows;

    const dailyStatements = new Map<string, { date: string, transactions: any[], initial_balance: number, final_balance: number }>();
    let runningBalance = balanceAtPageStart;

    for (const t of transactions) {
        if(t.created_at) {
            const date = new Date(t.created_at).toISOString().split('T')[0] as string;
            if (!dailyStatements.has(date)) {
                dailyStatements.set(date, {
                    date,
                    transactions: [],
                    initial_balance: runningBalance,
                    final_balance: runningBalance
                });
            }
            const dayStatement = dailyStatements.get(date)!;
            dayStatement.transactions.push(t);
            if (t.type === 'credit') runningBalance += parseFloat(t.amount);
            else runningBalance -= parseFloat(t.amount);
            dayStatement.final_balance = runningBalance;
        }
    }

    return {
        statement: Array.from(dailyStatements.values()),
        totalPages,
        currentPage: page,
    };
}

export async function getRecentTransactionsByUserId(userId: string, limit: number = 5) {
    const result = await pool.query(
        `SELECT t.*
         FROM transactions t
         JOIN accounts a ON t.account_id = a.id
         WHERE a.user_id = $1
         ORDER BY t.created_at DESC
         LIMIT $2`,
        [userId, limit]
    );
    return result.rows;
}
