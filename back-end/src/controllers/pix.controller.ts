import { Request, Response } from 'express';
import * as pixService from '../services/pix.service';
import { CreatePixKeySchema, UpdatePixKeyStatusSchema } from '../models/pix.model';

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
