"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import { Calendar, Download, Filter, ArrowUpRight, ArrowDownLeft, Receipt, Loader2 } from "lucide-react"

import { getStatement, type DailyStatement } from "@/services/transactionService"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function StatementPage() {
  const params = useParams()
  const accountId = params.accountId as string

  const [statement, setStatement] = useState<DailyStatement[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split("T")[0], // First day of current month
    endDate: new Date().toISOString().split("T")[0], // Today
    type: "all" as "credit" | "debit" | "all",
  })

  const fetchStatement = async (page = 1) => {
    if (!accountId) return
    try {
      setIsLoading(true)
      setError("")
      const { statement: fetchedStatement, totalPages: fetchedTotalPages } = await getStatement(
        accountId,
        filters.startDate,
        filters.endDate,
        filters.type === "all" ? undefined : filters.type,
        page
      )
      setStatement(fetchedStatement)
      setTotalPages(fetchedTotalPages)
      setCurrentPage(page)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatement(currentPage)
  }, [accountId, filters, currentPage])

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, type: value as "credit" | "debit" | "all" }))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTotalTransactions = () => {
    return statement.reduce((total, daily) => total + daily.transactions.length, 0)
  }

  const getTotalCredits = () => {
    return statement.reduce(
      (total, daily) =>
        total +
        daily.transactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + Number.parseFloat(t.amount), 0),
      0,
    )
  }

  const getTotalDebits = () => {
    return statement.reduce(
      (total, daily) =>
        total +
        daily.transactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + Number.parseFloat(t.amount), 0),
      0,
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Extrato da Conta</h1>
            <p className="text-muted-foreground">Conta: {accountId}</p>
          </div>
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Download className="h-4 w-4" />
            <span>Exportar PDF</span>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Transações</span>
              </div>
              <p className="text-2xl font-bold">{getTotalTransactions()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ArrowDownLeft className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Entradas</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalCredits())}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="h-4 w-4 text-red-600" />
                <span className="text-sm text-muted-foreground">Saídas</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(getTotalDebits())}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Período</span>
              </div>
              <p className="text-sm font-medium">
                {new Date(filters.startDate).toLocaleDateString("pt-BR")} -{" "}
                {new Date(filters.endDate).toLocaleDateString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Transação</Label>
                <Select onValueChange={handleSelectFilterChange} value={filters.type}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="credit">Apenas Entradas</SelectItem>
                    <SelectItem value="debit">Apenas Saídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statement */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando extrato...</span>
            </CardContent>
          </Card>
        ) : statement.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Sem extratos recentes</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-6">
              {statement.map((daily) => (
                <Card key={daily.date}>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle className="text-lg">{formatDate(daily.date)}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground">Saldo Inicial do dia</p>
                          <p className="font-semibold">{formatCurrency(daily.initial_balance)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Saldo Final do dia</p>
                          <p className="font-semibold">{formatCurrency(daily.final_balance)}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {daily.transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
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
                              <div className="flex items-center space-x-2">
                                <p className="text-sm text-muted-foreground">{formatTime(transaction.created_at)}</p>
                                <Badge
                                  variant={transaction.type === "credit" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {transaction.type === "credit" ? "Entrada" : "Saída"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold text-lg ${
                                transaction.type === "credit" ? "text-green-600" : "text-red-600"
                              }`}
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
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 pt-4">
                <Button onClick={() => fetchStatement(currentPage - 1)} disabled={currentPage === 1}>
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button onClick={() => fetchStatement(currentPage + 1)} disabled={currentPage === totalPages}>
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}
