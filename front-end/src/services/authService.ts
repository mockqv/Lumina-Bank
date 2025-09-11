import api from './api';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { cpf as cpfValidator, cnpj as cnpjValidator } from 'cpf-cnpj-validator';

// Zod schema for login form validation
export const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    full_name: z.string().min(3, { message: "O nome completo é obrigatório." }),
    email: z.string().email({ message: "Por favor, insira um email válido." }),
    cpf: z.string().regex(/^[0-9]+$/, { message: "Apenas números são permitidos." }).refine(value => {
        return (value.length === 11 && cpfValidator.isValid(value)) || (value.length === 14 && cnpjValidator.isValid(value));
    }, {
        message: "CPF ou CNPJ inválido."
    }),
    phone: z.string().min(10, { message: "O telefone deve ter pelo menos 10 dígitos." }),
    password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

export type RegisterData = z.infer<typeof registerSchema>;

export async function register(data: RegisterData) {
    try {
        const response = await api.post('/auth/register', data);
        return response.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'An error occurred during registration.');
        }
        throw new Error('An unexpected error occurred. Please check your connection.');
    }
}

/**
 * Calls the backend API to log in a user.
 * @param credentials - The user's login credentials (email and password).
 * @returns The response from the server.
 */
export async function login(credentials: LoginData) {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    // Re-throw the error to be handled by the component
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'An error occurred during login.');
    }
    throw new Error('An unexpected error occurred. Please check your connection.');
  }
}

export async function logout() {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout failed', error);
        // We can choose to ignore logout errors on the client,
        // as the main goal is to clear the user state.
    }
}

export const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Por favor, insira um email válido." }),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export async function forgotPassword(email: string) {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'An error occurred.');
        }
        throw new Error('An unexpected error occurred. Please check your connection.');
    }
}

export const resetPasswordSchema = z.object({
    password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "As senhas não correspondem.",
    path: ["confirmPassword"],
});

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export async function resetPassword(data: ResetPasswordData & { token: string }) {
    try {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'An error occurred.');
        }
        throw new Error('An unexpected error occurred. Please check your connection.');
    }
}
