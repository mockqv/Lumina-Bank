"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { getAccounts, type Account } from "@/services/accountService"
import { getRecentTransactions, type Transaction } from "@/services/transactionService"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isBalanceVisible, setIsBalanceVisible] = useState(false)

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          setLoading(true)
          const [accountsData, transactionsData] = await Promise.all([
            getAccounts(),
            getRecentTransactions(),
          ])
          setAccounts(accountsData)
          setTransactions(transactionsData)
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message)
          } else {
            setError("An unexpected error occurred.")
          }
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [user])

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

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance">Olá, {user?.full_name}!</h1>
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
              <Link href="/receive" className="block">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <ArrowDownLeft className="mr-2 h-4 w-4" />
                  Receber Dinheiro
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
            <Link href={`/statement/${accounts[0]?.id}`} className="text-sm text-primary hover:underline font-medium">
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
