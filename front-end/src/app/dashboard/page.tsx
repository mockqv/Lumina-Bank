"use client"

import { useState } from "react"
import { Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock data - replace with actual API calls
const mockAccounts = [
  {
    id: "1",
    account_type: "checking",
    balance: "15420.50",
    agency: "0001",
    account_number: "12345-6",
  },
  {
    id: "2",
    account_type: "savings",
    balance: "8750.25",
    agency: "0001",
    account_number: "54321-9",
  },
]

const mockTransactions = [
  {
    id: "1",
    description: "Transferência PIX recebida",
    amount: "500.00",
    type: "credit",
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    description: "Pagamento cartão de crédito",
    amount: "1200.00",
    type: "debit",
    created_at: "2024-01-14T14:20:00Z",
  },
  {
    id: "3",
    description: "Depósito em conta",
    amount: "2500.00",
    type: "credit",
    created_at: "2024-01-13T09:15:00Z",
  },
]

export default function DashboardPage() {
  const [accounts, setAccounts] = useState(mockAccounts)
  const [transactions, setTransactions] = useState(mockTransactions)
  const [loading, setLoading] = useState(false)
  const [isBalanceVisible, setIsBalanceVisible] = useState(false)

  const totalBalance = accounts.reduce((acc, account) => acc + Number.parseFloat(account.balance), 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Mock user data
  const user = {
    full_name: "João Silva",
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance">Olá, {user.full_name}!</h1>
            <p className="text-muted-foreground">Bem-vindo de volta ao seu banco digital</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              Conta Ativa
            </Badge>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium opacity-90">Saldo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold mb-2">
                    {isBalanceVisible ? formatCurrency(totalBalance) : "R$ ••••••"}
                  </p>
                  <p className="text-sm opacity-80">Atualizado agora</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  {isBalanceVisible ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  <span className="sr-only">Toggle balance visibility</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/transfer" className="block">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Transferir
                </Button>
              </Link>
              <Link href="/pix" className="block">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Gerenciar PIX
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Suas Contas</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {accounts.map((account) => (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {account.account_type === "checking" ? "Conta Corrente" : "Conta Poupança"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Ag: {account.agency} • Conta: {account.account_number}
                      </p>
                    </div>
                    <Badge variant={account.account_type === "checking" ? "default" : "secondary"}>
                      {account.account_type === "checking" ? "Corrente" : "Poupança"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {isBalanceVisible ? formatCurrency(Number.parseFloat(account.balance)) : "R$ ••••••"}
                      </p>
                    </div>
                    <Link
                      href={`/statement/${account.id}`}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      Ver Extrato
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Transações Recentes</h2>
            <Link href="/statement" className="text-sm text-primary hover:underline font-medium">
              Ver todas
            </Link>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "credit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {transaction.type === "credit" ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.type === "credit" ? "+" : "-"}
                        {formatCurrency(Number.parseFloat(transaction.amount))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
