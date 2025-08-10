import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SupportTicket {
  id: string;
  subject: string;
  user: string;
  priority: string;
  status: string;
  assignedTo: string;
  createdAt: string;
}

export const useSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  const fetchSupportTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('case_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map to ticket fields
      const mapped = (data || []).map((t: any) => ({
        id: t.id,
        subject: t.case_type || 'General Inquiry',
        user: t.name || t.email || 'Anonymous',
        priority: t.urgency || 'Medium',
        status: t.status || 'Open',
        assignedTo: 'Support Team',
        createdAt: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A',
      }));

      setTickets(mapped);
    } catch (err: any) {
      console.error('Error fetching support tickets:', err);
      setError(err.message || 'Failed to fetch support tickets');
      // Auto-retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        // Increment immediately so state reflects pending retry
        setRetryCount((prev) => prev + 1);
        setTimeout(() => {
          fetchSupportTickets();
        }, delay);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('case_submissions')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;

      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status } : ticket
      ));
    } catch (err: any) {
      console.error('Error updating ticket status:', err);
      throw err;
    }
  };

  const assignTicket = async (ticketId: string, assignedTo: string) => {
    try {
      // Note: case_submissions table doesn't have assigned_to field
      // This would need to be added to the database schema
      // For now, just update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, assignedTo } : ticket
      ));
    } catch (err: any) {
      console.error('Error assigning ticket:', err);
      throw err;
    }
  };

  return {
    tickets,
    isLoading,
    error,
    isEmpty: !isLoading && tickets.length === 0,
    refetch: fetchSupportTickets,
    retry: () => {
      setRetryCount(0);
      setError(null);
      fetchSupportTickets();
    },
    retryCount,
    updateTicketStatus,
    assignTicket,
  };
};