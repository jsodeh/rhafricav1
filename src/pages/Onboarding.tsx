import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const onboardingData = {
  'Premium Buyer': [
    {
      image: '/path/to/buyer-image-1.png',
      title: 'Find Your Dream Home',
      description: 'Explore thousands of listings with advanced search filters to find the perfect property for you.',
    },
    {
      image: '/path/to/buyer-image-2.png',
      title: 'Connect with Top Agents',
      description: 'Get expert advice and assistance from our network of verified real estate agents.',
    },
  ],
  'Property Renter': [
    {
      image: '/path/to/renter-image-1.png',
      title: 'Discover Your Next Rental',
      description: 'Browse a wide selection of rental properties, from apartments to family homes.',
    },
    {
      image: '/path/to/renter-image-2.png',
      title: 'Manage Your Leases Easily',
      description: 'Keep track of your rental applications, lease agreements, and payments all in one place.',
    },
  ],
  'Real Estate Agent': [
    {
      image: '/path/to/agent-image-1.png',
      title: 'Grow Your Business',
      description: 'List properties, connect with clients, and manage your deals with our powerful agent tools.',
    },
    {
      image: '/path/to/agent-image-2.png',
      title: 'Showcase Your Expertise',
      description: 'Build your professional profile, highlight your specializations, and gather client reviews.',
    },
  ],
  'Property Owner': [
    {
      image: '/path/to/owner-image-1.png',
      title: 'List Your Property with Ease',
      description: 'Reach a vast audience of potential buyers and renters by listing your property on our platform.',
    },
    {
      image: '/path/to/owner-image-2.png',
      title: 'Manage Your Listings',
      description: 'Track views, inquiries, and offers for your properties through your owner dashboard.',
    },
  ],
  'Service Professional': [
    {
      image: '/path/to/professional-image-1.png',
      title: 'Offer Your Services',
      description: 'Connect with property owners and agents who need your expertise for their real estate projects.',
    },
    {
      image: '/path/to/professional-image-2.png',
      title: 'Build Your Reputation',
      description: 'Create a professional profile, showcase your work, and get reviews from satisfied clients.',
    },
  ],
  'Basic User': [
    {
      image: '/path/to/general-image-1.png',
      title: 'Welcome to the Future of Real Estate',
      description: 'Your journey to finding, selling, or renting property starts here. Let\'s get you set up.',
    },
    {
      image: '/path/to/general-image-2.png',
      title: 'Explore and Discover',
      description: 'Browse listings, learn about the market, and connect with professionals. Your dashboard is ready.',
    },
  ],
};

const Onboarding = () => {
  const { user, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const userType = user?.accountType || 'Basic User';
  const steps = onboardingData[userType] || onboardingData['Basic User'];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to dashboard or home
      window.location.href = '/dashboard';
    }
  };

  const handleSkip = () => {
    window.location.href = '/dashboard';
  };

  const handleCloseAccount = async () => {
    if (window.confirm('Are you sure you want to close your account? This action cannot be undone.')) {
      // Implement account deletion logic here
      await logout();
      window.location.href = '/';
    }
  };

  if (!steps || steps.length === 0) {
    return null;
  }

  const { image, title, description } = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full mx-4 overflow-hidden relative">
        <div className="absolute top-2 right-2">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}></div>
        
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-600 mb-6">{description}</p>
          
          <div className="flex justify-center mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${index === currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}
              ></div>
            ))}
          </div>

          <Button onClick={handleNext} className="w-full mb-3">
            {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
          </Button>
          
          <Button variant="link" onClick={handleCloseAccount} className="text-red-600 text-sm">
            Close Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 