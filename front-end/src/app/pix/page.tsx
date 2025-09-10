"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MainLayout from '@/components/main-layout';
import * as pixService from '@/services/pixService';
import { useAuth } from '@/contexts/AuthContext';

const createPixKeySchema = z.object({
  key_type: z.enum(['cpf', 'email', 'phone', 'random']),
  key_value: z.string().optional(),
});

type CreatePixKeyData = z.infer<typeof createPixKeySchema>;

export default function PixPage() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<pixService.PixKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CreatePixKeyData>({
    resolver: zodResolver(createPixKeySchema),
  });
  const keyType = watch('key_type');

  const fetchKeys = async () => {
    try {
      setIsLoading(true);
      const fetchedKeys = await pixService.getPixKeys();
      setKeys(fetchedKeys);
    } catch (error) {
      alert('Failed to fetch PIX keys.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (data: CreatePixKeyData) => {
    try {
      await pixService.createPixKey(data);
      fetchKeys();
      reset();
    } catch (error) {
      alert('Failed to create PIX key.');
    }
  };

  const handleStatusChange = async (key: pixService.PixKey) => {
    try {
      const newStatus = key.status === 'active' ? 'inactive' : 'active';
      await pixService.updatePixKeyStatus(key.id, newStatus);
      fetchKeys();
    } catch (error) {
      alert('Failed to update key status.');
    }
  };

  if (!user) return <MainLayout><p>Loading...</p></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Gerenciar Chaves PIX</h1>

        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Chave</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleCreateKey)} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Chave</Label>
                <Select onValueChange={(value) => setValue('key_type', value as any)} >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de chave" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Telefone</SelectItem>
                        <SelectItem value="random">Aleatória</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              {keyType && keyType !== 'random' && (
                <div className="space-y-2">
                  <Label htmlFor="key_value">Valor da Chave</Label>
                  <Input id="key_value" {...register("key_value")} />
                  {errors.key_value && <p className="text-sm text-destructive">{errors.key_value.message}</p>}
                </div>
              )}
              <Button type="submit">Criar Chave</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suas Chaves</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <p>Carregando chaves...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Chave</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>{key.key_type}</TableCell>
                    <TableCell>{key.key_value}</TableCell>
                    <TableCell>{key.status === 'active' ? 'Ativa' : 'Inativa'}</TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={key.status === 'active'}
                        onCheckedChange={() => handleStatusChange(key)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
