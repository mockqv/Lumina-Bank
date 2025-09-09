"use client";

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { getAccounts, type Account } from '@/services/accountService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {user && <span className="text-muted-foreground">Bem-vindo, {user.fullName}!</span>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Suas Contas</h2>

      {loading && <p>Carregando contas...</p>}
      {error && <p className="text-destructive">Erro: {error}</p>}

      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Link href={`/accounts/${account.id}`} key={account.id}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="capitalize">{account.account_type === 'checking' ? 'Conta Corrente' : 'Conta Poupança'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Número: {account.account_number}</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(account.balance)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
