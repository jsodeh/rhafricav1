// Paystack Integration for Real Estate Hotspot
interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number; // Amount in kobo (multiply by 100)
  reference: string;
  callback: (response: any) => void;
  onClose: () => void;
  metadata?: {
    [key: string]: any;
  };
}

interface PaymentData {
  id: string;
  propertyId?: string;
  userId: string;
  amount: number;
  type: 'booking' | 'deposit' | 'rent' | 'purchase' | 'advertising_package';
  status: 'pending' | 'success' | 'failed';
  reference: string;
  metadata?: any;
  createdAt: string;
}

class PaystackService {
  private _publicKey: string;

  constructor() {
    this._publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_paystack_public_key_here';
  }

  get publicKey(): string {
    return this._publicKey;
  }

  // Initialize Paystack payment
  async initializePayment(config: PaystackConfig): Promise<void> {
    const handler = (window as any).PaystackPop.setup({
      key: this._publicKey,
      email: config.email,
      amount: config.amount * 100, // Convert to kobo
      currency: 'NGN',
      ref: config.reference,
      callback: (response: any) => {
        config.callback(response);
      },
      onClose: () => {
        config.onClose();
      },
      metadata: {
        ...config.metadata,
        integration: 'real_estate_hotspot',
      },
    });

    handler.openIframe();
  }

  // Verify payment on server
  async verifyPayment(reference: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return { success: false, error: 'Payment verification failed' };
    }
  }

  // Format amount for display
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Generate unique reference
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `REH_${timestamp}_${random}`.toUpperCase();
  }
}

// Payment hooks for React components
export const usePayment = () => {
  const paystack = new PaystackService();

  const makePayment = async (
    email: string,
    amount: number,
    itemId: string, // Can be propertyId or packageId
    paymentType: 'booking' | 'deposit' | 'rent' | 'purchase' | 'advertising_package',
    metadata?: any
  ): Promise<{ success: boolean; reference?: string; error?: string }> => {
    return new Promise((resolve) => {
      const reference = paystack.generateReference();
      
      paystack.initializePayment({
        publicKey: paystack.publicKey,
        email,
        amount,
        reference,
        metadata: {
          itemId,
          paymentType,
          ...metadata,
        },
        callback: async (response: any) => {
          if (response.status === 'success') {
            // Verify payment on server
            const verification = await paystack.verifyPayment(reference);
            if (verification.success) {
              resolve({ success: true, reference });
            } else {
              resolve({ success: false, error: verification.error });
            }
          } else {
            resolve({ success: false, error: 'Payment failed' });
          }
        },
        onClose: () => {
          resolve({ success: false, error: 'Payment cancelled' });
        },
      });
    });
  };

  return {
    makePayment,
    formatAmount: paystack.formatAmount.bind(paystack),
    generateReference: paystack.generateReference.bind(paystack),
  };
};

export default PaystackService;
