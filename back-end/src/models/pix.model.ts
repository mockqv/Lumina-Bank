import { z } from 'zod';

export const PixKeyType = z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']);
export const PixKeyStatus = z.enum(['active', 'inactive']);

export const PixKeySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  key_type: PixKeyType,
  key_value: z.string(),
  status: PixKeyStatus,
  created_at: z.date(),
});

export type PixKey = z.infer<typeof PixKeySchema>;

export const CreatePixKeySchema = z.object({
  key_type: PixKeyType,
  key_value: z.string().optional(), // For random keys, the server will generate it
});

export type CreatePixKeyData = z.infer<typeof CreatePixKeySchema>;

export const UpdatePixKeyStatusSchema = z.object({
  status: PixKeyStatus,
});

export type UpdatePixKeyStatusData = z.infer<typeof UpdatePixKeyStatusSchema>;
