"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowUpRight, ArrowDownLeft, CreditCard, Eye, EyeOff, Copy, Download, Loader2 } from "lucide-react"
import Link from "next/link"

// Mock data types
interface Transaction {
  id: string
  description: string
  amount: string
  type: "credit" | "debit"
  created_at: string
}

interface AccountDetails {
  id: string
  account_type: "checking" | "savings"
  balance: string
  agency: string
  account_number: string
  created_at: string
  status: "active" | "inactive"
}

// Mock data
const mockAccount: AccountDetails = {
  id: "1",
  account_type: "checking",
  balance: "15420.50",
  agency: "0001",
  account_number: "12345-6",
  created_at: "2023-06-15T10:00:00Z",
  status: "active",
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    description: "Transferência PIX recebida - João Silva",
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
  {
    id: "4",
    description: "Transferência PIX enviada",
    amount: "300.00",
    type: "debit",
    created_at: "2024-01-12T16:45:00Z",
  },
  {
    id: "5",
    description: "Salário - Empresa XYZ",
    amount: "5000.00",
    type: "credit",
    created_at: "2024-01-10T08:00:00Z",
  },
]

export default function AccountDetailsPage() {
  const params = useParams()
  const accountId = params.accountId as string

  const [account, setAccount] = useState<AccountDetails | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isBalanceVisible, setIsBalanceVisible] = useState(false)

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setAccount(mockAccount)
        setTransactions(mockTransactions)
      } catch (err) {
        setError("Erro ao carregar detalhes da conta")
      } finally {
        setLoading(false)
      }
    }

    if (accountId) {
      fetchAccountDetails()
    }
  }, [accountId])

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number.parseFloat(value))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Carregando detalhes da conta...</span>
        </div>
      </MainLayout>
    )
  }

  if (error || !account) {
    return (
      <MainLayout>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-destructive">{error || "Conta não encontrada"}</p>
          </CardContent>
        </Card>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Detalhes da Conta</h1>
            <p className="text-muted-foreground">
              {account.account_type === "checking" ? "Conta Corrente" : "Conta Poupança"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={account.status === "active" ? "default" : "secondary"}>
              {account.status === "active" ? "Ativa" : "Inativa"}
            </Badge>
          </div>
        </div>

        {/* Account Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Informações da Conta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Agência:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-medium">{account.agency}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(account.agency)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Conta:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-medium">{account.account_number}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(account.account_number)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium capitalize">
                  {account.account_type === "checking" ? "Conta Corrente" : "Conta Poupança"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Criada em:</span>
                <span className="font-medium">{formatDate(account.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saldo Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {isBalanceVisible ? formatCurrency(account.balance) : "R$ ••••••"}
                  </p>
                  <p className="text-sm text-muted-foreground">Atualizado agora</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isBalanceVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  <span className="sr-only">Toggle balance visibility</span>
                </Button>
              </div>
              <Separator className="my-4" />
              <div className="flex gap-2">
                <Link href={`/statement/${account.id}`} className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Ver Extrato
                  </Button>
                </Link>
                <Link href="/transfer" className="flex-1">
                  <Button className="w-full">
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Transferir
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transações Recentes</CardTitle>
              <Link href={`/statement/${account.id}`} className="text-sm text-primary hover:underline">
                Ver todas
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
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
                      <p className="text-sm text-muted-foreground">{formatDateTime(transaction.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "credit" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge variant={transaction.type === "credit" ? "default" : "secondary"} className="text-xs">
                      {transaction.type === "credit" ? "Entrada" : "Saída"}
                    </Badge>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
