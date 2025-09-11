import api from './api';
import { isAxiosError } from 'axios';

export interface Account {
  id: string;
  user_id: string;
  account_number: string;
  account_type: 'checking' | 'savings';
  balance: string; // Comes as string from backend DECIMAL
  created_at: string;
}

/**
 * Fetches all accounts for the logged-in user.
 * @returns A list of the user's accounts.
 */
export async function getAccounts(): Promise<Account[]> {
  try {
    const response = await api.get('/accounts');
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'An error occurred while fetching accounts.');
    }
    throw new Error('An unexpected error occurred. Please check your connection.');
  }
}

export interface Transaction {
    id: string;
    account_id: string;
    type: 'credit' | 'debit';
    amount: string;
    description: string;
    created_at: string;
}

export async function getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
    try {
        const response = await api.get(`/accounts/${accountId}/transactions`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'An error occurred while fetching transactions.');
        }
        throw new Error('An unexpected error occurred. Please check your connection.');
    }
}

export async function getAccountBalance(): Promise<{ balance: string }> {
    try {
        const response = await api.get('/accounts/balance');
        return response.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'An error occurred while fetching balance.');
        }
        throw new Error('An unexpected error occurred. Please check your connection.');
    }
}
