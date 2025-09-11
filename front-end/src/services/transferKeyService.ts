import api from './api';
import { isAxiosError } from 'axios';

export interface TransferKey {
    key: string;
}

export interface TransferKeyDetails {
    amount: string;
    is_used: boolean;
    recipient_name: string;
    recipient_id: string;
}

export async function createTransferKey(data: { amount: number, expires_in: string }): Promise<TransferKey> {
    try {
        const response = await api.post('/transfer-keys', data);
        return response.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'An error occurred while creating the transfer key.');
        }
        throw new Error('An unexpected error occurred. Please check your connection.');
    }
}

export async function getTransferKey(key: string): Promise<TransferKeyDetails> {
    try {
        const response = await api.get(`/transfer-keys/${key}`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'An error occurred while fetching the transfer key.');
        }
        throw new Error('An unexpected error occurred. Please check your connection.');
    }
}
