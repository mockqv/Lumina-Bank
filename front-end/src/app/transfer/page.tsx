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
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getTransferKey } from "@/services/transferKeyService"
import { getPrimaryPixKeyByUserId } from "@/services/pixService"
import { createPixTransfer } from "@/services/transactionService"
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

import { getPixKeyDetails } from "@/services/pixService"
import { getAccountBalance } from "@/services/accountService"
import { Eye, EyeOff } from "lucide-react"

function TransferComponent() {
  const searchParams = useSearchParams()
  const transferKey = searchParams.get("key")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [step, setStep] = useState<"form" | "confirm" | "success">("form")
  const [transferData, setTransferData] = useState<PixTransferData | null>(null)
  const [keyDetails, setKeyDetails] = useState<any>(null)
  const [loadingKey, setLoadingKey] = useState(true)
  const [recipient, setRecipient] = useState<{ recipient_name: string } | null>(null)
  const [loadingRecipient, setLoadingRecipient] = useState(false)
  const [recipientError, setRecipientError] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const [showBalance, setShowBalance] = useState(false)


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<PixTransferData>({
    resolver: zodResolver(pixTransferSchema),
  })

  useEffect(() => {
    const fetchKeyDetails = async () => {
      if (transferKey) {
        try {
          setLoadingKey(true)
          const details = await getTransferKey(transferKey)
          if (details.is_used) {
            setError("Esta chave de transferência já foi utilizada.")
            return
          }
          const pixKey = await getPrimaryPixKeyByUserId(details.recipient_id)
          setKeyDetails({ ...details, recipient_pix_key: pixKey.key_value })
          setValue("amount", Number(details.amount))
          setValue("pixKey", pixKey.key_value)
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message)
          } else {
            setError("An unexpected error occurred while fetching key details.")
          }
        } finally {
          setLoadingKey(false)
        }
      } else {
        setLoadingKey(false)
      }
    }
    fetchKeyDetails()

    const fetchBalance = async () => {
        try {
            const data = await getAccountBalance();
            setBalance(parseFloat(data.balance));
        } catch (err) {
            console.error("Failed to fetch balance", err);
        }
    }
    fetchBalance();
  }, [transferKey, setValue])


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

  const handleVerifyKey = async () => {
    const pixKey = getValues("pixKey")
    if (!pixKey) {
      setRecipientError("Please enter a PIX key.")
      return
    }
    setLoadingRecipient(true)
    setRecipientError("")
    setRecipient(null)
    try {
      const details = await getPixKeyDetails(pixKey)
      setRecipient(details)
    } catch (err) {
      if (err instanceof Error) {
        setRecipientError(err.message)
      } else {
        setRecipientError("An unexpected error occurred.")
      }
    } finally {
      setLoadingRecipient(false)
    }
  }

  const onSubmit = async (data: PixTransferData) => {
    setError("")
    setTransferData(data)
    setStep("confirm")
  }

  const confirmTransfer = async () => {
    if (!transferData) return;

    try {
      setError("");
      await createPixTransfer({
        ...transferData,
        transferKey: transferKey || undefined,
      });
      setStep("success");
      setSuccess("Transferência realizada com sucesso!");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during the transfer.");
      }
      setStep("form");
    }
  };

  const startNewTransfer = () => {
    setStep("form")
    setTransferData(null)
    setSuccess("")
    setError("")
    reset()
  }

  if (loadingKey) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    )
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
                {keyDetails && (
                    <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-muted-foreground">Nome do destinatário:</span>
                        <span className="font-medium">{keyDetails.recipient_name}</span>
                    </div>
                )}
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
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Send className="h-5 w-5" />
                      <span>Nova Transferência</span>
                    </CardTitle>
                    <CardDescription>Preencha os dados do destinatário e o valor a ser transferido</CardDescription>
                </div>
                {balance !== null && (
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground">Seu Saldo</div>
                        <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold">
                                {showBalance ? formatCurrency(balance) : "••••••"}
                            </span>
                            <Button variant="ghost" size="icon" onClick={() => setShowBalance(!showBalance)}>
                                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
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
                <div className="flex items-center space-x-2">
                  <Input
                    id="pixKey"
                    placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                    {...register("pixKey")}
                    className="h-11 flex-1"
                    disabled={!!transferKey || loadingRecipient || !!recipient}
                  />
                  <Button type="button" onClick={handleVerifyKey} disabled={loadingRecipient || !!transferKey || !!recipient}>
                    {loadingRecipient ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
                  </Button>
                </div>
                {errors.pixKey && <p className="text-sm text-destructive">{errors.pixKey.message}</p>}
                {recipientError && <p className="text-sm text-destructive">{recipientError}</p>}
                {recipient && (
                    <div className="p-3 bg-muted/50 rounded-lg text-sm">
                        <span className="font-medium">Destinatário:</span> {recipient.recipient_name}
                    </div>
                )}
              </div>

              <fieldset disabled={!recipient && !transferKey} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      {...register("amount")}
                      onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        const sanitizedValue = value.replace(/[^0-9,.]/g, '').replace(',', '.');
                        const parts = sanitizedValue.split('.');
                        if (parts.length > 2) {
                            e.target.value = `${parts[0]}.${parts.slice(1).join('')}`;
                        } else {
                            e.target.value = sanitizedValue;
                        }
                      }}
                      className="h-11 pl-10"
                      disabled={!!transferKey}
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
              </fieldset>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Transferência segura e instantânea via PIX</span>
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isSubmitting || !!transferKey}>
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

export default function TransferPage() {
    return (
        <Suspense fallback={
            <MainLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </MainLayout>
        }>
            <TransferComponent />
        </Suspense>
    )
}
