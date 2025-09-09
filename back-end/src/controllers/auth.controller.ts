import { type Request, type Response } from 'express';
import * as authService from '@/services/auth.service.js';

export async function register(req: Request, res: Response) {
  try {
    const user = await authService.register(req.body);
    // Do not send password hash in the response
    const { ...userWithoutPassword } = user;
    res.status(201).json({ message: 'User created successfully', user: userWithoutPassword });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { token } = await authService.login(req.body);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour in milliseconds
    });

    res.status(200).json({ message: 'Logged in successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
}

export function logout(req: Request, res: Response) {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0),
    });

    res.status(200).json({ message: 'Logged out successfully' });
}

interface AuthRequest extends Request {
  user?: any;
}

export async function getProfile(req: AuthRequest, res: Response) {
    if (req.user) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json({ message: 'Not authorized' });
    }
}
