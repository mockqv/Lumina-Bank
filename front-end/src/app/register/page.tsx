"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema, type RegisterData, register as registerUser } from '@/services/authService';

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser(data);
      // Redirect to login page after successful registration
      router.push('/login');
    } catch (error) {
      // You can use a toast notification here for better UX
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unknown error occurred.');
      }
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Crie sua Conta</CardTitle>
          <CardDescription className="text-center">Junte-se ao Lumina Bank hoje mesmo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF (apenas números)</Label>
              <Input id="cpf" {...register("cpf")} />
              {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="underline">
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
