import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { ContactFormData } from '@/components/ContactForm';

export interface ContactSubmission extends ContactFormData {
  id: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  response_count: number;
  last_response_at?: string;
  priority_score: number;
}

export interface ContactResponse {
  id: string;
  submission_id: string;
  responder_id: string;
  responder_name: string;
  responder_role: string;
  message: string;
  response_type: 'email' | 'phone' | 'internal_note';
  created_at: string;
}

export const useContactForms = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Submit a new contact form
  const submitContactForm = useCallback(async (
    formData: ContactFormData
  ): Promise<{ success: boolean; message: string; submissionId?: string }> => {
    if (!user) {
      return { success: false, message: "Please log in to submit a contact form" };
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate priority score based on urgency and type
      let priorityScore = 0;
      switch (formData.urgency) {
        case 'high': priorityScore += 3; break;
        case 'medium': priorityScore += 2; break;
        case 'low': priorityScore += 1; break;
      }

      switch (formData.formType) {
        case 'booking': priorityScore += 2; break;
        case 'property': priorityScore += 1; break;
        case 'support': priorityScore += 1; break;
      }

      const submissionData = {
        user_id: user.id,
        form_type: formData.formType,
        recipient_id: formData.agentId || formData.serviceProviderId,
        property_id: formData.propertyId,
        
        // Contact details
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        
        // Preferences
        preferred_contact: formData.preferredContact,
        urgency: formData.urgency,
        request_type: formData.requestType,
        
        // Booking details
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        
        // Settings
        newsletter_opt_in: formData.newsletter || false,
        updates_opt_in: formData.updates || false,
        
        // Metadata
        status: 'pending' as const,
        priority_score: priorityScore,
        response_count: 0,
      };

      // In a real implementation, submit to Supabase
      // const { data, error } = await supabase
      //   .from('contact_submissions')
      //   .insert(submissionData)
      //   .select()
      //   .single();

      // if (error) throw error;

      // Simulate successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const submissionId = `sub_${Date.now()}`;
      
      // Send notification emails based on form type
      await sendNotifications(formData, submissionId);
      
      // Auto-assign to appropriate team member
      await autoAssignSubmission(formData, submissionId);

      return {
        success: true,
        message: getSuccessMessage(formData.formType),
        submissionId
      };

    } catch (err) {
      console.error('Contact form submission error:', err);
      return {
        success: false,
        message: "Failed to submit your message. Please try again."
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [user]);

  // Send notifications for new submissions
  const sendNotifications = useCallback(async (
    formData: ContactFormData,
    submissionId: string
  ) => {
    try {
      // Determine notification recipients based on form type
      const recipients = getNotificationRecipients(formData);
      
      // Send email notifications
      for (const recipient of recipients) {
        await sendEmailNotification(recipient, formData, submissionId);
      }
      
      // Send SMS for high priority items
      if (formData.urgency === 'high') {
        await sendSMSNotification(formData, submissionId);
      }
      
      // Create in-app notifications
      await createInAppNotifications(formData, submissionId);
      
    } catch (err) {
      console.error('Failed to send notifications:', err);
      // Don't fail the entire submission if notifications fail
    }
  }, []);

  // Auto-assign submissions to team members
  const autoAssignSubmission = useCallback(async (
    formData: ContactFormData,
    submissionId: string
  ) => {
    try {
      let assigneeId: string | null = null;

      // Direct assignment logic
      if (formData.agentId) {
        assigneeId = formData.agentId;
      } else if (formData.serviceProviderId) {
        assigneeId = formData.serviceProviderId;
      } else {
        // Auto-assign based on type and availability
        assigneeId = await getAvailableAssignee(formData.formType);
      }

      if (assigneeId) {
        // Update submission with assignee
        // await supabase
        //   .from('contact_submissions')
        //   .update({ assigned_to: assigneeId, status: 'in_progress' })
        //   .eq('id', submissionId);
        
        console.log(`Submission ${submissionId} assigned to ${assigneeId}`);
      }
    } catch (err) {
      console.error('Failed to auto-assign submission:', err);
    }
  }, []);

  // Get available assignee for auto-assignment
  const getAvailableAssignee = useCallback(async (formType: string): Promise<string | null> => {
    // In a real implementation, this would check agent availability,
    // workload, specialization, etc.
    const assignments = {
      property: 'agent_sarah',
      agent: 'agent_sarah',
      service: 'support_team',
      booking: 'agent_michael',
      support: 'support_team',
      general: 'support_team',
    };

    return assignments[formType as keyof typeof assignments] || 'support_team';
  }, []);

  // Get notification recipients based on form type
  const getNotificationRecipients = (formData: ContactFormData): string[] => {
    const recipients = ['admin@realestate.com']; // Always notify admin

    switch (formData.formType) {
      case 'property':
      case 'booking':
        recipients.push('properties@realestate.com');
        if (formData.agentId) {
          recipients.push(`agent_${formData.agentId}@realestate.com`);
        }
        break;
      case 'agent':
        if (formData.agentId) {
          recipients.push(`agent_${formData.agentId}@realestate.com`);
        }
        break;
      case 'service':
        recipients.push('services@realestate.com');
        if (formData.serviceProviderId) {
          recipients.push(`service_${formData.serviceProviderId}@realestate.com`);
        }
        break;
      case 'support':
        recipients.push('support@realestate.com');
        break;
    }

    return recipients;
  };

  // Send email notification
  const sendEmailNotification = useCallback(async (
    recipient: string,
    formData: ContactFormData,
    submissionId: string
  ) => {
    // In a real implementation, this would use your email service
    console.log('Sending email notification:', {
      to: recipient,
      subject: `New ${formData.formType} inquiry: ${formData.subject}`,
      submissionId,
      urgency: formData.urgency,
    });
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 200));
  }, []);

  // Send SMS notification for high priority
  const sendSMSNotification = useCallback(async (
    formData: ContactFormData,
    submissionId: string
  ) => {
    // In a real implementation, this would use your SMS service
    console.log('Sending SMS notification for high priority submission:', {
      submissionId,
      type: formData.formType,
      urgency: formData.urgency,
    });
  }, []);

  // Create in-app notifications
  const createInAppNotifications = useCallback(async (
    formData: ContactFormData,
    submissionId: string
  ) => {
    // In a real implementation, this would create notifications in your database
    console.log('Creating in-app notification:', {
      submissionId,
      type: formData.formType,
      title: `New ${formData.formType} inquiry`,
      message: formData.subject,
    });
  }, []);

  // Get success message based on form type
  const getSuccessMessage = (formType: string): string => {
    const messages = {
      property: "Your property inquiry has been sent! An agent will contact you within 24 hours.",
      agent: "Your message has been sent to the agent! You should hear back within 24 hours.",
      service: "Your service request has been submitted! The provider will contact you soon.",
      booking: "Your viewing request has been submitted! We'll confirm your appointment within 4 hours.",
      support: "Your support request has been received! Our team will respond within 24 hours.",
      general: "Your message has been sent! We'll get back to you within 24 hours.",
    };

    return messages[formType as keyof typeof messages] || messages.general;
  };

  // Fetch user's contact submissions
  const fetchUserSubmissions = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // In a real implementation, fetch from Supabase
      // const { data, error } = await supabase
      //   .from('contact_submissions')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .order('created_at', { ascending: false });

      // if (error) throw error;

      // Simulate fetching submissions
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockSubmissions: ContactSubmission[] = [
        {
          id: 'sub_1',
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone: '+234 xxx xxx xxxx',
          subject: 'Property Inquiry - Victoria Island Apartment',
          message: 'I am interested in viewing this property. Please contact me.',
          preferredContact: 'email',
          urgency: 'medium',
          formType: 'property',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'in_progress',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          assigned_to: 'agent_sarah',
          response_count: 1,
          last_response_at: new Date(Date.now() - 3600000).toISOString(),
          priority_score: 3,
          propertyId: 'prop_1',
          agentId: 'agent_sarah',
        },
      ];

      setSubmissions(mockSubmissions);
    } catch (err) {
      setError('Failed to fetch submissions');
      console.error('Error fetching submissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Get submission status color
  const getStatusColor = (status: ContactSubmission['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return {
    // Actions
    submitContactForm,
    fetchUserSubmissions,
    
    // State
    submissions,
    isSubmitting,
    isLoading,
    error,
    
    // Utilities
    getStatusColor,
    getUrgencyColor,
  };
};
