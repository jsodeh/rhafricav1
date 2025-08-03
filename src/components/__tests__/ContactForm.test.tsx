import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockUser, testUtils } from '@/test/test-utils';
import ContactForm, { ContactFormProps } from '../ContactForm';

// Mock the security middleware
vi.mock('@/lib/securityMiddleware', () => ({
  useSecurityMiddleware: () => ({
    validateContactForm: vi.fn().mockReturnValue({
      isValid: true,
      errors: [],
      sanitizedData: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        message: 'Test message',
      }
    }),
    checkRateLimit: vi.fn().mockReturnValue({
      allowed: true,
      remaining: 5,
      resetTime: Date.now() + 900000,
    }),
  }),
}));

describe('ContactForm', () => {
  const defaultProps: ContactFormProps = {
    type: 'general',
    onSubmit: vi.fn(),
    onSuccess: vi.fn(),
  };

  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render contact form with all required fields', () => {
      renderWithProviders(<ContactForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('should render with correct title for different form types', () => {
      const { rerender } = renderWithProviders(<ContactForm {...defaultProps} type="property" />);
      expect(screen.getByText('Contact About Property')).toBeInTheDocument();
      
      rerender(<ContactForm {...defaultProps} type="agent" />);
      expect(screen.getByText('Contact Agent')).toBeInTheDocument();
      
      rerender(<ContactForm {...defaultProps} type="support" />);
      expect(screen.getByText('Customer Support')).toBeInTheDocument();
    });

    it('should display recipient information when provided', () => {
      renderWithProviders(
        <ContactForm 
          {...defaultProps} 
          recipientName="John Doe" 
          recipientRole="Real Estate Agent" 
        />
      );
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Real Estate Agent')).toBeInTheDocument();
    });

    it('should pre-populate fields with default values', () => {
      renderWithProviders(
        <ContactForm 
          {...defaultProps} 
          defaultSubject="Property Inquiry"
          defaultMessage="I'm interested in this property"
        />
      );
      
      expect(screen.getByDisplayValue('Property Inquiry')).toBeInTheDocument();
      expect(screen.getByDisplayValue("I'm interested in this property")).toBeInTheDocument();
    });

    it('should render booking-specific fields for booking type', () => {
      renderWithProviders(<ContactForm {...defaultProps} type="booking" />);
      
      expect(screen.getByLabelText(/type of request/i)).toBeInTheDocument();
      expect(screen.getByText('Property Viewing')).toBeInTheDocument();
      expect(screen.getByText('General Inquiry')).toBeInTheDocument();
      expect(screen.getByText('Request Callback')).toBeInTheDocument();
    });

    it('should show date and time fields when viewing is selected', async () => {
      renderWithProviders(<ContactForm {...defaultProps} type="booking" />);
      
      // Select property viewing
      await user.click(screen.getByLabelText('Property Viewing'));
      
      await waitFor(() => {
        expect(screen.getByLabelText(/preferred date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/preferred time/i)).toBeInTheDocument();
      });
    });

    it('should render in compact mode', () => {
      renderWithProviders(<ContactForm {...defaultProps} embedded={true} />);
      
      // Should not show header in embedded mode
      expect(screen.queryByText('Contact Us')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const mockValidateContactForm = vi.fn().mockReturnValue({
        isValid: false,
        errors: ['Name is required', 'Email is required'],
      });
      
      vi.doMock('@/lib/securityMiddleware', () => ({
        useSecurityMiddleware: () => ({
          validateContactForm: mockValidateContactForm,
          checkRateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 5, resetTime: Date.now() + 900000 }),
        }),
      }));

      renderWithProviders(<ContactForm {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/name is required, email is required/i)).toBeInTheDocument();
      });
    });

    it('should validate booking-specific fields', async () => {
      renderWithProviders(<ContactForm {...defaultProps} type="booking" />);
      
      // Select property viewing
      await user.click(screen.getByLabelText('Property Viewing'));
      
      // Try to submit without selecting date/time
      await testUtils.fillField(user, 'Full Name', 'Test User');
      await testUtils.fillField(user, 'Email Address', 'test@example.com');
      await testUtils.fillField(user, 'Phone Number', '+1234567890');
      await testUtils.fillField(user, 'Subject', 'Test Subject');
      await testUtils.fillField(user, 'Message', 'Test message');
      
      await user.click(screen.getByRole('button', { name: /request viewing/i }));
      
      // Should show date/time validation errors
      await waitFor(() => {
        expect(screen.getByText(/please select a preferred date/i)).toBeInTheDocument();
      });
    });

    it('should handle rate limiting', async () => {
      const mockCheckRateLimit = vi.fn().mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 900000, // 15 minutes from now
      });
      
      vi.doMock('@/lib/securityMiddleware', () => ({
        useSecurityMiddleware: () => ({
          validateContactForm: vi.fn().mockReturnValue({ isValid: true, errors: [], sanitizedData: {} }),
          checkRateLimit: mockCheckRateLimit,
        }),
      }));

      renderWithProviders(<ContactForm {...defaultProps} />, { user: mockUser });
      
      await testUtils.fillField(user, 'Full Name', 'Test User');
      await testUtils.fillField(user, 'Email Address', 'test@example.com');
      await testUtils.fillField(user, 'Phone Number', '+1234567890');
      await testUtils.fillField(user, 'Subject', 'Test Subject');
      await testUtils.fillField(user, 'Message', 'Test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({
        success: true,
        message: 'Message sent successfully',
      });

      renderWithProviders(<ContactForm {...defaultProps} onSubmit={mockOnSubmit} />);
      
      await testUtils.fillField(user, 'Full Name', 'Test User');
      await testUtils.fillField(user, 'Email Address', 'test@example.com');
      await testUtils.fillField(user, 'Phone Number', '+1234567890');
      await testUtils.fillField(user, 'Subject', 'Test Subject');
      await testUtils.fillField(user, 'Message', 'This is a test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890',
            subject: 'Test Subject',
            message: 'This is a test message',
            formType: 'general',
          })
        );
      });
    });

    it('should show success state after successful submission', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({
        success: true,
        message: 'Message sent successfully',
      });
      const mockOnSuccess = vi.fn();

      renderWithProviders(
        <ContactForm {...defaultProps} onSubmit={mockOnSubmit} onSuccess={mockOnSuccess} />
      );
      
      await testUtils.fillField(user, 'Full Name', 'Test User');
      await testUtils.fillField(user, 'Email Address', 'test@example.com');
      await testUtils.fillField(user, 'Phone Number', '+1234567890');
      await testUtils.fillField(user, 'Subject', 'Test Subject');
      await testUtils.fillField(user, 'Message', 'Test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument();
        expect(mockOnSuccess).toHaveBeenCalled();
      });
      
      // Should show option to send another message
      expect(screen.getByRole('button', { name: /send another message/i })).toBeInTheDocument();
    });

    it('should handle submission errors', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({
        success: false,
        message: 'Failed to send message',
      });

      renderWithProviders(<ContactForm {...defaultProps} onSubmit={mockOnSubmit} />);
      
      await testUtils.fillField(user, 'Full Name', 'Test User');
      await testUtils.fillField(user, 'Email Address', 'test@example.com');
      await testUtils.fillField(user, 'Phone Number', '+1234567890');
      await testUtils.fillField(user, 'Subject', 'Test Subject');
      await testUtils.fillField(user, 'Message', 'Test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Failed to send message')).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      const mockOnSubmit = vi.fn().mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ success: true, message: 'Success' }), 100)
      ));

      renderWithProviders(<ContactForm {...defaultProps} onSubmit={mockOnSubmit} />);
      
      await testUtils.fillField(user, 'Full Name', 'Test User');
      await testUtils.fillField(user, 'Email Address', 'test@example.com');
      await testUtils.fillField(user, 'Phone Number', '+1234567890');
      await testUtils.fillField(user, 'Subject', 'Test Subject');
      await testUtils.fillField(user, 'Message', 'Test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      // Should show loading state
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument();
      });
    });

    it('should include sanitized data in submission', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({
        success: true,
        message: 'Success',
      });

      const mockValidateContactForm = vi.fn().mockReturnValue({
        isValid: true,
        errors: [],
        sanitizedData: {
          name: 'Sanitized Name',
          email: 'sanitized@example.com',
          phone: '1234567890',
          message: 'Sanitized message',
        }
      });
      
      vi.doMock('@/lib/securityMiddleware', () => ({
        useSecurityMiddleware: () => ({
          validateContactForm: mockValidateContactForm,
          checkRateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 5, resetTime: Date.now() + 900000 }),
        }),
      }));

      renderWithProviders(<ContactForm {...defaultProps} onSubmit={mockOnSubmit} />);
      
      await testUtils.fillField(user, 'Full Name', 'Test User');
      await testUtils.fillField(user, 'Email Address', 'test@example.com');
      await testUtils.fillField(user, 'Phone Number', '+1234567890');
      await testUtils.fillField(user, 'Subject', 'Test Subject');
      await testUtils.fillField(user, 'Message', 'Test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Sanitized Name',
            email: 'sanitized@example.com',
            phone: '1234567890',
            message: 'Sanitized message',
          })
        );
      });
    });
  });

  describe('User Experience', () => {
    it('should clear errors when user starts typing', async () => {
      // Start with validation error
      const mockValidateContactForm = vi.fn()
        .mockReturnValueOnce({
          isValid: false,
          errors: ['Name is required'],
        })
        .mockReturnValue({
          isValid: true,
          errors: [],
          sanitizedData: {}
        });
      
      vi.doMock('@/lib/securityMiddleware', () => ({
        useSecurityMiddleware: () => ({
          validateContactForm: mockValidateContactForm,
          checkRateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 5, resetTime: Date.now() + 900000 }),
        }),
      }));

      renderWithProviders(<ContactForm {...defaultProps} />);
      
      // Try to submit with empty form
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
      
      // Start typing in name field
      await testUtils.fillField(user, 'Full Name', 'T');
      
      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
      });
    });

    it('should reset form after sending another message', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({
        success: true,
        message: 'Success',
      });

      renderWithProviders(<ContactForm {...defaultProps} onSubmit={mockOnSubmit} />);
      
      // Fill and submit form
      await testUtils.fillField(user, 'Full Name', 'Test User');
      await testUtils.fillField(user, 'Email Address', 'test@example.com');
      await testUtils.fillField(user, 'Phone Number', '+1234567890');
      await testUtils.fillField(user, 'Subject', 'Test Subject');
      await testUtils.fillField(user, 'Message', 'Test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument();
      });
      
      // Click to send another message
      await user.click(screen.getByRole('button', { name: /send another message/i }));
      
      // Form should be reset
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toHaveValue('');
        expect(screen.getByLabelText(/subject/i)).toHaveValue('');
        expect(screen.getByLabelText(/message/i)).toHaveValue('');
      });
    });

    it('should pre-populate user data when authenticated', () => {
      renderWithProviders(<ContactForm {...defaultProps} />, { user: mockUser });
      
      // Email should be pre-populated from user data
      expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderWithProviders(<ContactForm {...defaultProps} />);
      
      // Form should have search role for contact forms
      expect(screen.getByRole('form')).toBeInTheDocument();
      
      // All form fields should have labels
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });

    it('should announce errors to screen readers', async () => {
      const mockValidateContactForm = vi.fn().mockReturnValue({
        isValid: false,
        errors: ['Name is required'],
      });
      
      vi.doMock('@/lib/securityMiddleware', () => ({
        useSecurityMiddleware: () => ({
          validateContactForm: mockValidateContactForm,
          checkRateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 5, resetTime: Date.now() + 900000 }),
        }),
      }));

      renderWithProviders(<ContactForm {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(/name is required/i);
      });
    });

    it('should support keyboard navigation', async () => {
      renderWithProviders(<ContactForm {...defaultProps} />);
      
      const nameField = screen.getByLabelText(/full name/i);
      const emailField = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      // Tab navigation should work
      nameField.focus();
      expect(document.activeElement).toBe(nameField);
      
      await user.tab();
      expect(document.activeElement).toBe(emailField);
      
      // Should be able to submit with Enter key
      submitButton.focus();
      await user.keyboard('{Enter}');
      
      // Form submission should be triggered
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });
  });
});
