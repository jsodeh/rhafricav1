import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Mail,
  Phone,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Building,
  Clock,
  Star,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useSecurityMiddleware } from "@/lib/securityMiddleware";

export interface ContactFormProps {
  type: "property" | "agent" | "service" | "general" | "support" | "booking";
  recipientId?: string;
  recipientName?: string;
  recipientRole?: string;
  propertyId?: string;
  propertyTitle?: string;
  className?: string;
  onSubmit?: (data: ContactFormData) => Promise<{ success: boolean; message: string }>;
  onSuccess?: () => void;
  defaultSubject?: string;
  defaultMessage?: string;
  showPersonalInfo?: boolean;
  embedded?: boolean;
}

export interface ContactFormData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  
  // Contact Details
  subject: string;
  message: string;
  preferredContact: "email" | "phone" | "whatsapp";
  urgency: "low" | "medium" | "high";
  
  // Context Information
  propertyId?: string;
  agentId?: string;
  serviceProviderId?: string;
  
  // Booking Specific (for property viewings)
  requestType?: "inquiry" | "viewing" | "callback" | "information";
  preferredDate?: string;
  preferredTime?: string;
  
  // Additional Options
  newsletter?: boolean;
  updates?: boolean;
  
  // Form Metadata
  formType: ContactFormProps["type"];
  timestamp: string;
}

const ContactForm: React.FC<ContactFormProps> = ({
  type,
  recipientId,
  recipientName,
  recipientRole,
  propertyId,
  propertyTitle,
  className = "",
  onSubmit,
  onSuccess,
  defaultSubject = "",
  defaultMessage = "",
  showPersonalInfo = true,
  embedded = false,
}) => {
  const { user } = useAuth();
  const { validateContactForm, checkRateLimit } = useSecurityMiddleware();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<ContactFormData>>({
    name: user?.email?.split('@')[0] || "",
    email: user?.email || "",
    phone: "",
    subject: defaultSubject,
    message: defaultMessage,
    preferredContact: "email",
    urgency: "medium",
    requestType: "inquiry",
    newsletter: false,
    updates: true,
  });

  // Form configuration based on type
  const getFormConfig = () => {
    switch (type) {
      case "property":
        return {
          title: "Contact About Property",
          subtitle: propertyTitle ? `Inquire about: ${propertyTitle}` : "Send your property inquiry",
          submitText: "Send Inquiry",
          icon: Building,
          color: "blue",
        };
      case "agent":
        return {
          title: "Contact Agent",
          subtitle: recipientName ? `Send a message to ${recipientName}` : "Contact real estate agent",
          submitText: "Send Message",
          icon: User,
          color: "green",
        };
      case "service":
        return {
          title: "Contact Service Provider",
          subtitle: recipientName ? `Get in touch with ${recipientName}` : "Contact service provider",
          submitText: "Send Request",
          icon: Star,
          color: "purple",
        };
      case "booking":
        return {
          title: "Request Property Viewing",
          subtitle: "Schedule a property viewing appointment",
          submitText: "Request Viewing",
          icon: Calendar,
          color: "orange",
        };
      case "support":
        return {
          title: "Customer Support",
          subtitle: "Get help with your account or platform",
          submitText: "Send Support Request",
          icon: Shield,
          color: "red",
        };
      default:
        return {
          title: "Contact Us",
          subtitle: "Send us a message and we'll get back to you",
          submitText: "Send Message",
          icon: MessageSquare,
          color: "gray",
        };
    }
  };

  const config = getFormConfig();

  // Handle form field changes
  const handleChange = (field: keyof ContactFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Validate form data using security middleware
  const validateForm = () => {
    const result = validateContactForm({
      name: formData.name || "",
      email: formData.email || "",
      phone: formData.phone,
      message: formData.message || "",
    });

    // Additional validation for booking-specific fields
    if (result.isValid && type === "booking") {
      if (!formData.preferredDate) {
        result.isValid = false;
        result.errors.push("Please select a preferred date");
      }
      if (!formData.preferredTime) {
        result.isValid = false;
        result.errors.push("Please select a preferred time");
      }
    }

    // Additional validation for subject
    if (result.isValid && !formData.subject?.trim()) {
      result.isValid = false;
      result.errors.push("Subject is required");
    }

    return result;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Security validation
    const validationResult = validateForm();
    if (!validationResult.isValid) {
      setError(validationResult.errors.join(", "));
      return;
    }

    // Rate limiting check
    const userIdentifier = user?.id || formData.email || 'anonymous';
    const rateLimitResult = checkRateLimit('contact', userIdentifier);

    if (!rateLimitResult.allowed) {
      setError(`Too many requests. Please try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000 / 60)} minutes.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Use sanitized data from security validation
      const submitData: ContactFormData = {
        ...validationResult.sanitizedData,
        ...formData as ContactFormData,
        // Override with sanitized data for security
        name: validationResult.sanitizedData?.name || formData.name || "",
        email: validationResult.sanitizedData?.email || formData.email || "",
        phone: validationResult.sanitizedData?.phone || formData.phone || "",
        message: validationResult.sanitizedData?.message || formData.message || "",
        propertyId: propertyId,
        agentId: type === "agent" ? recipientId : undefined,
        serviceProviderId: type === "service" ? recipientId : undefined,
        formType: type,
        timestamp: new Date().toISOString(),
      };

      let result;
      if (onSubmit) {
        result = await onSubmit(submitData);
      } else {
        // Default submission handler
        result = await defaultSubmissionHandler(submitData);
      }

      if (result.success) {
        setIsSubmitted(true);
        onSuccess?.();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.error("Contact form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Default submission handler
  const defaultSubmissionHandler = async (data: ContactFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, this would send data to your backend
    console.log("Contact form submission:", data);
    
    // Simulate successful submission
    return {
      success: true,
      message: "Your message has been sent successfully!"
    };
  };

  // Time slot options for bookings
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  // Get available dates (next 30 days, excluding Sundays)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    
    return dates;
  };

  // Success state
  if (isSubmitted) {
    return (
      <Card className={cn("w-full max-w-lg mx-auto", className)}>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Message Sent Successfully!
          </h3>
          <p className="text-gray-600 mb-6">
            Thank you for your inquiry. 
            {recipientName ? ` ${recipientName}` : " We"} will get back to you within 24 hours.
          </p>
          <Button 
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                name: user?.email?.split('@')[0] || "",
                email: user?.email || "",
                phone: "",
                subject: "",
                message: "",
                preferredContact: "email",
                urgency: "medium",
                requestType: "inquiry",
                newsletter: false,
                updates: true,
              });
            }}
            variant="outline"
          >
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-lg mx-auto", className)}>
      {!embedded && (
        <CardHeader className="text-center">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3",
            config.color === "blue" && "bg-blue-100 text-blue-600",
            config.color === "green" && "bg-green-100 text-green-600",
            config.color === "purple" && "bg-purple-100 text-purple-600",
            config.color === "orange" && "bg-orange-100 text-orange-600",
            config.color === "red" && "bg-red-100 text-red-600",
            config.color === "gray" && "bg-gray-100 text-gray-600"
          )}>
            <config.icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">{config.title}</CardTitle>
          <p className="text-sm text-gray-600 mt-1">{config.subtitle}</p>
        </CardHeader>
      )}
      
      <CardContent className={embedded ? "p-0" : ""}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Recipient Information */}
          {recipientName && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{recipientName}</div>
                  {recipientRole && (
                    <div className="text-sm text-gray-600">{recipientRole}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Personal Information */}
          {showPersonalInfo && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+234 xxx xxx xxxx"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </>
          )}

          {/* Request Type for Bookings */}
          {type === "booking" && (
            <div>
              <Label>Type of Request</Label>
              <RadioGroup
                value={formData.requestType}
                onValueChange={(value) => handleChange("requestType", value)}
                className="flex flex-wrap gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="viewing" id="viewing" />
                  <Label htmlFor="viewing" className="text-sm">Property Viewing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inquiry" id="inquiry" />
                  <Label htmlFor="inquiry" className="text-sm">General Inquiry</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="callback" id="callback" />
                  <Label htmlFor="callback" className="text-sm">Request Callback</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Booking Date & Time */}
          {type === "booking" && formData.requestType === "viewing" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Select
                  value={formData.preferredDate}
                  onValueChange={(value) => handleChange("preferredDate", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableDates().map((date) => (
                      <SelectItem key={date.value} value={date.value}>
                        {date.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Select
                  value={formData.preferredTime}
                  onValueChange={(value) => handleChange("preferredTime", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="Brief description of your inquiry"
              required
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Please provide details about your inquiry..."
              rows={4}
              required
            />
          </div>

          {/* Urgency Level */}
          <div>
            <Label>Urgency Level</Label>
            <Select
              value={formData.urgency}
              onValueChange={(value) => handleChange("urgency", value as "low" | "medium" | "high")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Low - General inquiry
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Medium - Standard request
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    High - Urgent response needed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Contact Method */}
          <div>
            <Label>Preferred Contact Method</Label>
            <RadioGroup
              value={formData.preferredContact}
              onValueChange={(value) => handleChange("preferredContact", value)}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email-contact" />
                <Label htmlFor="email-contact" className="flex items-center gap-1 text-sm">
                  <Mail className="h-3 w-3" />
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone-contact" />
                <Label htmlFor="phone-contact" className="flex items-center gap-1 text-sm">
                  <Phone className="h-3 w-3" />
                  Phone Call
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whatsapp" id="whatsapp-contact" />
                <Label htmlFor="whatsapp-contact" className="flex items-center gap-1 text-sm">
                  <MessageSquare className="h-3 w-3" />
                  WhatsApp
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Optional Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="updates"
                checked={formData.updates}
                onCheckedChange={(checked) => handleChange("updates", checked)}
              />
              <Label htmlFor="updates" className="text-sm">
                Keep me updated on similar properties or services
              </Label>
            </div>
            
            {type !== "support" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newsletter"
                  checked={formData.newsletter}
                  onCheckedChange={(checked) => handleChange("newsletter", checked)}
                />
                <Label htmlFor="newsletter" className="text-sm">
                  Subscribe to our newsletter for market updates
                </Label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {config.submitText}
              </>
            )}
          </Button>

          {/* Privacy Notice */}
          <p className="text-xs text-gray-500 text-center">
            By submitting this form, you agree to our privacy policy. 
            Your information will be used solely for responding to your inquiry.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
