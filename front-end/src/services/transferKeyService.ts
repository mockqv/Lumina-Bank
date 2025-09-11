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

export async function createTransferKey(data: { amount: number, expires_in?: string }): Promise<TransferKey> {
    try {
        const response = await api.post('/transfer-keys', data);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                throw new Error(`Error from server: ${error.response.status} - ${error.response.data.message || 'No message'}`);
            } else if (error.request) {
                // The request was made but no response was received
                throw new Error('No response from server. Please check your network connection.');
            } else {
                // Something happened in setting up the request that triggered an Error
                throw new Error('Error in request setup: ' + error.message);
            }
        }
        // Not an axios error
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
