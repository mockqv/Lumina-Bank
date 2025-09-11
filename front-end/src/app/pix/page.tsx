"use client"

import { useState } from "react"
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
import { validateCPF } from "@/lib/validation"

const createPixKeySchema = z.object({
  key_type: z.enum(["cpf", "email", "phone", "random"], {
    required_error: "Selecione o tipo de chave",
  }),
  key_value: z.string().optional(),
})

type CreatePixKeyData = z.infer<typeof createPixKeySchema>

// Mock data
const mockKeys = [
  {
    id: "1",
    key_type: "cpf",
    key_value: "123.456.789-00",
    status: "active",
    created_at: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    key_type: "email",
    key_value: "joao@email.com",
    status: "active",
    created_at: "2024-01-05T15:30:00Z",
  },
  {
    id: "3",
    key_type: "random",
    key_value: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    status: "inactive",
    created_at: "2024-01-01T09:15:00Z",
  },
]

export default function PixPage() {
  const [keys, setKeys] = useState(mockKeys)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

  const keyType = watch("key_type")
  const keyValue = watch("key_value")

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

      // Validate key value
      if (data.key_type !== "random" && !validateKeyValue(data.key_type, data.key_value || "")) {
        setError("Valor da chave inválido para o tipo selecionado")
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock success
      const newKey = {
        id: Date.now().toString(),
        key_type: data.key_type,
        key_value: data.key_type === "random" ? "a1b2c3d4-e5f6-7890-abcd-ef1234567890" : data.key_value || "",
        status: "active" as const,
        created_at: new Date().toISOString(),
      }

      setKeys([...keys, newKey])
      setSuccess("Chave PIX criada com sucesso!")
      reset()
    } catch (error) {
      setError("Erro ao criar chave PIX. Tente novamente.")
    }
  }

  const handleStatusChange = async (keyId: string) => {
    try {
      setError("")
      const updatedKeys = keys.map((key) =>
        key.id === keyId
          ? { ...key, status: key.status === "active" ? ("inactive" as const) : ("active" as const) }
          : key,
      )
      setKeys(updatedKeys)
    } catch (error) {
      setError("Erro ao atualizar status da chave.")
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
                    <Switch
                      checked={key.status === "active"}
                      onCheckedChange={() => handleStatusChange(key.id)}
                      aria-label={`Toggle ${key.key_type} key status`}
                    />
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
