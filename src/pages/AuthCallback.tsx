import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // When the component mounts, the onAuthStateChange listener in AuthContext
    // will handle the SIGNED_IN event. Once the user is set, we can redirect.
    if (user) {
      // Here, you could add logic to check if the user has completed onboarding before.
      // For now, we'll always redirect to onboarding after verification.
      navigate('/onboarding');
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Verifying your account...</h1>
        <p className="mt-2 text-gray-600">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 