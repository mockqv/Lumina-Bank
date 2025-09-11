"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, ArrowLeft } from "lucide-react"
import { loginSchema, type LoginData } from "@/lib/validation"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    try {
      setError("")
      // Simulate login API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock login logic - replace with actual auth service
      if (data.email === "admin@lumina.com" && data.password === "password") {
        router.push("/dashboard")
      } else {
        setError("Email ou senha incorretos")
      }
    } catch (error) {
      setError("Erro interno do servidor. Tente novamente.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/30 to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao início
          </Link>
        </div>

        <Card className="border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">L</span>
              </div>
              <span className="text-2xl font-bold text-primary">Lumina Bank</span>
            </div>
            <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
            <CardDescription>Entre na sua conta para acessar seus serviços bancários</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" {...register("email")} className="h-11" />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  {...register("password")}
                  className="h-11"
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Conexão segura e criptografada</span>
            </div>

            <div className="text-center space-y-2">
              <Link href="#" className="text-sm text-primary hover:underline">
                Esqueceu sua senha?
              </Link>
              <div className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Crie uma agora
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
