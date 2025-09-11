"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MainLayout } from "@/components/main-layout"
import { Loader2, Send, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"
import { formatCPF, formatCNPJ } from "@/lib/validation"

const pixTransferSchema = z.object({
  pixKey: z.string().min(1, "A chave PIX é obrigatória"),
  amount: z.coerce
    .number({ invalid_type_error: "Valor deve ser um número" })
    .positive("O valor deve ser positivo")
    .max(50000, "Valor máximo de R$ 50.000,00 por transferência"),
  description: z.string().max(140, "Descrição deve ter no máximo 140 caracteres").optional(),
})

type PixTransferData = z.infer<typeof pixTransferSchema>

export default function TransferPage() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [step, setStep] = useState<"form" | "confirm" | "success">("form")
  const [transferData, setTransferData] = useState<PixTransferData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PixTransferData>({
    resolver: zodResolver(pixTransferSchema),
  })

  const watchedAmount = watch("amount")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatPixKey = (key: string) => {
    const cleanKey = key.replace(/\D/g, "")
    if (cleanKey.length === 11) {
      return formatCPF(cleanKey)
    } else if (cleanKey.length === 14) {
      return formatCNPJ(cleanKey)
    }
    return key
  }

  const onSubmit = async (data: PixTransferData) => {
    setError("")
    setTransferData(data)
    setStep("confirm")
  }

  const confirmTransfer = async () => {
    if (!transferData) return

    try {
      setError("")
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock success
      setStep("success")
      setSuccess("Transferência realizada com sucesso!")
    } catch (error) {
      setError("Erro na transferência. Tente novamente.")
      setStep("form")
    }
  }

  const startNewTransfer = () => {
    setStep("form")
    setTransferData(null)
    setSuccess("")
    setError("")
    reset()
  }

  if (step === "success") {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Transferência Realizada!</h1>
            <p className="text-muted-foreground">Sua transferência PIX foi processada com sucesso</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor transferido:</span>
                <span className="font-bold text-lg">{formatCurrency(transferData?.amount || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Chave PIX:</span>
                <span className="font-medium">{formatPixKey(transferData?.pixKey || "")}</span>
              </div>
              {transferData?.description && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Descrição:</span>
                  <span className="font-medium">{transferData.description}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Data:</span>
                <span className="font-medium">{new Date().toLocaleString("pt-BR")}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={startNewTransfer} className="flex-1">
              Nova Transferência
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="flex-1">
              Imprimir Comprovante
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (step === "confirm") {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Confirmar Transferência</h1>
            <p className="text-muted-foreground">Revise os dados antes de confirmar</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span>Confirme os dados da transferência</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-muted-foreground">Chave PIX do destinatário:</span>
                  <span className="font-medium">{formatPixKey(transferData?.pixKey || "")}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-bold text-2xl text-primary">{formatCurrency(transferData?.amount || 0)}</span>
                </div>
                {transferData?.description && (
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-muted-foreground">Descrição:</span>
                    <span className="font-medium">{transferData.description}</span>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep("form")} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={confirmTransfer} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Confirmar Transferência
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transferência PIX</h1>
          <p className="text-muted-foreground">Envie dinheiro de forma rápida e segura</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Nova Transferência</span>
            </CardTitle>
            <CardDescription>Preencha os dados do destinatário e o valor a ser transferido</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave PIX do Destinatário</Label>
                <Input
                  id="pixKey"
                  placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                  {...register("pixKey")}
                  className="h-11"
                />
                {errors.pixKey && <p className="text-sm text-destructive">{errors.pixKey.message}</p>}
                <p className="text-xs text-muted-foreground">
                  Digite a chave PIX do destinatário. Pode ser CPF, CNPJ, email, telefone ou chave aleatória.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="50000"
                    placeholder="0,00"
                    {...register("amount")}
                    className="h-11 pl-10"
                  />
                </div>
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                {watchedAmount && (
                  <p className="text-sm text-muted-foreground">Valor: {formatCurrency(Number(watchedAmount) || 0)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Adicione uma descrição para a transferência"
                  {...register("description")}
                  className="resize-none"
                  rows={3}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                <p className="text-xs text-muted-foreground">Máximo 140 caracteres</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Transferência segura e instantânea via PIX</span>
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Continuar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
