"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MainLayout } from '@/components/main-layout';
import * as pixService from '@/services/pixService';
import { useAuth } from '@/contexts/AuthContext';

const pixTransferSchema = z.object({
  pixKey: z.string().min(1, "A chave PIX é obrigatória."),
  amount: z.coerce.number().positive("O valor deve ser positivo."),
  description: z.string().optional(),
});

type PixTransferData = z.infer<typeof pixTransferSchema>;

export default function TransferPage() {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PixTransferData>({
    resolver: zodResolver(pixTransferSchema),
  });

  const onSubmit = async (data: PixTransferData) => {
    try {
      await pixService.createPixTransfer(data);
      alert('Transferência realizada com sucesso!');
      reset();
    } catch (error) {
        if (error instanceof Error) {
            alert(`Erro na transferência: ${error.message}`);
        } else {
            alert('Ocorreu um erro desconhecido.');
        }
    }
  };

  if (!user) return <MainLayout><p>Loading...</p></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Transferência via PIX</h1>
        <Card>
          <CardHeader>
            <CardTitle>Enviar Dinheiro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave PIX do Destinatário</Label>
                <Input id="pixKey" {...register("pixKey")} />
                {errors.pixKey && <p className="text-sm text-destructive">{errors.pixKey.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <Input id="amount" type="number" step="0.01" {...register("amount")} />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Input id="description" {...register("description")} />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
