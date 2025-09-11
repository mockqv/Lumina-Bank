import { z } from "zod"
import { cpf, cnpj } from "cpf-cnpj-validator"

export function validateCPF(cpfValue: string): boolean {
  return cpf.isValid(cpfValue)
}

export function validateCNPJ(cnpjValue: string): boolean {
  return cnpj.isValid(cnpjValue)
}

export function formatCPF(cpfValue: string): string {
  return cpf.format(cpfValue)
}

export function formatCNPJ(cnpjValue: string): string {
  return cnpj.format(cnpjValue)
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "")
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }
  return phone
}

// Enhanced validation schemas
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  cpf: z
    .string()
    .min(11, "CPF/CNPJ deve ter pelo menos 11 dígitos")
    .refine((val) => {
      const clean = val.replace(/\D/g, "")
      return clean.length === 11 ? validateCPF(val) : clean.length === 14 ? validateCNPJ(val) : false
    }, "CPF ou CNPJ inválido"),
  phone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .refine((val) => {
      const clean = val.replace(/\D/g, "")
      return clean.length >= 10 && clean.length <= 11
    }, "Formato de telefone inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número",
    ),
})

export type LoginData = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof registerSchema>
