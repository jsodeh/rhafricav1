import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FinancialSummary {
  totalRevenue: number;
  totalCommission: number;
  totalExpenses: number;
  netProfit: number;
}

interface MonthlyFinancialData {
  month: string;
  revenue: string;
  transactions: number;
}

export const useFinancialData = () => {
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancialData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch properties with created_at for financial calculations
      const { data, error } = await supabase
        .from('properties')
        .select('price, created_at');

      if (error) throw error;

      const totalRevenue = (data || []).reduce((sum: number, p: any) => sum + (p.price || 0), 0);
      const totalCommission = totalRevenue * 0.1; // 10% commission
      const totalExpenses = totalRevenue * 0.05; // 5% expenses
      const netProfit = totalRevenue - totalCommission - totalExpenses;

      setFinancialSummary({
        totalRevenue,
        totalCommission,
        totalExpenses,
        netProfit,
      });

      // Generate monthly financial data from properties
      const monthlyDataMap: { [key: string]: { revenue: number, transactions: number } } = {};
      (data || []).forEach((property: any) => {
        if (property.created_at && property.price) {
          const date = new Date(property.created_at);
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          if (!monthlyDataMap[monthKey]) {
            monthlyDataMap[monthKey] = { revenue: 0, transactions: 0 };
          }
          monthlyDataMap[monthKey].revenue += property.price * 0.1; // 10% commission
          monthlyDataMap[monthKey].transactions += 1;
        }
      });

      // Convert to array format for display
      const monthlyArray = Object.entries(monthlyDataMap).map(([month, data]) => ({
        month,
        revenue: `₦${data.revenue.toLocaleString()}`,
        transactions: data.transactions
      }));

      setMonthlyData(monthlyArray);
    } catch (err: any) {
      console.error('Error fetching financial data:', err);
      setError(err.message || 'Failed to fetch financial data');
      
      // Auto-retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchFinancialData();
        }, delay);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => {
    setRetryCount(0);
    setError(null);
    fetchFinancialData();
  };

  return {
    financialSummary,
    monthlyData,
    isLoading,
    error,
    isEmpty: !isLoading && monthlyData.length === 0,
    refetch: fetchFinancialData,
    retry,
    retryCount,
  };
};