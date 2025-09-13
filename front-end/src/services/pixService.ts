import api from './api';
import { z } from 'zod';

export const PixKeyType = z.enum(['cpf', 'email', 'phone', 'random']);
export const PixKeyStatus = z.enum(['active', 'inactive']);

export const PixKeySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  key_type: PixKeyType,
  key_value: z.string(),
  status: PixKeyStatus,
  created_at: z.string(),
});

export type PixKey = z.infer<typeof PixKeySchema>;

export const getPixKeys = async (): Promise<PixKey[]> => {
  const response = await api.get('/pix');
  return response.data;
};

export const createPixKey = async (data: { key_type: string, key_value?: string }): Promise<PixKey> => {
  const response = await api.post('/pix', data);
  return response.data;
};

export const updatePixKeyStatus = async (key_id: string, status: 'active' | 'inactive'): Promise<PixKey> => {
  const response = await api.patch(`/pix/${key_id}/status`, { status });
  return response.data;
};

export const getPrimaryPixKeyByUserId = async (userId: string): Promise<PixKey> => {
    const response = await api.get(`/pix/user/${userId}/primary`);
    return response.data;
}

export const deletePixKey = async (key_id: string): Promise<void> => {
  await api.delete(`/pix/${key_id}`);
};

export interface PixKeyDetails {
    recipient_name: string;
    key_type: string;
    key_value_masked: string;
}

export const getPixKeyDetails = async (key: string): Promise<PixKeyDetails> => {
    const response = await api.get(`/pix/keys/${key}/details`);
    return response.data;
}
