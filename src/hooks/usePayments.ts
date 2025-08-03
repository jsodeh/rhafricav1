import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentData {
  amount: number;
  email: string;
  reference: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  reference?: string;
  transaction_id?: string;
}

export const usePayments = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const initializePayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
    setIsProcessing(true);
    
    try {
      // Check if Paystack is available
      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        const paystack = new (window as any).PaystackPop();
        
        return new Promise((resolve) => {
          paystack.newTransaction({
            key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
            amount: paymentData.amount * 100, // Convert to kobo
            email: paymentData.email,
            reference: paymentData.reference,
            callback: (response: any) => {
              if (response.status === 'success') {
                resolve({
                  success: true,
                  message: 'Payment successful',
                  reference: response.reference,
                  transaction_id: response.trans,
                });
              } else {
                resolve({
                  success: false,
                  message: 'Payment failed',
                });
              }
            },
            onCancel: () => {
              resolve({
                success: false,
                message: 'Payment cancelled',
              });
            },
          });
        });
      } else {
        // Fallback for development/testing
        console.log('Paystack not available, simulating payment...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
        
        return {
          success: true,
          message: 'Payment simulated successfully',
          reference: paymentData.reference,
          transaction_id: `sim_${Date.now()}`,
        };
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        message: 'Payment initialization failed',
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const processPropertyBooking = async (
    propertyId: string,
    amount: number,
    bookingDate: string,
    notes?: string
  ): Promise<PaymentResponse> => {
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    const reference = `booking_${propertyId}_${Date.now()}`;
    
    const paymentData: PaymentData = {
      amount,
      email: user.email,
      reference,
      metadata: {
        property_id: propertyId,
        user_id: user.id,
        booking_date: bookingDate,
        notes,
        type: 'property_booking',
      },
    };

    return initializePayment(paymentData);
  };

  const processEscrowPayment = async (
    propertyId: string,
    amount: number,
    sellerId: string,
    description: string
  ): Promise<PaymentResponse> => {
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    const reference = `escrow_${propertyId}_${Date.now()}`;
    
    const paymentData: PaymentData = {
      amount,
      email: user.email,
      reference,
      metadata: {
        property_id: propertyId,
        buyer_id: user.id,
        seller_id: sellerId,
        description,
        type: 'escrow_payment',
      },
    };

    return initializePayment(paymentData);
  };

  const verifyPayment = async (reference: string): Promise<PaymentResponse> => {
    try {
      // In a real implementation, you would verify with your backend
      // For now, we'll simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Payment verified successfully',
        reference,
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: 'Payment verification failed',
      };
    }
  };

  return {
    isProcessing,
    initializePayment,
    processPropertyBooking,
    processEscrowPayment,
    verifyPayment,
  };
}; 