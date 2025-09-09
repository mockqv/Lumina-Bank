import React from 'react';
import Link from 'next/link';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-muted/40 border-r p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-primary">Lumina Bank</h1>
        <nav className="mt-8 flex-1">
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="block p-2 rounded-md hover:bg-muted">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/profile" className="block p-2 rounded-md hover:bg-muted">
                Perfil
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
