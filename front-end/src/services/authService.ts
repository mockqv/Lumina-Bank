import api from './api';
import { z } from 'zod';
import { isAxiosError } from 'axios';

// Zod schema for login form validation
export const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

export type LoginData = z.infer<typeof loginSchema>;

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
