"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { logout } from "@/services/authService"
import { updateUserSchema, type UpdateUserData, updateUser } from "@/services/userService"
import { MainLayout } from "@/components/main-layout"

export default function ProfilePage() {
  const { user, checkUserStatus } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateUserData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      phone: user?.phone || "",
    },
  })

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        phone: user.phone || "",
      })
    }
  }, [user, reset])

  const handleLogout = async () => {
    await logout()
    await checkUserStatus()
    router.push("/login")
  }

  const onSubmit = async (data: UpdateUserData) => {
    try {
      await updateUser(data)
      await checkUserStatus() // Refresh user data in context
      alert("Perfil atualizado com sucesso!")
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert("An unknown error occurred.")
      }
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <p>Carregando perfil...</p>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Seu Perfil</h1>
          <CardDescription>Veja e atualize suas informações pessoais.</CardDescription>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Atualizar Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input id="full_name" {...register("full_name")} defaultValue={user?.full_name || ""} />
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="tel" {...register("phone")} defaultValue={user?.phone || ""} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} disabled />
                <CardDescription>O email não pode ser alterado.</CardDescription>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} variant="destructive">
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
