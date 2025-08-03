import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAdvertising } from "@/hooks/useAdvertising";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Building,
  Users,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Star,
  Mail,
  User,
} from "lucide-react";

interface DemoSchedulingModalProps {
  open: boolean;
  onClose: () => void;
  packageName?: string;
}

interface DemoFormData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  
  // Demo Preferences
  demoType: "virtual" | "in_person" | "phone";
  preferredDate: string;
  preferredTime: string;
  alternativeDate: string;
  alternativeTime: string;
  
  // Business Context
  businessType: string;
  currentListings: string;
  monthlyBudget: string;
  primaryGoals: string[];
  
  // Specific Interests
  specificFeatures: string[];
  questions: string;
  
  // Meeting Details
  attendeeCount: string;
  specialRequirements: string;
  marketingConsent: boolean;
}

const businessTypes = [
  "Real Estate Agency",
  "Property Developer", 
  "Individual Agent",
  "Property Management Company",
  "Investment Company",
  "Construction Company",
  "First-time advertiser",
  "Other"
];

const monthlyBudgets = [
  "Under ₦100,000",
  "₦100,000 - ₦300,000", 
  "₦300,000 - ₦500,000",
  "₦500,000 - ₦1,000,000",
  "Over ₦1,000,000",
  "To be discussed"
];

const primaryGoals = [
  { id: "increase_leads", label: "Increase property leads" },
  { id: "brand_awareness", label: "Build brand awareness" },
  { id: "target_buyers", label: "Target specific buyer segments" },
  { id: "sell_faster", label: "Sell properties faster" },
  { id: "expand_reach", label: "Expand geographic reach" },
  { id: "premium_listings", label: "Create premium listings" },
];

const specificFeatures = [
  { id: "advanced_analytics", label: "Advanced Analytics & Reporting" },
  { id: "lead_management", label: "Lead Management System" },
  { id: "featured_listings", label: "Featured Listing Options" },
  { id: "agent_profiles", label: "Enhanced Agent Profiles" },
  { id: "social_media", label: "Social Media Integration" },
  { id: "mobile_optimization", label: "Mobile Optimization" },
  { id: "api_integration", label: "API & Third-party Integrations" },
  { id: "custom_branding", label: "Custom Branding Options" },
];

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

const DemoSchedulingModal: React.FC<DemoSchedulingModalProps> = ({
  open,
  onClose,
  packageName,
}) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const { scheduleDemoRequest } = useAdvertising();
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DemoFormData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    company: "",
    role: "",
    demoType: "virtual",
    preferredDate: "",
    preferredTime: "",
    alternativeDate: "",
    alternativeTime: "",
    businessType: "",
    currentListings: "",
    monthlyBudget: "",
    primaryGoals: [],
    specificFeatures: [],
    questions: "",
    attendeeCount: "1-2 people",
    specialRequirements: "",
    marketingConsent: false,
  });

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goalId)
        ? prev.primaryGoals.filter(id => id !== goalId)
        : [...prev.primaryGoals, goalId]
    }));
  };

  const handleFeatureToggle = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      specificFeatures: prev.specificFeatures.includes(featureId)
        ? prev.specificFeatures.filter(id => id !== featureId)
        : [...prev.specificFeatures, featureId]
    }));
  };

  const handleScheduleDemo = async () => {
    setIsLoading(true);

    try {
      const result = await scheduleDemoRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        businessType: formData.businessType,
        demoType: formData.demoType,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        notes: `Primary Goals: ${formData.primaryGoals.join(', ')}\nInterested Features: ${formData.specificFeatures.join(', ')}\nQuestions: ${formData.questions}\nSpecial Requirements: ${formData.specialRequirements}`,
      });

      if (result.success) {
        toast({
          title: "Demo Scheduled Successfully!",
          description: "You'll receive a confirmation email with meeting details within 15 minutes. Our team will also call you to confirm.",
        });
        onClose();
      } else {
        toast({
          title: "Scheduling Failed",
          description: result.error || "Unable to schedule demo. Please try again or contact our support team.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: "Unable to schedule demo. Please try again or contact our support team.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid = () => {
    return formData.name && formData.email && formData.phone && formData.company;
  };

  const isStep2Valid = () => {
    return formData.preferredDate && formData.preferredTime && formData.demoType;
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Your full name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+234 xxx xxx xxxx"
          />
        </div>
        <div>
          <Label htmlFor="company">Company/Agency *</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            placeholder="Your company name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Your Role</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            placeholder="e.g., Agent, Manager, CEO"
          />
        </div>
        <div>
          <Label htmlFor="businessType">Business Type</Label>
          <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label>Demo Type *</Label>
        <RadioGroup
          value={formData.demoType}
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, demoType: value }))}
          className="mt-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className={`cursor-pointer transition-all ${formData.demoType === "virtual" ? "border-blue-500 bg-blue-50" : ""}`}>
              <CardContent className="p-4 text-center">
                <RadioGroupItem value="virtual" id="virtual" className="sr-only" />
                <label htmlFor="virtual" className="cursor-pointer">
                  <Video className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium">Virtual Demo</div>
                  <div className="text-sm text-gray-600">Online via Zoom/Teams</div>
                </label>
              </CardContent>
            </Card>
            
            <Card className={`cursor-pointer transition-all ${formData.demoType === "phone" ? "border-blue-500 bg-blue-50" : ""}`}>
              <CardContent className="p-4 text-center">
                <RadioGroupItem value="phone" id="phone" className="sr-only" />
                <label htmlFor="phone" className="cursor-pointer">
                  <Phone className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-medium">Phone Demo</div>
                  <div className="text-sm text-gray-600">Screen share via call</div>
                </label>
              </CardContent>
            </Card>
            
            <Card className={`cursor-pointer transition-all ${formData.demoType === "in_person" ? "border-blue-500 bg-blue-50" : ""}`}>
              <CardContent className="p-4 text-center">
                <RadioGroupItem value="in_person" id="in_person" className="sr-only" />
                <label htmlFor="in_person" className="cursor-pointer">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="font-medium">In-Person</div>
                  <div className="text-sm text-gray-600">At your office/ours</div>
                </label>
              </CardContent>
            </Card>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="preferredDate">Preferred Date *</Label>
          <Input
            id="preferredDate"
            type="date"
            value={formData.preferredDate}
            onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
            min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="preferredTime">Preferred Time *</Label>
          <Select value={formData.preferredTime} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredTime: value }))}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>{time}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="alternativeDate">Alternative Date</Label>
          <Input
            id="alternativeDate"
            type="date"
            value={formData.alternativeDate}
            onChange={(e) => setFormData(prev => ({ ...prev, alternativeDate: e.target.value }))}
            min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="alternativeTime">Alternative Time</Label>
          <Select value={formData.alternativeTime} onValueChange={(value) => setFormData(prev => ({ ...prev, alternativeTime: value }))}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>{time}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="attendeeCount">Number of Attendees</Label>
          <Select value={formData.attendeeCount} onValueChange={(value) => setFormData(prev => ({ ...prev, attendeeCount: value }))}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select count" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-2 people">1-2 people</SelectItem>
              <SelectItem value="3-5 people">3-5 people</SelectItem>
              <SelectItem value="6-10 people">6-10 people</SelectItem>
              <SelectItem value="10+ people">10+ people</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="currentListings">Current Property Listings</Label>
          <Input
            id="currentListings"
            value={formData.currentListings}
            onChange={(e) => setFormData(prev => ({ ...prev, currentListings: e.target.value }))}
            placeholder="e.g., 10-20 properties"
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="monthlyBudget">Approximate Monthly Budget</Label>
        <Select value={formData.monthlyBudget} onValueChange={(value) => setFormData(prev => ({ ...prev, monthlyBudget: value }))}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select budget range" />
          </SelectTrigger>
          <SelectContent>
            {monthlyBudgets.map((budget) => (
              <SelectItem key={budget} value={budget}>{budget}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Primary Goals (Select all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {primaryGoals.map((goal) => (
            <div key={goal.id} className="flex items-center space-x-2">
              <Checkbox
                id={goal.id}
                checked={formData.primaryGoals.includes(goal.id)}
                onCheckedChange={() => handleGoalToggle(goal.id)}
              />
              <Label htmlFor={goal.id} className="text-sm cursor-pointer">
                {goal.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Features You're Most Interested In</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {specificFeatures.map((feature) => (
            <div key={feature.id} className="flex items-center space-x-2">
              <Checkbox
                id={feature.id}
                checked={formData.specificFeatures.includes(feature.id)}
                onCheckedChange={() => handleFeatureToggle(feature.id)}
              />
              <Label htmlFor={feature.id} className="text-sm cursor-pointer">
                {feature.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="questions">Specific Questions or Areas to Focus On</Label>
        <Textarea
          id="questions"
          value={formData.questions}
          onChange={(e) => setFormData(prev => ({ ...prev, questions: e.target.value }))}
          placeholder="What specific aspects would you like us to focus on during the demo?"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="specialRequirements">Special Requirements</Label>
        <Textarea
          id="specialRequirements"
          value={formData.specialRequirements}
          onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
          placeholder="Any special accommodations or technical requirements?"
          className="mt-2"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="marketing"
          checked={formData.marketingConsent}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketingConsent: !!checked }))}
        />
        <Label htmlFor="marketing" className="text-sm">
          I consent to receive follow-up communications and updates about Real Estate Hotspot
        </Label>
      </div>

      {packageName && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Demo Focus</span>
          </div>
          <p className="text-blue-700 text-sm">
            This demo will be customized to show how the <strong>{packageName}</strong> package can help achieve your business goals.
          </p>
        </div>
      )}
    </div>
  );

  const content = (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Schedule Your Personal Demo</h3>
        <p className="text-gray-600">
          Get a customized walkthrough of our platform tailored to your business needs
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-600"
            }`}>
              {currentStep > step ? <CheckCircle className="h-4 w-4" /> : step}
            </div>
            {step < 3 && (
              <div className={`w-12 h-0.5 mx-2 ${
                currentStep > step ? "bg-blue-600" : "bg-gray-200"
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-600">
        Step {currentStep} of 3: {
          currentStep === 1 ? "Contact Information" :
          currentStep === 2 ? "Schedule Details" :
          "Business Context"
        }
      </div>

      {/* Step Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            } else {
              onClose();
            }
          }}
        >
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>
        
        {currentStep < 3 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={
              (currentStep === 1 && !isStep1Valid()) ||
              (currentStep === 2 && !isStep2Valid())
            }
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleScheduleDemo}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Demo
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Schedule Demo</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Demo</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default DemoSchedulingModal;
