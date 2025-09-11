import pool from '../config/database.js';
import { PixKey, CreatePixKeyData, UpdatePixKeyStatusData } from '../models/pix.model.js';
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
  if (!result.rows[0]) {
    throw new Error('Could not create PIX key.');
  }
  return result.rows[0];
};

export const getPixKeyDetails = async (key_value: string) => {
    const pixKey = await findPixKeyByValue(key_value);
    if (!pixKey) {
        return null;
    }

    const userResult = await pool.query('SELECT full_name FROM users WHERE id = $1', [pixKey.user_id]);
    if (userResult.rows.length === 0) {
        return null;
    }

    return {
        recipient_name: userResult.rows[0].full_name
    };
}

export const deletePixKey = async (key_id: string, user_id: string): Promise<boolean> => {
  const result = await pool.query(
    'DELETE FROM pix_keys WHERE id = $1 AND user_id = $2',
    [key_id, user_id]
  );
  return result.rowCount ? result.rowCount > 0 : false;
};

export const getPrimaryPixKeyByUserId = async (user_id: string): Promise<PixKey | null> => {
    let result = await pool.query<PixKey>('SELECT * FROM pix_keys WHERE user_id = $1 AND status = \'active\' AND key_type = \'cpf\'', [user_id]);
    if (result.rows.length > 0) {
        return result.rows[0]!;
    }
    result = await pool.query<PixKey>('SELECT * FROM pix_keys WHERE user_id = $1 AND status = \'active\' AND key_type = \'random\'', [user_id]);
    if (result.rows.length > 0) {
        return result.rows[0]!;
    }
    result = await pool.query<PixKey>('SELECT * FROM pix_keys WHERE user_id = $1 AND status = \'active\' LIMIT 1', [user_id]);
    return result.rows[0] || null;
}

export const updatePixKeyStatus = async (key_id: string, user_id: string, data: UpdatePixKeyStatusData): Promise<PixKey> => {
  const { status } = data;
  const result = await pool.query<PixKey>(
    'UPDATE pix_keys SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [status, key_id, user_id]
  );
  if (!result.rows[0]) {
    throw new Error('Could not update PIX key status. Key not found or user not authorized.');
  }
  return result.rows[0];
};
