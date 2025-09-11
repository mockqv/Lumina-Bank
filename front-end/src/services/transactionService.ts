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

export const getStatement = async (accountId: string, startDate: string, endDate: string, type?: 'credit' | 'debit'): Promise<DailyStatement[]> => {
    const params = new URLSearchParams({
        startDate,
        endDate,
    });
    if (type) {
        params.append('type', type);
    }
    const response = await api.get(`/transactions/${accountId}/statement`, { params });
    return response.data;
}
