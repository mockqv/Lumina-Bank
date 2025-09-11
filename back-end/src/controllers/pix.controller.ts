import { Request, Response } from 'express';
import * as pixService from '../services/pix.service.js';
import { CreatePixKeySchema, UpdatePixKeyStatusSchema } from '../models/pix.model.js';

// Extend the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const getPixKeys = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.id; // Assuming user is authenticated and user id is in req.user
    const keys = await pixService.findPixKeysByUserId(user_id);
    res.status(200).json(keys);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching PIX keys', error });
  }
};

export const createPixKey = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.id;
    const data = CreatePixKeySchema.parse(req.body);

    // TODO: Add validation to check if email, cpf or phone belongs to the user creating the key.

    const newKey = await pixService.createPixKey(user_id, data);
    res.status(201).json(newKey);
  } catch (error) {
    res.status(400).json({ message: 'Error creating PIX key', error });
  }
};

export const updatePixKeyStatus = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.id;
    const { key_id } = req.params;
    if (!key_id) {
      return res.status(400).json({ message: 'PIX key ID is required' });
    }
    const data = UpdatePixKeyStatusSchema.parse(req.body);
    const updatedKey = await pixService.updatePixKeyStatus(key_id, user_id, data);
    if (updatedKey) {
      res.status(200).json(updatedKey);
    } else {
      res.status(404).json({ message: 'PIX key not found or user not authorized' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating PIX key status', error });
  }
};

export const getPrimaryPixKeyByUserId = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const key = await pixService.getPrimaryPixKeyByUserId(userId);
        if (key) {
            res.status(200).json(key);
        } else {
            res.status(404).json({ message: 'No active PIX key found for this user' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching primary PIX key', error });
    }
}

export const deletePixKey = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.id;
    const { key_id } = req.params;
    if (!key_id) {
      return res.status(400).json({ message: 'PIX key ID is required' });
    }
    const success = await pixService.deletePixKey(key_id, user_id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'PIX key not found or user not authorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting PIX key', error });
  }
};
