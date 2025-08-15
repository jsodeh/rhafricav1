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
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { usePayment } from "@/integrations/paystack";
import { useToast } from "@/hooks/use-toast";
import { useAdvertising } from "@/hooks/useAdvertising";
import {
  CreditCard,
  Building,
  Mail,
  Phone,
  User,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Shield,
  Star,
  Calendar,
  Users,
} from "lucide-react";

interface PackagePurchaseModalProps {
  open: boolean;
  onClose: () => void;
  selectedPackage: {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
  };
}

interface PurchaseFormData {
  // Business Information
  businessName: string;
  businessType: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  
  // Package Details
  billingCycle: "monthly" | "quarterly" | "yearly";
  startDate: string;
  
  // Additional Services
  additionalServices: string[];
  specialRequirements: string;
  
  // Payment Information
  agreedToTerms: boolean;
  marketingConsent: boolean;
}

const businessTypes = [
  "Real Estate Agency",
  "Property Developer",
  "Individual Agent",
  "Property Management Company",
  "Investment Company",
  "Construction Company",
  "Other"
];

const additionalServices = [
  { id: "photography", name: "Professional Photography", price: 25000 },
  { id: "virtual_tour", name: "Virtual Tour Creation", price: 50000 },
  { id: "social_media", name: "Social Media Management", price: 75000 },
  { id: "content_writing", name: "Content Writing Services", price: 30000 },
  { id: "seo", name: "SEO Optimization", price: 40000 },
  { id: "training", name: "Platform Training Session", price: 20000 },
];

const PackagePurchaseModal: React.FC<PackagePurchaseModalProps> = ({
  open,
  onClose,
  selectedPackage,
}) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { makePayment, formatAmount } = usePayment();
  const { toast } = useToast();
  const { createCampaign } = useAdvertising();
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PurchaseFormData>({
    businessName: "",
    businessType: "",
    contactPerson: user?.name || "",
    email: user?.email || "",
    phone: "",
    location: "",
    billingCycle: "monthly",
    startDate: new Date().toISOString()?.split('T')[0] || new Date().toISOString().slice(0, 10),
    additionalServices: [],
    specialRequirements: "",
    agreedToTerms: false,
    marketingConsent: false,
  });

  const calculateTotal = () => {
    const basePrice = parseInt(selectedPackage.price.replace(/[^\d]/g, ''));
    const additionalCost = formData.additionalServices.reduce((total, serviceId) => {
      const service = additionalServices.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
    
    let multiplier = 1;
    if (formData.billingCycle === "quarterly") multiplier = 3;
    if (formData.billingCycle === "yearly") multiplier = 12;
    
    // Apply discount for longer billing cycles
    let discount = 0;
    if (formData.billingCycle === "quarterly") discount = 0.05; // 5% discount
    if (formData.billingCycle === "yearly") discount = 0.15; // 15% discount
    
    const subtotal = (basePrice * multiplier) + additionalCost;
    const discountAmount = subtotal * discount;
    return subtotal - discountAmount;
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(serviceId)
        ? prev.additionalServices.filter(id => id !== serviceId)
        : [...prev.additionalServices, serviceId]
    }));
  };

  const handlePurchase = async () => {
    if (!formData.agreedToTerms) {
      toast({
        title: "Terms and Conditions",
        description: "Please accept the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const totalAmount = calculateTotal();
      const reference = `ADV_${selectedPackage.name.toUpperCase()}_${Date.now()}`;
      
      const result = await makePayment(
        formData.email,
        totalAmount,
        `pkg_${selectedPackage.name.toLowerCase()}`,
        "advertising_package",
        {
          packageName: selectedPackage.name,
          billingCycle: formData.billingCycle,
          businessName: formData.businessName,
          businessType: formData.businessType,
          additionalServices: formData.additionalServices,
          startDate: formData.startDate,
          specialRequirements: formData.specialRequirements,
        }
      );

      if (result.success) {
        // Create campaign after successful payment
        const campaignResult = await createCampaign({
          packageName: selectedPackage.name,
          billingCycle: formData.billingCycle,
          startDate: formData.startDate,
          totalAmount,
          features: selectedPackage.features,
          maxListings: selectedPackage.name === 'Starter' ? 5 : selectedPackage.name === 'Professional' ? 25 : 999,
          metadata: {
            businessName: formData.businessName,
            businessType: formData.businessType,
            additionalServices: formData.additionalServices,
            specialRequirements: formData.specialRequirements,
            paymentReference: result.reference,
          },
        });

        if (campaignResult.success) {
          toast({
            title: "Payment Successful!",
            description: "Your advertising package has been activated. Our team will contact you within 24 hours to set up your account.",
          });
          onClose();
        } else {
          toast({
            title: "Campaign Setup Failed",
            description: "Payment was successful but campaign setup failed. Our team will contact you to resolve this.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Payment could not be processed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.businessName &&
      formData.businessType &&
      formData.contactPerson &&
      formData.email &&
      formData.phone &&
      formData.location &&
      formData.agreedToTerms
    );
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
            placeholder="Your company or agency name"
          />
        </div>
        <div>
          <Label htmlFor="businessType">Business Type *</Label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactPerson">Contact Person *</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
            placeholder="Full name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="business@example.com"
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
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="City, State"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label>Billing Cycle</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          {[
            { value: "monthly", label: "Monthly", discount: "" },
            { value: "quarterly", label: "Quarterly", discount: "5% OFF" },
            { value: "yearly", label: "Yearly", discount: "15% OFF" },
          ].map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all ${
                formData.billingCycle === option.value ? "border-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setFormData(prev => ({ ...prev, billingCycle: option.value as any }))}
            >
              <CardContent className="p-4 text-center">
                <div className="font-medium">{option.label}</div>
                {option.discount && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {option.discount}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="startDate">Campaign Start Date</Label>
        <Input
          id="startDate"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          min={new Date().toISOString()?.split('T')[0] || new Date().toISOString().slice(0, 10)}
          className="mt-2"
        />
      </div>

      <div>
        <Label>Additional Services (Optional)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {additionalServices.map((service) => (
            <Card key={service.id} className="p-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={service.id}
                  checked={formData.additionalServices.includes(service.id)}
                  onCheckedChange={() => handleServiceToggle(service.id)}
                />
                <div className="flex-1">
                  <label htmlFor={service.id} className="text-sm font-medium cursor-pointer">
                    {service.name}
                  </label>
                  <div className="text-sm text-gray-600">
                    {formatAmount(service.price)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="specialRequirements">Special Requirements</Label>
        <Textarea
          id="specialRequirements"
          value={formData.specialRequirements}
          onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
          placeholder="Any specific requirements or preferences..."
          className="mt-2"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>{selectedPackage.name} Package ({formData.billingCycle})</span>
            <span>{formatAmount(parseInt(selectedPackage.price.replace(/[^\d]/g, '')) * (formData.billingCycle === 'monthly' ? 1 : formData.billingCycle === 'quarterly' ? 3 : 12))}</span>
          </div>
          
          {formData.additionalServices.map(serviceId => {
            const service = additionalServices.find(s => s.id === serviceId);
            if (!service) return null;
            return (
              <div key={serviceId} className="flex justify-between text-sm">
                <span>{service.name}</span>
                <span>{formatAmount(service.price)}</span>
              </div>
            );
          })}
          
          {(formData.billingCycle === 'quarterly' || formData.billingCycle === 'yearly') && (
            <div className="flex justify-between text-green-600">
              <span>Billing Discount ({formData.billingCycle === 'quarterly' ? '5%' : '15%'})</span>
              <span>-{formatAmount(calculateTotal() * (formData.billingCycle === 'quarterly' ? 0.05 : 0.15) / (1 - (formData.billingCycle === 'quarterly' ? 0.05 : 0.15)))}</span>
            </div>
          )}
          
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatAmount(calculateTotal())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={formData.agreedToTerms}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreedToTerms: !!checked }))}
          />
          <Label htmlFor="terms" className="text-sm">
            I agree to the <span className="text-blue-600 underline cursor-pointer">Terms and Conditions</span> and <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span> *
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="marketing"
            checked={formData.marketingConsent}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketingConsent: !!checked }))}
          />
          <Label htmlFor="marketing" className="text-sm">
            I consent to receive marketing communications and updates about new features
          </Label>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-blue-900">Secure Payment</div>
            <div className="text-blue-700">Your payment is processed securely through Paystack. We don't store your card details.</div>
          </div>
        </div>
      </div>
    </div>
  );

  const content = (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Purchase {selectedPackage.name} Package</h3>
        <p className="text-gray-600">{selectedPackage.description}</p>
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
            disabled={currentStep === 1 && (!formData.businessName || !formData.email || !formData.phone)}
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handlePurchase}
            disabled={!isFormValid() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Complete Purchase
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
            <DrawerTitle>Package Purchase</DrawerTitle>
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
          <DialogTitle>Package Purchase</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default PackagePurchaseModal;
