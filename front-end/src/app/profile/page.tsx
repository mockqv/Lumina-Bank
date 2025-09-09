"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logout } from '@/services/authService';

export default function ProfilePage() {
  const { user, checkUserStatus } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    // After logging out, we need to update the auth context state
    await checkUserStatus();
    // Redirect to login page
    router.push('/login');
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">Seu Perfil</h1>

      {user ? (
        <Card>
          <CardHeader>
            <CardTitle>{user.full_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p><strong>Email:</strong> {user.email}</p>
            <Button onClick={handleLogout} variant="destructive">
              Sair
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p>Carregando perfil...</p>
      )}
    </MainLayout>
  );
}
