import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountType: string;
  profilePhoto?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (userData: any) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Supabase user to our User interface
  const convertSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      phone: supabaseUser.phone || supabaseUser.user_metadata?.phone || undefined,
      accountType: supabaseUser.user_metadata?.accountType || 'Basic User',
      profilePhoto: supabaseUser.user_metadata?.profilePhoto || supabaseUser.user_metadata?.avatar_url || undefined,
      emailVerified: supabaseUser.email_confirmed_at ? true : false,
    };
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user = convertSupabaseUser(session.user);
          setUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const user = convertSupabaseUser(session.user);
          setUser(user);
          setIsAuthenticated(true);
          
          // Welcome notification will be handled by components that use useNotifications

        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        } else if (event === 'USER_UPDATED' && session?.user) {
          const user = convertSupabaseUser(session.user);
          setUser(user);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const user = convertSupabaseUser(data.user);
        setUser(user);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signup = async (userData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Map userType to proper accountType
      let accountType = "Basic User";
      switch (userData.userType) {
        case "buyer":
          accountType = "Premium Buyer";
          break;
        case "renter":
          accountType = "Property Renter";
          break;
        case "agent":
          accountType = "Real Estate Agent";
          break;
        case "owner":
          accountType = "Property Owner";
          break;
        case "professional":
          accountType = "Service Professional";
          break;
        default:
          accountType = "Basic User";
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phone,
            accountType: accountType,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Don't automatically sign in - wait for email verification
        return { success: true };
      }

      return { success: false, error: 'Signup failed' };
    } catch (error) {
      console.error("Signup failed:", error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.name,
          phone: data.phone,
          accountType: data.accountType,
          profilePhoto: data.profilePhoto,
        },
      });

      if (error) {
        console.error('Profile update error:', error);
        return { success: false, error: error.message };
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...data } : null);
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset failed:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const verifyEmail = async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) {
        console.error('Email verification error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Email verification failed:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const resendVerification = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('Resend verification error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Resend verification failed:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
    updateProfile,
    resetPassword,
    verifyEmail,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
