import '@testing-library/jest-dom';

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock do NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADM Master',
      },
    },
    status: 'authenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock de ícones
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Search: () => <div data-testid="search-icon" />,
  User: () => <div data-testid="user-icon" />,
  DollarSign: () => <div data-testid="dollar-icon" />,
}));
