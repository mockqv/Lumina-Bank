import { render, screen } from '@testing-library/react';
import ProfilePage from '@/app/profile/page';
import { useAuth } from '@/contexts/AuthContext';
import '@testing-library/jest-dom';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Profile Page', () => {
  it('renders user information and a logout button', () => {
    // Arrange
    const mockUser = {
      id: 'user-1',
      full_name: 'John Doe',
      email: 'john.doe@example.com',
    };
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      checkUserStatus: jest.fn(),
    });

    // Act
    render(<ProfilePage />);

    // Assert
    expect(screen.getByDisplayValue(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/john.doe@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument();
  });

  it('renders a loading state when user is null', () => {
    // Arrange
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      checkUserStatus: jest.fn(),
    });

    // Act
    render(<ProfilePage />);

    // Assert
    expect(screen.getByText(/carregando perfil.../i)).toBeInTheDocument();
  });
});
