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
  const { user } = useAuth();
  const { processPropertyBooking } = usePayments();

  // Fetch user's bookings
  const fetchBookings = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Simulate fetching bookings from Supabase
      const mockBookings: Booking[] = [
        {
          id: 'booking_1',
          property_id: '660e8400-e29b-41d4-a716-446655440001',
          user_id: user.id,
          agent_id: 'agent_1',
          scheduled_date: '2024-01-25',
          scheduled_time: '14:00',
          status: 'confirmed',
          notes: 'Interested in viewing the property',
          created_at: new Date().toISOString(),
          property: {
            title: 'Modern 3-Bedroom Apartment',
            address: '15 Ahmadu Bello Way, Victoria Island',
            images: ['/placeholder.svg'],
          },
          agent: {
            name: 'Sarah Johnson',
            phone: '+234 801 234 5678',
            email: 'sarah.johnson@realestate.com',
          },
        },
        {
          id: 'booking_2',
          property_id: '660e8400-e29b-41d4-a716-446655440002',
          user_id: user.id,
          agent_id: 'agent_2',
          scheduled_date: '2024-01-28',
          scheduled_time: '10:00',
          status: 'pending',
          notes: 'Would like to see the garden area',
          created_at: new Date().toISOString(),
          property: {
            title: 'Luxury 4-Bedroom Duplex',
            address: '45 Admiralty Way, Lekki Phase 1',
            images: ['/placeholder.svg'],
          },
          agent: {
            name: 'Michael Adebayo',
            phone: '+234 802 345 6789',
            email: 'michael.adebayo@realestate.com',
          },
        },
      ];

      setBookings(mockBookings);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
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

      const newBooking: Booking = {
        id: `booking_${Date.now()}`,
        property_id: bookingData.propertyId,
        user_id: user.id,
        agent_id: bookingData.agentId,
        scheduled_date: bookingData.date,
        scheduled_time: bookingData.time,
        status: 'pending',
        notes: bookingData.notes,
        created_at: new Date().toISOString(),
      };

      // In a real implementation, you would insert to Supabase
      // const { error } = await supabase
      //   .from('property_viewings')
      //   .insert(newBooking);

      // if (error) throw error;

      // Add to local state
      setBookings(prev => [...prev, newBooking]);

      return newBooking;
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

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId
            ? { ...booking, status: 'confirmed' as const }
            : booking
        )
      );

      // In a real implementation, you would update Supabase
      // const { error } = await supabase
      //   .from('property_viewings')
      //   .update({ status: 'confirmed' })
      //   .eq('id', bookingId);

      // if (error) throw error;
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

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId
            ? { ...booking, status: 'cancelled' as const }
            : booking
        )
      );

      // In a real implementation, you would update Supabase
      // const { error } = await supabase
      //   .from('property_viewings')
      //   .update({ status: 'cancelled' })
      //   .eq('id', bookingId);

      // if (error) throw error;
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

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId
            ? { ...booking, status: 'completed' as const }
            : booking
        )
      );

      // In a real implementation, you would update Supabase
      // const { error } = await supabase
      //   .from('property_viewings')
      //   .update({ status: 'completed' })
      //   .eq('id', bookingId);

      // if (error) throw error;
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