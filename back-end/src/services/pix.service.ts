import { pool } from '../config/database';
import { PixKey, CreatePixKeyData, UpdatePixKeyStatusData } from '../models/pix.model';
import { randomUUID } from 'crypto';

export const findPixKeyByValue = async (key_value: string): Promise<PixKey | null> => {
  const result = await pool.query<PixKey>('SELECT * FROM pix_keys WHERE key_value = $1 AND status = \'active\'', [key_value]);
  return result.rows[0] || null;
};

export const findPixKeysByUserId = async (user_id: string): Promise<PixKey[]> => {
  const result = await pool.query<PixKey>('SELECT * FROM pix_keys WHERE user_id = $1', [user_id]);
  return result.rows;
};

export const createPixKey = async (user_id: string, data: CreatePixKeyData): Promise<PixKey> => {
  const { key_type, key_value } = data;
  let final_key_value = key_value;

  if (key_type === 'random') {
    final_key_value = randomUUID();
  }

  if (!final_key_value) {
    throw new Error('key_value is required for the given key_type');
  }

  // TODO: Add validation to check if email, cpf or phone belongs to the user creating the key.

  const result = await pool.query<PixKey>(
    'INSERT INTO pix_keys (user_id, key_type, key_value) VALUES ($1, $2, $3) RETURNING *',
    [user_id, key_type, final_key_value]
  );
  return result.rows[0];
};

export const updatePixKeyStatus = async (key_id: string, user_id: string, data: UpdatePixKeyStatusData): Promise<PixKey | null> => {
  const { status } = data;
  const result = await pool.query<PixKey>(
    'UPDATE pix_keys SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [status, key_id, user_id]
  );
  return result.rows[0] || null;
};
