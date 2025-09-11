import pool from '@/config/database.js';
import { randomBytes } from 'crypto';

export async function createTransferKey(userId: string, amount: number) {
    const key = randomBytes(16).toString('hex');
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await pool.query(
        'INSERT INTO transfer_keys (user_id, amount, key, expires_at) VALUES ($1, $2, $3, $4) RETURNING key',
        [userId, amount, key, expires_at]
    );

    return result.rows[0];
}

export async function getTransferKey(key: string) {
    const result = await pool.query(
        `SELECT tk.amount, tk.is_used, u.full_name as recipient_name, u.id as recipient_id
         FROM transfer_keys tk
         JOIN users u ON tk.user_id = u.id
         WHERE tk.key = $1 AND tk.expires_at > NOW()`,
        [key]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

export async function markTransferKeyAsUsed(key: string) {
    await pool.query('UPDATE transfer_keys SET is_used = TRUE WHERE key = $1', [key]);
}
