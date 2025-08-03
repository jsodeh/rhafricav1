import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBookings } from '@/hooks/useBookings';
import { usePayments } from '@/hooks/usePayments';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarIcon, Clock, MapPin, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    address: string;
    price: number;
    agent_id: string;
    agent_name: string;
    agent_phone: string;
    agent_email: string;
  };
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  property,
}) => {
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(property.price * 0.1); // 10% deposit
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();
  const { createBooking, bookWithPayment, checkAvailability, getAvailableTimeSlots } = useBookings();
  const { processPropertyBooking } = usePayments();
  const { createConversation, sendMessage } = useChat();

  const availableTimeSlots = selectedDate 
    ? getAvailableTimeSlots(format(selectedDate, 'yyyy-MM-dd'))
    : [];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTime || !user) return;

    setIsProcessing(true);
    try {
      // Check availability
      const isAvailable = await checkAvailability(
        property.id,
        format(selectedDate, 'yyyy-MM-dd'),
        selectedTime
      );

      if (!isAvailable) {
        alert('This time slot is no longer available. Please select another time.');
        return;
      }

      // Create booking
      const booking = await createBooking({
        propertyId: property.id,
        agentId: property.agent_id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        notes,
      });

      // Create chat conversation
      const conversationId = await createConversation(
        [user.id, property.agent_id],
        property.id
      );

      if (conversationId) {
        // Send initial message
        await sendMessage(
          conversationId,
          `Hi! I'm interested in viewing ${property.title} on ${format(selectedDate, 'MMM dd, yyyy')} at ${selectedTime}. ${notes ? `Notes: ${notes}` : ''}`,
          property.agent_id
        );
      }

      setStep('payment');
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedDate || !user) return;

    setIsProcessing(true);
    try {
      const result = await bookWithPayment(
        {
          propertyId: property.id,
          agentId: property.agent_id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          notes,
        },
        paymentAmount
      );

      if (result) {
        setStep('confirmation');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('details');
    setSelectedDate(undefined);
    setSelectedTime('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Book Property Viewing
          </DialogTitle>
        </DialogHeader>

        {step === 'details' && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-sm">{property.title}</h4>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {property.address}
              </p>
              <p className="text-sm font-medium text-green-600 mt-1">
                ₦{property.price.toLocaleString()}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="date">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              {selectedDate && (
                <div>
                  <Label htmlFor="time">Select Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific requirements or questions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Agent: {property.agent_name}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{property.agent_phone}</p>
                <p className="text-sm text-gray-600">{property.agent_email}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleBookingSubmit}
                disabled={!selectedDate || !selectedTime || isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Continue to Payment'}
              </Button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-sm">Booking Summary</h4>
              <p className="text-sm text-gray-600 mt-1">
                {property.title} - {format(selectedDate!, 'MMM dd, yyyy')} at {selectedTime}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="amount">Deposit Amount (10%)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This deposit secures your viewing appointment
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm text-green-800">Secure Payment</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your payment is processed securely through Paystack
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing Payment...' : 'Pay Now'}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="space-y-4 text-center">
            <div className="p-6 bg-green-50 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-sm text-green-700">
                Your property viewing has been scheduled successfully.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p><strong>Property:</strong> {property.title}</p>
              <p><strong>Date:</strong> {format(selectedDate!, 'MMM dd, yyyy')}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Agent:</strong> {property.agent_name}</p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4" />
                <span>You can now chat with your agent</span>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 