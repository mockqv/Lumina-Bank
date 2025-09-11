"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Copy, Check } from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { createTransferKey } from "@/services/transferKeyService"

const receiveSchema = z.object({
  amount: z.coerce.number().positive({ message: "O valor deve ser positivo." }),
})

type ReceiveData = z.infer<typeof receiveSchema>

export default function ReceivePage() {
  const [error, setError] = useState("")
  const [generatedKey, setGeneratedKey] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReceiveData>({
    resolver: zodResolver(receiveSchema),
  })

  const onSubmit = async (data: ReceiveData) => {
    try {
      setError("")
      setGeneratedKey("")
      const result = await createTransferKey({ amount: data.amount })
      setGeneratedKey(result.key)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred.")
      }
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedKey)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Receber Dinheiro</CardTitle>
            <CardDescription>
              Gere uma chave de transferência para receber um valor específico de outra pessoa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor a Receber (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...register("amount")}
                  className="h-11"
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>

              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  "Gerar Chave"
                )}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {generatedKey && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <Label>Chave Gerada</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input readOnly value={generatedKey} className="flex-1" />
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Compartilhe esta chave com a pessoa que vai te pagar. A chave é válida por 24 horas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
