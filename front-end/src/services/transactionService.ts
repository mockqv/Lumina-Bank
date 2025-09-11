import api from './api';
import { z } from 'zod';

export const TransactionType = z.enum(['credit', 'debit']);

export const TransactionSchema = z.object({
    id: z.string().uuid(),
    account_id: z.string().uuid(),
    type: TransactionType,
    amount: z.string(),
    description: z.string().nullable(),
    created_at: z.string(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export interface DailyStatement {
    date: string;
    transactions: Transaction[];
    initial_balance: number;
    final_balance: number;
}

export interface StatementResponse {
    statement: DailyStatement[];
    totalPages: number;
    currentPage: number;
}

export const getStatement = async (
    accountId: string,
    startDate: string,
    endDate: string,
    type?: 'credit' | 'debit',
    page: number = 1,
    limit: number = 10
): Promise<StatementResponse> => {
    const params = new URLSearchParams({
        startDate,
        endDate,
        page: page.toString(),
        limit: limit.toString(),
    });
    if (type) {
        params.append('type', type);
    }
    const response = await api.get(`/transactions/${accountId}/statement`, { params });
    return response.data;
}

export const getRecentTransactions = async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions/recent');
    return response.data;
}

export const createPixTransfer = async (data: { amount: number, pixKey: string, description?: string, transferKey?: string }): Promise<any> => {
    const response = await api.post('/transactions/pix', data);
    return response.data;
}
