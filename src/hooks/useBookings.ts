import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePayments } from './usePayments';

interface Booking {
  id: string;
  property_id: string;
  user_id: string;
  agent_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  property?: {
    title: string;
    address: string;
    images: string[];
  };
  agent?: {
    name: string;
    phone: string;
    email: string;
  };
}

interface BookingRequest {
  propertyId: string;
  agentId: string;
  date: string;
  time: string;
  notes?: string;
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const { processPropertyBooking } = usePayments();

  // Fetch user's bookings
  const fetchBookings = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('property_viewings')
        .select(`
          id,
          property_id,
          user_id,
          agent_id,
          scheduled_date,
          scheduled_time,
          status,
          notes,
          created_at,
          properties:properties(id,title,address,images),
          agent:real_estate_agents(id,agency_name,phone)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: Booking[] = (data as any[] | null)?.map((b: any) => ({
        id: b.id,
        property_id: b.property_id,
        user_id: b.user_id,
        agent_id: b.agent_id,
        scheduled_date: b.scheduled_date,
        scheduled_time: b.scheduled_time,
        status: (b.status || 'pending') as Booking['status'],
        notes: b.notes,
        created_at: b.created_at,
        property: b.properties
          ? {
              title: b.properties.title,
              address: b.properties.address,
              images: b.properties.images || ['/placeholder.svg'],
            }
          : undefined,
        agent: b.agent
          ? {
              name: b.agent.agency_name || 'Agent',
              phone: b.agent.phone || '',
              email: '',
            }
          : undefined,
      })) || [];

      setBookings(mapped);
    } catch (err) {
      setError((err as any)?.message || 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        setRetryCount((prev) => prev + 1);
        setTimeout(() => {
          fetchBookings();
        }, delay);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create a new booking
  const createBooking = useCallback(async (bookingData: BookingRequest) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);
      const insert = {
        property_id: bookingData.propertyId,
        user_id: user.id,
        agent_id: bookingData.agentId,
        scheduled_date: bookingData.date,
        scheduled_time: bookingData.time,
        status: 'pending' as const,
        notes: bookingData.notes,
      };

      const { data, error } = await supabase
        .from('property_viewings')
        .insert(insert)
        .select('*')
        .single();

      if (error) throw error;

      const created: Booking = {
        id: data.id,
        property_id: data.property_id,
        user_id: data.user_id,
        agent_id: data.agent_id,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        status: data.status,
        notes: data.notes,
        created_at: data.created_at,
      };

      setBookings(prev => [created, ...prev]);

      return created;
    } catch (err) {
      setError('Failed to create booking');
      console.error('Error creating booking:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Confirm a booking (for agents)
  const confirmBooking = useCallback(async (bookingId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase
        .from('property_viewings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'confirmed' } as Booking : b))
      );
    } catch (err) {
      setError('Failed to confirm booking');
      console.error('Error confirming booking:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel a booking
  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase
        .from('property_viewings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' } as Booking : b))
      );
    } catch (err) {
      setError('Failed to cancel booking');
      console.error('Error cancelling booking:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Complete a booking
  const completeBooking = useCallback(async (bookingId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase
        .from('property_viewings')
        .update({ status: 'completed' })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'completed' } as Booking : b))
      );
    } catch (err) {
      setError('Failed to complete booking');
      console.error('Error completing booking:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Book with payment (for premium bookings)
  const bookWithPayment = useCallback(async (
    bookingData: BookingRequest,
    amount: number
  ) => {
    try {
      // Create the booking first
      const booking = await createBooking(bookingData);

      // Process payment
      const paymentResult = await processPropertyBooking(
        booking.property_id,
        amount,
        booking.scheduled_date,
        booking.notes
      );

      if (paymentResult.success) {
        // Update booking status to confirmed
        await confirmBooking(booking.id);
        return { booking, payment: paymentResult };
      } else {
        // Cancel booking if payment fails
        await cancelBooking(booking.id);
        throw new Error(paymentResult.message);
      }
    } catch (err) {
      setError('Failed to process booking with payment');
      console.error('Error booking with payment:', err);
      throw err;
    }
  }, [createBooking, confirmBooking, cancelBooking, processPropertyBooking]);

  // Check availability for a property
  const checkAvailability = useCallback(async (
    propertyId: string,
    date: string,
    time: string
  ) => {
    try {
      // In a real implementation, you would check against existing bookings
      // For now, we'll simulate availability check
      const conflictingBookings = bookings.filter(
        booking => 
          booking.property_id === propertyId &&
          booking.scheduled_date === date &&
          booking.scheduled_time === time &&
          booking.status !== 'cancelled'
      );

      return conflictingBookings.length === 0;
    } catch (err) {
      console.error('Error checking availability:', err);
      return false;
    }
  }, [bookings]);

  // Get available time slots for a date
  const getAvailableTimeSlots = useCallback((date: string) => {
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    // Filter out booked time slots
    const bookedSlots = bookings
      .filter(booking => 
        booking.scheduled_date === date && 
        booking.status !== 'cancelled'
      )
      .map(booking => booking.scheduled_time);

    return timeSlots.filter(slot => !bookedSlots.includes(slot));
  }, [bookings]);

  // Load bookings on mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    isLoading,
    error,
    isEmpty: !isLoading && bookings.length === 0,
    retryCount,
    retry: () => {
      setRetryCount(0);
      setError(null);
      fetchBookings();
    },
    fetchBookings,
    createBooking,
    confirmBooking,
    cancelBooking,
    completeBooking,
    bookWithPayment,
    checkAvailability,
    getAvailableTimeSlots,
  };
}; 