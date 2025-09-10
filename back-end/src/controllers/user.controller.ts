import { type Request, type Response } from 'express';
import * as userService from '@/services/user.service.js';

interface AuthRequest extends Request {
  user?: { id: string };
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { full_name, phone } = req.body;

    const updatedUser = await userService.updateUser(req.user.id, { full_name, phone });

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'An unexpected error occurred', details: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
}
