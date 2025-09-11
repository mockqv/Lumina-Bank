import { type Request, type Response } from 'express';
import * as transferKeyService from '@/services/transferKey.service.js';

interface AuthRequest extends Request {
  user?: { id: string };
}

export async function createTransferKey(req: AuthRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const { amount, expires_in } = req.body;
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }
        const key = await transferKeyService.createTransferKey(req.user.id, amount, expires_in);
        res.status(201).json(key);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'An unexpected error occurred', details: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
}

export async function getTransferKey(req: Request, res: Response) {
    try {
        const { key } = req.params;
        const transferKey = await transferKeyService.getTransferKey(key!);
        if (!transferKey) {
            return res.status(404).json({ message: 'Transfer key not found, expired, or already used.' });
        }
        res.status(200).json(transferKey);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'An unexpected error occurred', details: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
}
