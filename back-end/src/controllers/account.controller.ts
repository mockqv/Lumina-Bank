import { type Request, type Response } from 'express';
import * as accountService from '@/services/account.service.js';

interface AuthRequest extends Request {
  user?: { id: string };
}

export async function getAccounts(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const accounts = await accountService.getAccountsByUserId(req.user.id);
    res.status(200).json(accounts);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'An unexpected error occurred', details: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
}

export async function getAccountBalance(req: AuthRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const balance = await accountService.getAccountBalanceByUserId(req.user.id);
        res.status(200).json(balance);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'An unexpected error occurred', details: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
}
