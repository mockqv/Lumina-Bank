import pool from '@/config/database.js';
import { randomBytes } from 'crypto';

function calculateExpiresAt(expiresIn: string): Date {
    const now = new Date();
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1), 10);

    if (isNaN(value)) {
        // Default to 1 day if the format is invalid
        now.setDate(now.getDate() + 1);
        return now;
    }

    switch (unit) {
        case 'm':
            now.setMinutes(now.getMinutes() + value);
            break;
        case 'h':
            now.setHours(now.getHours() + value);
            break;
        case 'd':
            now.setDate(now.getDate() + value);
            break;
        case 'w':
            now.setDate(now.getDate() + value * 7);
            break;
        case 'M':
            now.setMonth(now.getMonth() + value);
            break;
        default: // permanent or invalid
            return new Date('9999-12-31T23:59:59Z');
    }
    return now;
}

export async function createTransferKey(userId: string, amount: number, expiresIn: string = '1d') {
    try {
        const key = randomBytes(16).toString('hex');
        const expires_at = expiresIn === 'permanent' ? new Date('9999-12-31T23:59:59Z') : calculateExpiresAt(expiresIn);

        const result = await pool.query(
            'INSERT INTO transfer_keys (user_id, amount, key, expires_at) VALUES ($1, $2, $3, $4) RETURNING key',
            [userId, amount, key, expires_at]
        );

        if (result.rows.length === 0) {
            throw new Error("Database did not return the new key after insertion.");
        }
        return result.rows[0];
    } catch (dbError) {
        // Log the detailed database error for debugging, but throw a generic message to the user.
        console.error("Database error in createTransferKey:", dbError);
        throw new Error("Could not create transfer key due to a database error.");
    }
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
