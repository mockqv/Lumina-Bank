"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MainLayout } from '@/components/main-layout';
import * as transactionService from '@/services/transactionService';
import { useAuth } from '@/contexts/AuthContext';

export default function StatementPage() {
  const { user } = useAuth();
  const params = useParams();
  const accountId = params.accountId as string;

  const [statement, setStatement] = useState<transactionService.DailyStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0], // Today
    type: '' as 'credit' | 'debit' | '',
  });

  const fetchStatement = async () => {
    if (!accountId) return;
    try {
      setIsLoading(true);
      const fetchedStatement = await transactionService.getStatement(
        accountId,
        filters.startDate,
        filters.endDate,
        filters.type || undefined
      );
      setStatement(fetchedStatement);
    } catch (error) {
      alert('Failed to fetch statement.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatement();
  }, [accountId, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, type: value as 'credit' | 'debit' | ''}));
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!user) return <MainLayout><p>Loading...</p></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Extrato da Conta</h1>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 items-center">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select onValueChange={handleSelectFilterChange} value={filters.type}>
                  <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="credit">Entrada</SelectItem>
                      <SelectItem value="debit">Saída</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? <p>Carregando extrato...</p> : (
          <div className="space-y-6">
            {statement.map(daily => (
              <Card key={daily.date}>
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>{new Date(daily.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</CardTitle>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                    <p>{formatCurrency(daily.initial_balance)}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {daily.transactions.map(t => (
                        <TableRow key={t.id}>
                          <TableCell>{t.description}</TableCell>
                          <TableCell>{t.type === 'credit' ? 'Crédito' : 'Débito'}</TableCell>
                          <TableCell className={`text-right font-semibold ${t.type === 'credit' ? 'text-green-600' : 'text-black'}`}>
                            {t.type === 'credit' ? '+' : '-'}
                            {formatCurrency(parseFloat(t.amount))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="text-right mt-4">
                    <p className="text-sm text-muted-foreground">Saldo Final</p>
                    <p className="font-bold">{formatCurrency(daily.final_balance)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {!isLoading && statement.length === 0 && <p>Nenhuma transação encontrada para o período selecionado.</p>}
      </div>
    </MainLayout>
  );
}
