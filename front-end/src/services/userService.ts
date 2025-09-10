import api from './api';
import { z } from 'zod';
import { isAxiosError } from 'axios';

export const updateUserSchema = z.object({
    full_name: z.string().min(3, { message: "O nome completo é obrigatório." }).optional(),
    phone: z.string().min(10, { message: "O telefone deve ter pelo menos 10 dígitos." }).optional(),
}).refine(data => Object.keys(data).length > 0, { message: "Pelo menos um campo deve ser preenchido." });

export type UpdateUserData = z.infer<typeof updateUserSchema>;

export async function updateUser(data: UpdateUserData) {
    try {
        const response = await api.patch('/users/profile', data);
        return response.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'An error occurred while updating the profile.');
        }
        throw new Error('An unexpected error occurred. Please check your connection.');
    }
}
