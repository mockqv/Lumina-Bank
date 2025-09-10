"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-primary">Lumina Bank</h1>
        <p className="text-xl text-muted-foreground">Seu banco digital. Simples, rápido e seguro.</p>
      </div>
      <div className="mt-8 flex gap-4">
        <Link href="/login" passHref>
          <Button>Entrar</Button>
        </Link>
        <Link href="/register" passHref>
          <Button variant="secondary">Criar Conta</Button>
        </Link>
      </div>
    </div>
  );
}
