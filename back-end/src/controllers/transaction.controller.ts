import { type Request, type Response } from 'express';
import * as transactionService from '@/services/transaction.service.js';

interface AuthRequest extends Request {
  user?: { id: string };
}

export async function createTransaction(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { accountId, type, amount, description } = req.body;

    // Basic validation
    if (!accountId || !type || !amount) {
        return res.status(400).json({ message: 'Missing required fields: accountId, type, amount' });
    }

    const newTransaction = await transactionService.createTransaction({
      accountId,
      userId: req.user.id,
      type,
      amount: parseFloat(amount),
      description,
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'An unexpected error occurred', details: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
}

export async function getTransactions(req: AuthRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { accountId } = req.params;
        if (!accountId) {
            return res.status(400).json({ message: 'Account ID is required' });
        }
        const transactions = await transactionService.getTransactionsByAccountId(accountId, req.user.id);
        res.status(200).json(transactions);

    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'An unexpected error occurred', details: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
}

export async function getStatement(req: AuthRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { accountId } = req.params;
        const { startDate, endDate, type } = req.query;

        if (!accountId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Missing required fields: accountId, startDate, endDate' });
        }

        const args: any = {
            accountId,
            userId: req.user.id,
            startDate: startDate as string,
            endDate: endDate as string,
        };
        if (type) {
            args.type = type as 'credit' | 'debit';
        }
        const statement = await transactionService.getStatement(args);

        res.status(200).json(statement);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'An unexpected error occurred', details: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
}

export async function createPixTransfer(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { amount, pixKey, description } = req.body;

    // Basic validation
    if (!amount || !pixKey) {
        return res.status(400).json({ message: 'Missing required fields: amount, pixKey' });
    }

    const newTransaction = await transactionService.createPixTransfer({
      senderUserId: req.user.id,
      amount: parseFloat(amount),
      pixKey,
      description,
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'An unexpected error occurred', details: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
}
