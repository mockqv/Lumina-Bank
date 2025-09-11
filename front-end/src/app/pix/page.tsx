"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/main-layout"
import { Plus, Key, Smartphone, Mail, CreditCard, Shuffle, Loader2, CheckCircle, Copy } from "lucide-react"
import { getPixKeys, createPixKey, updatePixKeyStatus, deletePixKey, type PixKey } from "@/services/pixService"
import { createTransferKey } from "@/services/transferKeyService"
import { validateCPF } from "@/lib/validation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { QrCode } from "lucide-react"

const createPixKeySchema = z.object({
  key_type: z.enum(["cpf", "email", "phone", "random"], {
    required_error: "Selecione o tipo de chave",
  }),
  key_value: z.string().optional(),
})

type CreatePixKeyData = z.infer<typeof createPixKeySchema>

const createChargeSchema = z.object({
  amount: z.coerce.number().min(0.01, "O valor deve ser maior que zero."),
  expires_in: z.string().default("1d"),
})

type CreateChargeData = z.infer<typeof createChargeSchema>

export default function PixPage() {
  const [keys, setKeys] = useState<PixKey[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [generatedKey, setGeneratedKey] = useState<{ key: string } | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePixKeyData>({
    resolver: zodResolver(createPixKeySchema),
  })

  const {
    register: registerCharge,
    handleSubmit: handleSubmitCharge,
    reset: resetCharge,
    formState: { errors: errorsCharge, isSubmitting: isSubmittingCharge },
  } = useForm<CreateChargeData>({
    resolver: zodResolver(createChargeSchema),
  })

  const keyType = watch("key_type")
  const keyValue = watch("key_value")

  const fetchKeys = async () => {
    try {
      setIsLoading(true)
      const fetchedKeys = await getPixKeys()
      setKeys(fetchedKeys)
    } catch (error) {
      setError("Erro ao carregar chaves PIX.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [])

  const getKeyTypeIcon = (type: string) => {
    switch (type) {
      case "cpf":
        return <CreditCard className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "phone":
        return <Smartphone className="h-4 w-4" />
      case "random":
        return <Shuffle className="h-4 w-4" />
      default:
        return <Key className="h-4 w-4" />
    }
  }

  const getKeyTypeLabel = (type: string) => {
    switch (type) {
      case "cpf":
        return "CPF"
      case "email":
        return "Email"
      case "phone":
        return "Telefone"
      case "random":
        return "Aleatória"
      default:
        return type
    }
  }

  const validateKeyValue = (type: string, value: string) => {
    if (!value && type !== "random") return false

    switch (type) {
      case "cpf":
        const cleanCPF = value.replace(/\D/g, "")
        return validateCPF(cleanCPF)
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      case "phone":
        const cleanPhone = value.replace(/\D/g, "")
        return cleanPhone.length >= 10 && cleanPhone.length <= 11
      case "random":
        return true
      default:
        return false
    }
  }

  const handleCreateKey = async (data: CreatePixKeyData) => {
    try {
      setError("")
      setSuccess("")

      if (data.key_type !== "random" && !validateKeyValue(data.key_type, data.key_value || "")) {
        setError("Valor da chave inválido para o tipo selecionado")
        return
      }

      await createPixKey(data)
      setSuccess("Chave PIX criada com sucesso!")
      reset()
      fetchKeys()
    } catch (error) {
      setError("Erro ao criar chave PIX. Tente novamente.")
    }
  }

  const handleStatusChange = async (keyId: string, currentStatus: "active" | "inactive") => {
    try {
      setError("")
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      await updatePixKeyStatus(keyId, newStatus)
      fetchKeys()
    } catch (error) {
      setError("Erro ao atualizar status da chave.")
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta chave PIX?")) {
      try {
        setError("")
        await deletePixKey(keyId)
        fetchKeys()
        setSuccess("Chave PIX deletada com sucesso!")
      } catch (error) {
        setError("Erro ao deletar a chave PIX.")
      }
    }
  }

  const handleCreateCharge = async (data: CreateChargeData) => {
    try {
      setError("")
      setSuccess("")
      const newKey = await createTransferKey(data)
      setGeneratedKey(newKey)
      setSuccess("Cobrança gerada com sucesso!")
      resetCharge()
    } catch (error) {
      setError("Erro ao gerar cobrança.")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess("Chave copiada para a área de transferência!")
    setTimeout(() => setSuccess(""), 3000)
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Chaves PIX</h1>
          <p className="text-muted-foreground">Crie e gerencie suas chaves PIX para receber transferências</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Create New Key */}
        <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Criar Nova Chave</span>
            </CardTitle>
            <CardDescription>Adicione uma nova chave PIX para receber transferências</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleCreateKey)} className="space-y-6">
              <div className="space-y-2">
                <Label>Tipo de Chave</Label>
                <Select onValueChange={(value) => setValue("key_type", value as any)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o tipo de chave" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>CPF</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="phone">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Telefone</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="random">
                      <div className="flex items-center space-x-2">
                        <Shuffle className="h-4 w-4" />
                        <span>Chave Aleatória</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.key_type && <p className="text-sm text-destructive">{errors.key_type.message}</p>}
              </div>

              {keyType && keyType !== "random" && (
                <div className="space-y-2">
                  <Label htmlFor="key_value">Valor da Chave</Label>
                  <Input
                    id="key_value"
                    placeholder={
                      keyType === "cpf" ? "000.000.000-00" : keyType === "email" ? "seu@email.com" : "(11) 99999-9999"
                    }
                    {...register("key_value")}
                    className="h-11"
                  />
                  {errors.key_value && <p className="text-sm text-destructive">{errors.key_value.message}</p>}
                  {keyType === "cpf" && keyValue && (
                    <p className="text-xs text-muted-foreground">
                      {validateKeyValue("cpf", keyValue) ? "✓ CPF válido" : "✗ CPF inválido"}
                    </p>
                  )}
                </div>
              )}

              {keyType === "random" && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Uma chave aleatória será gerada automaticamente pelo sistema. Ela é única e não pode ser
                    personalizada.
                  </p>
                </div>
              )}

              <Button type="submit" disabled={isSubmitting || !keyType} className="w-full h-11">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando chave...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Chave
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>Gerar Cobrança</span>
            </CardTitle>
            <CardDescription>Crie um QR Code para receber um valor específico.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitCharge(handleCreateCharge)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor da Cobrança</Label>
                <Input id="amount" type="number" step="0.01" {...registerCharge("amount")} className="h-11" />
                {errorsCharge.amount && <p className="text-sm text-destructive">{errorsCharge.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tempo de Expiração</Label>
                <Select onValueChange={(value) => setValue("expires_in", value as any)} defaultValue="1d">
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione a expiração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15m">15 minutos</SelectItem>
                    <SelectItem value="30m">30 minutos</SelectItem>
                    <SelectItem value="1h">1 hora</SelectItem>
                    <SelectItem value="1d">1 dia</SelectItem>
                    <SelectItem value="7d">7 dias</SelectItem>
                    <SelectItem value="30d">30 dias</SelectItem>
                    <SelectItem value="permanent">Permanente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isSubmittingCharge} className="w-full h-11">
                {isSubmittingCharge ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Gerar Cobrança
                  </>
                )}
              </Button>
            </form>
            {generatedKey && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">QR Code gerado!</p>
                <p className="text-xs text-muted-foreground">Chave: {generatedKey.key}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => copyToClipboard(generatedKey.key)}>
                  <Copy className="mr-2 h-3 w-3" />
                  Copiar Chave
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {/* Existing Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Suas Chaves PIX</span>
            </CardTitle>
            <CardDescription>Gerencie suas chaves PIX existentes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando chaves...</span>
              </div>
            ) : keys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma chave PIX cadastrada</p>
                <p className="text-sm text-muted-foreground">Crie sua primeira chave para começar a receber PIX</p>
              </div>
            ) : (
              <div className="space-y-4">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {getKeyTypeIcon(key.key_type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{getKeyTypeLabel(key.key_type)}</p>
                          <Badge variant={key.status === "active" ? "default" : "secondary"}>
                            {key.status === "active" ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-muted-foreground font-mono">{key.key_value}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(key.key_value)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Criada em {new Date(key.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={key.status === "active"}
                        onCheckedChange={() => handleStatusChange(key.id, key.status)}
                        aria-label={`Toggle ${key.key_type} key status`}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteKey(key.id)}
                      >
                        Deletar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
