import pool from '@/config/database.js';
import { type transaction_type } from '@/models/transaction.model.js';

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
