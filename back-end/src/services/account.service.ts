import pool from '@/config/database.js';

/**
 * Fetches all accounts for a given user.
 * @param userId - The ID of the user.
 * @returns A list of the user's accounts.
 */
export async function getAccountsByUserId(userId: string) {
  const result = await pool.query('SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
  return result.rows;
}

/**
 * Fetches a single account by its ID, ensuring it belongs to the user.
 * @param accountId - The ID of the account.
 * @param userId - The ID of the user.
 * @returns The account details.
 * @throws Will throw an error if the account is not found or doesn't belong to the user.
 */
export async function getAccountById(accountId: string, userId: string) {
    const result = await pool.query('SELECT * FROM accounts WHERE id = $1 AND user_id = $2', [accountId, userId]);
    if (result.rows.length === 0) {
        throw new Error('Account not found or access denied.');
    }
    return result.rows[0];
}

export async function getAccountBalanceByUserId(userId: string) {
    const accounts = await getAccountsByUserId(userId);
    if (accounts.length === 0) {
        throw new Error('No account found for this user.');
    }
    // Assuming the first account is the primary one
    return { balance: accounts[0].balance };
}
