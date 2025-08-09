import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AuthConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token) {
          setStatus('error');
          setMessage('Invalid confirmation link. Please try again.');
          return;
        }

        // Verify the email confirmation
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any || 'email',
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setMessage('Email confirmation failed. The link may have expired.');
          return;
        }

        setStatus('success');
        setMessage('Email confirmed successfully! Welcome to Real Estate Hotspot.');

        // Redirect to onboarding after successful confirmation
        setTimeout(() => {
          navigate('/onboarding');
        }, 2000);

      } catch (error) {
        console.error('Unexpected confirmation error:', error);
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    confirmEmail();
  }, [navigate, searchParams]);

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
            {status === 'success' ? 'Email Confirmed!' : status === 'error' ? 'Confirmation Failed' : 'Confirming Email...'}
          </h1>
          <p className="text-gray-600 mb-4">{message}</p>
          
          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => navigate('/signup')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Signing Up Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Go to Home
              </button>
            </div>
          )}
          
          {status === 'success' && (
            <p className="text-sm text-gray-500">
              Redirecting to complete your profile setup...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthConfirm;