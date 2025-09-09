import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import '@testing-library/jest-dom';

// Mock useRouter since it's used in the component
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

describe('Login Page', () => {
  it('renders the login form', () => {
    render(<LoginPage />);

    // Check for the main title
    expect(screen.getByText(/Lumina Bank/i)).toBeInTheDocument();

    // Check for form labels
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();

    // Check for the submit button
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });
});
