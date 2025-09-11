"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, CreditCard, Send, Receipt, Settings, LogOut, Menu, Bell, User, HelpCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { getAccounts, type Account } from "@/services/accountService"
import { useEffect } from "react"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const { user, logout, loading } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (user) {
      getAccounts().then(setAccounts)
    }
  }, [user])

  const handleLogout = async () => {
    await logout()
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase()
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Transferências", href: "/transfer", icon: Send },
    { name: "PIX", href: "/pix", icon: CreditCard },
    { name: "Extratos", href: `/statement/${accounts[0]?.id}`, icon: Receipt, disabled: accounts.length === 0 },
    { name: "Configurações", href: "/settings", icon: Settings },
  ]

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">L</span>
          </div>
          <span className="text-xl font-bold text-primary">Lumina Bank</span>
        </div>
      </div>

      <div className="mb-6 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">{user ? getInitials(user.full_name) : ""}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="ghost" size="sm" className="justify-start h-8 px-2">
            <Link href="/profile">
              <User className="mr-1 h-3 w-3" />
              <span className="text-xs">Perfil</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="justify-start h-8 px-2">
            <Link href="/settings">
              <Settings className="mr-1 h-3 w-3" />
              <span className="text-xs">Config</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="justify-start h-8 px-2">
            <HelpCircle className="mr-1 h-3 w-3" />
            <span className="text-xs">Ajuda</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start h-8 px-2 text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-1 h-3 w-3" />
            <span className="text-xs">Sair</span>
          </Button>
        </div>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.disabled ? "#" : item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={onItemClick}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50 bg-background border-r border-border">
          <div className="flex flex-col flex-1 min-h-0 p-4">
            <SidebarContent />
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex flex-col flex-1 md:ml-64">
          {/* Header */}
          <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-4 py-4 flex items-center justify-between">
              {/* Mobile Menu and Logo */}
              <div className="flex items-center space-x-4">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64">
                    <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
                  </SheetContent>
                </Sheet>

                <Link href="/dashboard" className="flex items-center space-x-2 md:hidden">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">L</span>
                  </div>
                  <span className="text-xl font-bold text-primary">Lumina Bank</span>
                </Link>
              </div>

import { ThemeToggle } from "./theme-toggle"

              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
                  <span className="sr-only">Notifications</span>
                </Button>

                <div className="hidden md:flex items-center space-x-2 text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user ? getInitials(user.full_name) : ""}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user?.full_name}</span>
                </div>

                {/* Mobile user dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="md:hidden">
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">{user ? getInitials(user.full_name) : ""}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Ajuda</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-4 py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
