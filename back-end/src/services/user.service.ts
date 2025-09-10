import pool from '@/config/database.js';

interface UpdateUserData {
    full_name?: string;
    phone?: string;
}

export async function updateUser(userId: string, data: UpdateUserData) {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
        throw new Error('No fields to update.');
    }

    const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(', ');

    const query = `
        UPDATE users
        SET ${setClause}
        WHERE id = $1
        RETURNING id, full_name, email, phone, created_at
    `;

    const result = await pool.query(query, [userId, ...values]);

    if (result.rows.length === 0) {
        throw new Error('User not found.');
    }

    return result.rows[0];
}
