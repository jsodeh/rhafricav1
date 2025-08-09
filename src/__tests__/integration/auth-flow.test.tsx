import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
jest.mock('@/integrations/supabase/client');
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful auth responses by default
    mockSupabase.auth = {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      verifyOtp: jest.fn(),
      resend: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      }),
      updateUser: jest.fn()
    } as any;
  });

  describe('Login Flow', () => {
    it('should handle successful login', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          accountType: 'Premium Buyer'
        },
        email_confirmed_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null
      });

      renderWithProviders(<Login />);

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('should handle login errors', async () => {
      const user = userEvent.setup();
      
      mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      });

      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
      });
    });

    it('should handle password reset', async () => {
      const user = userEvent.setup();
      
      mockSupabase.auth.resetPasswordForEmail = jest.fn().mockResolvedValue({
        data: {},
        error: null
      });

      renderWithProviders(<Login />);

      // Click forgot password link
      const forgotPasswordLink = screen.getByText(/forgot password/i);
      await user.click(forgotPasswordLink);

      // Fill in reset form
      const resetEmailInput = screen.getByLabelText(/email/i);
      const sendResetButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(resetEmailInput, 'test@example.com');
      await user.click(sendResetButton);

      await waitFor(() => {
        expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          expect.objectContaining({
            redirectTo: expect.stringContaining('/auth/reset-password')
          })
        );
      });
    });
  });

  describe('Signup Flow', () => {
    it('should handle successful signup', async () => {
      const user = userEvent.setup();
      
      mockSupabase.auth.signUp = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'new-user-id',
            email: 'newuser@example.com',
            email_confirmed_at: null
          },
          session: null
        },
        error: null
      });

      renderWithProviders(<Signup />);

      // Fill in step 1
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/phone/i), '+234-123-456-7890');
      
      const userTypeSelect = screen.getByLabelText(/i am a/i);
      await user.selectOptions(userTypeSelect, 'buyer');

      await user.click(screen.getByRole('button', { name: /next/i }));

      // Fill in step 2
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'password123',
          options: {
            data: {
              full_name: 'John Doe',
              phone: '+234-123-456-7890',
              accountType: 'Premium Buyer'
            },
            emailRedirectTo: expect.stringContaining('/auth/callback?type=signup')
          }
        });
      });

      // Should show verification screen
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });

    it('should validate form fields', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Signup />);

      // Try to proceed without filling required fields
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Signup />);

      // Fill in step 1
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/phone/i), '+234-123-456-7890');
      
      const userTypeSelect = screen.getByLabelText(/i am a/i);
      await user.selectOptions(userTypeSelect, 'buyer');

      await user.click(screen.getByRole('button', { name: /next/i }));

      // Fill in mismatched passwords
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should handle signup errors', async () => {
      const user = userEvent.setup();
      
      mockSupabase.auth.signUp = jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' }
      });

      renderWithProviders(<Signup />);

      // Fill in complete form
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/phone/i), '+234-123-456-7890');
      
      const userTypeSelect = screen.getByLabelText(/i am a/i);
      await user.selectOptions(userTypeSelect, 'buyer');

      await user.click(screen.getByRole('button', { name: /next/i }));

      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument();
      });
    });

    it('should handle email verification resend', async () => {
      const user = userEvent.setup();
      
      mockSupabase.auth.signUp = jest.fn().mockResolvedValue({
        data: {
          user: { id: 'new-user-id', email: 'newuser@example.com' },
          session: null
        },
        error: null
      });

      mockSupabase.auth.resend = jest.fn().mockResolvedValue({
        data: {},
        error: null
      });

      renderWithProviders(<Signup />);

      // Complete signup flow
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/phone/i), '+234-123-456-7890');
      
      const userTypeSelect = screen.getByLabelText(/i am a/i);
      await user.selectOptions(userTypeSelect, 'buyer');

      await user.click(screen.getByRole('button', { name: /next/i }));

      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Should show verification screen
      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });

      // Click resend verification
      const resendButton = screen.getByRole('button', { name: /resend verification email/i });
      await user.click(resendButton);

      await waitFor(() => {
        expect(mockSupabase.auth.resend).toHaveBeenCalledWith({
          type: 'signup',
          email: 'newuser@example.com',
          options: {
            emailRedirectTo: expect.stringContaining('/auth/callback?type=signup')
          }
        });
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // HTML5 validation should prevent submission
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should require all fields in signup', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Signup />);

      // Try to submit with empty fields
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });
  });
});