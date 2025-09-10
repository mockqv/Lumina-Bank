"use client";

import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { MainLayout } from '@/components/main-layout';
import { getAccounts, type Account } from '@/services/accountService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const userAccounts = await getAccounts();
        setAccounts(userAccounts);
      } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const totalBalance = accounts.reduce((acc, account) => acc + parseFloat(account.balance), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <MainLayout>
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {user && <span className="text-muted-foreground">Bem-vindo, {user.full_name}!</span>}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
            {/* Summary Card */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Saldo Total</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <p className="text-4xl font-bold">
                            {isBalanceVisible ? formatCurrency(totalBalance) : 'R$ ••••••'}
                        </p>
                        <Button variant="ghost" size="icon" onClick={() => setIsBalanceVisible(!isBalanceVisible)}>
                            {isBalanceVisible ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                            <span className="sr-only">Toggle balance visibility</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Link href="/transfer" passHref><Button className="w-full">Transferir</Button></Link>
                    <Link href="/pix" passHref><Button variant="secondary" className="w-full">Gerenciar Chaves PIX</Button></Link>
                </CardContent>
            </Card>
        </div>

        <div>
            <h2 className="text-2xl font-semibold mb-4">Suas Contas</h2>
            {loading && <p>Carregando contas...</p>}
            {error && <p className="text-destructive">Erro: {error}</p>}
            {!loading && !error && (
                <div className="space-y-4">
                    {accounts.map((account) => (
                        <Card key={account.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold capitalize">{account.account_type === 'checking' ? 'Conta Corrente' : 'Conta Poupança'}</p>
                                    <p className="text-sm text-muted-foreground">Agência: {account.agency} | Conta: {account.account_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{isBalanceVisible ? formatCurrency(parseFloat(account.balance)) : 'R$ ••••••'}</p>
                                    <Link href={`/statement/${account.id}`} className="text-sm text-primary hover:underline">Ver Extrato</Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    </div>
</MainLayout>
  );
}
