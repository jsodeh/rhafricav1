import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { translateError } from "@/lib/errorHandling";

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
  // Role resolution
  resolvedRole: 'admin' | 'agent' | 'owner' | 'professional' | 'buyer' | 'renter' | 'user';
  roleReady: boolean;
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
  const [roleReady, setRoleReady] = useState(false);
  const [resolvedRole, setResolvedRole] = useState<'admin' | 'agent' | 'owner' | 'professional' | 'buyer' | 'renter' | 'user'>('user');

  const normalizeAccountType = (value?: string | null): typeof resolvedRole => {
    const v = (value || '').toLowerCase();
    if (v.includes('admin') || v === 'super_admin') return 'admin';
    if (v.includes('agent')) return 'agent';
    if (v.includes('owner')) return 'owner';
    if (v.includes('professional') || v.includes('service')) return 'professional';
    if (v.includes('renter')) return 'renter';
    if (v.includes('buyer') || v.includes('premium')) return 'buyer';
    return 'user';
  };

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

  // Hydrate/override accountType and related profile fields from user_profiles table
  const refreshUserFromProfile = useCallback(async (userId: string) => {
    try {
      setRoleReady(false);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, phone, avatar_url, account_type')
        .eq('user_id', userId)
        .single();
      clearTimeout(timeout);

      if (profile) {
        setUser(prev => prev ? {
          ...prev,
          name: profile.full_name || prev.name,
          phone: profile.phone || prev.phone,
          profilePhoto: profile.avatar_url || prev.profilePhoto,
          accountType: profile.account_type || prev.accountType,
        } : prev);
        setResolvedRole(normalizeAccountType(profile.account_type));
        // Self-heal: if DB shows 'buyer' but auth metadata indicates a stronger role, update once
        try {
          const { data: authUserData } = await supabase.auth.getUser();
          const authMetaType = authUserData?.user?.user_metadata?.accountType as string | undefined;
          const meta = normalizeAccountType(authMetaType);
          if ((profile.account_type === 'buyer') && meta !== 'buyer') {
            await supabase.from('user_profiles').update({ account_type: meta }).eq('user_id', userId);
            setResolvedRole(meta);
          }
        } catch {}
      } else {
        // No profile row yet; fall back to auth metadata
        try {
          const { data: authUserData } = await supabase.auth.getUser();
          const authMetaType = authUserData?.user?.user_metadata?.accountType as string | undefined;
          setResolvedRole(prev => normalizeAccountType(authMetaType) || prev);
        } catch {
          setResolvedRole(prev => normalizeAccountType(user?.accountType) || prev);
        }
      }
    } catch (err) {
      console.warn('refreshUserFromProfile failed:', err);
      try {
        const { data: authUserData } = await supabase.auth.getUser();
        const authMetaType = authUserData?.user?.user_metadata?.accountType as string | undefined;
        setResolvedRole(prev => normalizeAccountType(authMetaType) || prev);
      } catch {
        setResolvedRole(prev => normalizeAccountType(user?.accountType) || prev);
      }
    }
    setRoleReady(true);
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true; // Prevent state updates if component unmounts
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session?.user) {
          const user = convertSupabaseUser(session.user);
          setUser(user);
          setIsAuthenticated(true);
          // Allow routing immediately; refresh role asynchronously
          setRoleReady(true);
          refreshUserFromProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return; // Prevent updates if component unmounted
        
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const user = convertSupabaseUser(session.user);
          setUser(user);
          setIsAuthenticated(true);
          setRoleReady(true);
          refreshUserFromProfile(session.user.id);
          
          // Welcome notification will be handled by components that use useNotifications

        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setRoleReady(false);
          setResolvedRole('user');
        } else if (event === 'USER_UPDATED' && session?.user) {
          const user = convertSupabaseUser(session.user);
          setUser(user);
          await refreshUserFromProfile(session.user.id);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Listen for realtime profile changes to reflect role updates instantly
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('user-profile-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `user_id=eq.${user.id}`,
      }, (payload: any) => {
        const next = payload.new || payload.old;
        if (!next) return;
        setUser(prev => prev ? {
          ...prev,
          name: next.full_name ?? prev.name,
          phone: next.phone ?? prev.phone,
          profilePhoto: next.avatar_url ?? prev.profilePhoto,
          accountType: next.account_type ?? prev.accountType,
        } : prev);
        setResolvedRole(normalizeAccountType(next.account_type ?? user?.accountType));
        setRoleReady(true);
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [user?.id]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        const friendlyError = translateError(error);
        return { success: false, error: friendlyError.message };
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
      const friendlyError = translateError(error);
      return { success: false, error: friendlyError.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setResolvedRole('user');
      setRoleReady(false);
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

      // Use production URL for email redirect
      const redirectUrl = window.location.hostname === 'localhost' 
        ? `${window.location.origin}/auth/callback?type=signup`
        : `https://rhafrica.netlify.app/auth/callback?type=signup`;

      console.log('Signup attempt:', {
        email: userData.email,
        redirectTo: redirectUrl,
        userData: { ...userData, password: '[HIDDEN]' }
      });

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phone,
            accountType: accountType,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      console.log('Signup result:', { 
        user: data.user ? { id: data.user.id, email: data.user.email, confirmed: data.user.email_confirmed_at } : null,
        session: data.session ? 'Session created' : 'No session',
        error: error ? error.message : 'No error'
      });

      if (error) {
        console.error('Signup error:', error);
        const friendlyError = translateError(error);
        return { success: false, error: friendlyError.message };
      }

      if (data.user) {
        // Check if email confirmation is required
        if (!data.session && !data.user.email_confirmed_at) {
          console.log('User created, email confirmation required');
          return { success: true };
        } else if (data.session) {
          console.log('User created and signed in immediately (email confirmation disabled)');
          // Persist profile now since we have a session
          try {
            const normalized = normalizeAccountType(accountType);
            await supabase.from('user_profiles').upsert({
              user_id: data.user.id,
              email: data.user.email || undefined,
              full_name: `${userData.firstName} ${userData.lastName}`,
              phone: userData.phone,
              account_type: normalized,
            }, { onConflict: 'user_id' });
            if (normalized === 'agent') {
              try {
                await supabase.from('real_estate_agents').upsert({
                  user_id: data.user.id,
                  phone: userData.phone || null,
                  verification_status: 'pending' as any,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });
              } catch {}
            }
          } catch (e) {
            console.warn('Immediate signup profile upsert failed:', e);
          }
          return { success: true };
        }
        
        return { success: true };
      }

      return { success: false, error: 'Signup failed - no user created' };
    } catch (error: any) {
      console.error("Signup failed:", error);
      const friendlyError = translateError(error);
      return { success: false, error: friendlyError.message };
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
      console.log('Resending verification email to:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: window.location.hostname === 'localhost' 
            ? `${window.location.origin}/auth/callback?type=signup`
            : `https://rhafrica.netlify.app/auth/callback?type=signup`,
        }
      });

      if (error) {
        console.error('Resend verification error:', error);
        
        if (error.message.includes('Email rate limit exceeded')) {
          return { success: false, error: 'Please wait a few minutes before requesting another verification email.' };
        } else if (error.message.includes('User not found')) {
          return { success: false, error: 'No account found with this email address.' };
        }
        
        return { success: false, error: error.message };
      }

      console.log('Verification email resent successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Resend verification failed:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    resolvedRole,
    roleReady,
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
