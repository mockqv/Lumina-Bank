"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import { getTransactionsByAccountId, type Transaction } from '@/services/accountService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountDetailsPage() {
  const params = useParams();
  const accountId = params.accountId as string;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accountId) return;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const fetchedTransactions = await getTransactionsByAccountId(accountId);
        setTransactions(fetchedTransactions);
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

    fetchTransactions();
  }, [accountId]);

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">Detalhes da Conta</h1>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Carregando transações...</p>}
          {error && <p className="text-destructive">Erro: {error}</p>}

          {!loading && !error && (
            <ul className="space-y-4">
              {transactions.map((transaction) => (
                <li key={transaction.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{transaction.description || 'Transação'}</p>
                    <p className="text-sm text-muted-foreground">{new Date(transaction.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <p className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'credit' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </p>
                </li>
              ))}
              {transactions.length === 0 && <p>Nenhuma transação encontrada.</p>}
            </ul>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
