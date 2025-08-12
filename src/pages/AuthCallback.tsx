import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, resolvedRole, roleReady } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your account...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          return;
        }

        // Check for specific auth events
        const type = searchParams.get('type');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');

        if (type === 'signup' || type === 'email_confirmation') {
          setMessage('Email confirmed successfully! Setting up your account...');
        } else if (type === 'recovery') {
          setMessage('Password reset verified. You can now set a new password.');
        } else if (accessToken && refreshToken) {
          setMessage('Authentication successful! Redirecting...');
        }

        // If we have a session, mark as success
        if (data.session) {
          setStatus('success');
          
          // Small delay for better UX
          setTimeout(() => {
            // For fresh signups, send to onboarding
            if (type === 'signup' || type === 'email_confirmation') {
              navigate('/onboarding');
              return;
            }
            // Otherwise wait until role is resolved and send to role home
            const to = resolvedRole === 'admin' ? '/admin-dashboard'
              : resolvedRole === 'agent' ? '/agent-dashboard'
              : resolvedRole === 'owner' ? '/owner-dashboard'
              : resolvedRole === 'professional' ? '/service-dashboard'
              : '/dashboard';
            navigate(to);
          }, 800);
        }
      } catch (error) {
        console.error('Unexpected auth callback error:', error);
        setStatus('error');
        setMessage('Something went wrong. Please try signing in again.');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, resolvedRole]);

  // Also handle when user state changes
  useEffect(() => {
    if (user && roleReady && status === 'loading') {
      setStatus('success');
      setMessage('Welcome back! Redirecting to your dashboard...');
      const to = resolvedRole === 'admin' ? '/admin-dashboard'
        : resolvedRole === 'agent' ? '/agent-dashboard'
        : resolvedRole === 'owner' ? '/owner-dashboard'
        : resolvedRole === 'professional' ? '/service-dashboard'
        : '/dashboard';
      setTimeout(() => navigate(to), 800);
    }
  }, [user, roleReady, resolvedRole, navigate, status]);

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />;
      default:
        return <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {getIcon()}
          <h1 className={`text-2xl font-semibold mb-2 ${getStatusColor()}`}>
            {status === 'success' ? 'Success!' : status === 'error' ? 'Authentication Failed' : 'Processing...'}
          </h1>
          <p className="text-gray-600 mb-4">{message}</p>
          
          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Go to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 