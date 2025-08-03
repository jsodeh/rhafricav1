import React, { useState } from "react";
import { Link } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  Home,
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  TrendingDown,
  Shield,
  Users,
  Banknote,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  PiggyBank,
  Percent,
  HandCoins,
  Building,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const mortgageTypes = [
  {
    icon: Home,
    title: "Residential Mortgage",
    description: "Finance your dream home with competitive rates",
    features: ["Up to 30-year terms", "Fixed or variable rates", "Down payment from 10%", "Quick approval process"],
    rate: "12.5% - 18%",
    term: "5-30 years",
    color: "bg-blue-500"
  },
  {
    icon: Building,
    title: "Commercial Mortgage",
    description: "Funding solutions for commercial real estate",
    features: ["Flexible repayment terms", "Competitive commercial rates", "Up to ₦2 billion financing", "Expert advisory"],
    rate: "15% - 22%",
    term: "5-25 years",
    color: "bg-green-500"
  },
  {
    icon: PiggyBank,
    title: "Refinancing",
    description: "Lower your monthly payments with better rates",
    features: ["Rate reduction options", "Cash-out refinancing", "Streamlined process", "No prepayment penalties"],
    rate: "11% - 16%",
    term: "Existing term",
    color: "bg-purple-500"
  },
  {
    icon: HandCoins,
    title: "Construction Loan",
    description: "Build your property with phased disbursement",
    features: ["Interest-only payments", "Phased fund release", "Conversion to permanent loan", "Progress monitoring"],
    rate: "16% - 24%",
    term: "6 months - 2 years",
    color: "bg-orange-500"
  }
];

const lendingPartners = [
  {
    name: "First Bank Nigeria",
    logo: "🏦",
    rate: "12.5%",
    maxAmount: "₦500M",
    term: "30 years",
    speciality: "Residential mortgages",
    features: ["Online application", "Quick approval", "Flexible terms"]
  },
  {
    name: "GTBank Mortgage",
    logo: "🏛️",
    rate: "13.2%",
    maxAmount: "₦1B",
    term: "25 years",
    speciality: "Premium mortgages",
    features: ["Premium service", "Relationship banking", "Expert advisory"]
  },
  {
    name: "Access Bank",
    logo: "🏪",
    rate: "14.5%",
    maxAmount: "₦300M",
    term: "25 years",
    speciality: "First-time buyers",
    features: ["Low down payment", "First-time buyer support", "Grace period options"]
  },
  {
    name: "Stanbic IBTC",
    logo: "🏢",
    rate: "13.8%",
    maxAmount: "₦750M",
    term: "30 years",
    speciality: "High-value properties",
    features: ["Jumbo mortgages", "International clients", "Investment properties"]
  }
];

const calculatorSteps = [
  { step: 1, title: "Property Value", description: "Enter the total property price" },
  { step: 2, title: "Down Payment", description: "Amount you can pay upfront" },
  { step: 3, title: "Loan Term", description: "Choose your repayment period" },
  { step: 4, title: "Interest Rate", description: "Current market rate applied" }
];

const processSteps = [
  {
    icon: FileText,
    title: "Pre-qualification",
    description: "Get pre-qualified in minutes with our quick assessment",
    duration: "5 minutes"
  },
  {
    icon: Calculator,
    title: "Application",
    description: "Complete your detailed mortgage application online",
    duration: "30 minutes"
  },
  {
    icon: Users,
    title: "Documentation",
    description: "Submit required documents for verification",
    duration: "1-2 days"
  },
  {
    icon: Shield,
    title: "Approval",
    description: "Get approval decision from our lending partners",
    duration: "3-7 days"
  },
  {
    icon: Home,
    title: "Closing",
    description: "Complete the transaction and get your keys",
    duration: "1-2 weeks"
  }
];

const requirements = [
  "Valid government-issued ID",
  "Proof of income (last 6 months)",
  "Bank statements (last 12 months)",
  "Tax clearance certificate",
  "Property documentation",
  "Employment verification letter",
  "Down payment proof of funds",
  "Property insurance quote"
];

const Mortgage = () => {
  const [propertyValue, setPropertyValue] = useState("50000000");
  const [downPayment, setDownPayment] = useState("5000000");
  const [loanTerm, setLoanTerm] = useState("25");
  const [interestRate, setInterestRate] = useState("14.5");
  const [selectedMortgageType, setSelectedMortgageType] = useState("Residential");
  const [showPreQualForm, setShowPreQualForm] = useState(false);

  // Calculate mortgage payment
  const calculateMortgage = () => {
    const principal = parseFloat(propertyValue) - parseFloat(downPayment);
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const numberOfPayments = parseFloat(loanTerm) * 12;
    
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return {
      monthlyPayment,
      totalPayment: monthlyPayment * numberOfPayments,
      totalInterest: (monthlyPayment * numberOfPayments) - principal,
      loanAmount: principal
    };
  };

  const mortgage = calculateMortgage();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-700 via-green-800 to-blue-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-0 text-sm">
              Partner with Nigeria's Leading Banks
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Get Your Dream Home<br />
              <span className="text-green-400">Mortgage Today</span>
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              Compare mortgage rates from top Nigerian banks, get pre-qualified in minutes, 
              and secure financing for your perfect property with our trusted lending partners.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8"
                onClick={() => {
                  const calculatorSection = document.getElementById('mortgage-calculator');
                  calculatorSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Calculator className="h-5 w-5 mr-2" />
                Calculate My Mortgage
              </Button>
              <Button
                size="lg"
                className="border border-white bg-transparent text-white hover:bg-white hover:text-green-700 px-8 hover:border-white"
                onClick={() => setShowPreQualForm(true)}
              >
                <FileText className="h-5 w-5 mr-2" />
                Get Pre-Qualified
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">12.5%</div>
                <div className="text-green-200">Starting Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">₦2B</div>
                <div className="text-green-200">Max Financing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">30 Yrs</div>
                <div className="text-green-200">Max Term</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">10%</div>
                <div className="text-green-200">Min Down Payment</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mortgage Calculator */}
      <section id="mortgage-calculator" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Mortgage Calculator
              </h2>
              <p className="text-xl text-gray-600">
                Get an estimate of your monthly mortgage payments
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Calculator Inputs */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-green-600" />
                      Loan Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Value
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                        <input
                          type="number"
                          value={propertyValue}
                          onChange={(e) => setPropertyValue(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="50,000,000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Down Payment
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                        <input
                          type="number"
                          value={downPayment}
                          onChange={(e) => setDownPayment(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="5,000,000"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {((parseFloat(downPayment) / parseFloat(propertyValue)) * 100).toFixed(1)}% of property value
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loan Term (Years)
                        </label>
                        <select
                          value={loanTerm}
                          onChange={(e) => setLoanTerm(e.target.value)}
                          className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="10">10 years</option>
                          <option value="15">15 years</option>
                          <option value="20">20 years</option>
                          <option value="25">25 years</option>
                          <option value="30">30 years</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interest Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                          className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="14.5"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Calculator Results */}
              <div className="space-y-6">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">Monthly Payment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-green-200">
                        <span className="text-gray-600">Monthly Payment</span>
                        <span className="text-2xl font-bold text-green-700">
                          {formatCurrency(mortgage.monthlyPayment)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(mortgage.loanAmount)}
                          </div>
                          <div className="text-sm text-gray-600">Loan Amount</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(mortgage.totalInterest)}
                          </div>
                          <div className="text-sm text-gray-600">Total Interest</div>
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(mortgage.totalPayment)}
                        </div>
                        <div className="text-sm text-gray-600">Total Payment Over {loanTerm} Years</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={() => setShowPreQualForm(true)}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Get Pre-Qualified with These Numbers
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mortgage Types */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mortgage Options
            </h2>
            <p className="text-xl text-gray-600">
              Choose the mortgage type that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {mortgageTypes.map((type, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${type.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <type.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{type.title}</h3>
                  <p className="text-gray-600 mb-4 text-center">{type.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Interest Rate:</span>
                      <span className="font-semibold text-green-600">{type.rate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Term:</span>
                      <span className="font-semibold">{type.term}</span>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {type.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-gray-700 flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Lending Partners */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Lending Partners
            </h2>
            <p className="text-xl text-gray-600">
              Compare rates and terms from Nigeria's top banks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {lendingPartners.map((partner, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{partner.logo}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{partner.name}</h3>
                      <p className="text-gray-600">{partner.speciality}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{partner.rate}</div>
                      <div className="text-sm text-gray-600">Interest Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{partner.maxAmount}</div>
                      <div className="text-sm text-gray-600">Max Amount</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{partner.term}</div>
                      <div className="text-sm text-gray-600">Max Term</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {partner.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="text-sm text-gray-700 flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Button className="w-full" variant="outline">
                    Get Quote from {partner.name}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Application Process
            </h2>
            <p className="text-xl text-gray-600">
              Get approved for your mortgage in 5 easy steps
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-2">{step.description}</p>
                  <Badge variant="outline" className="text-xs">{step.duration}</Badge>
                  
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full">
                      <ArrowRight className="h-6 w-6 text-gray-400 mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Start Your Application
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What You'll Need
              </h2>
              <p className="text-xl text-gray-600">
                Prepare these documents for a smooth application process
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-700 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Home className="h-16 w-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Own Your Dream Home?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Get pre-qualified today and start house hunting with confidence. 
              Our mortgage experts are here to guide you every step of the way.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8"
                onClick={() => setShowPreQualForm(true)}
              >
                <Calculator className="h-5 w-5 mr-2" />
                Get Pre-Qualified Now
              </Button>
              <Button
                size="lg"
                className="border border-white bg-transparent text-white hover:bg-white hover:text-green-700 px-8 hover:border-white"
                onClick={() => window.open('tel:+2348012345678', '_self')}
              >
                <Phone className="h-5 w-5 mr-2" />
                Speak to Mortgage Expert
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-green-200 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Secure & Private
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                5-Minute Pre-Qualification
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                No Obligation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Qualification Modal */}
      <Dialog open={showPreQualForm} onOpenChange={setShowPreQualForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Get Pre-Qualified</DialogTitle>
            <DialogDescription>
              Get a quick pre-qualification estimate with the calculated mortgage details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
              <div>
                <Label className="text-sm text-gray-600">Monthly Payment</Label>
                <div className="font-semibold">{formatCurrency(mortgage.monthlyPayment)}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Loan Amount</Label>
                <div className="font-semibold">{formatCurrency(mortgage.loanAmount)}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="preQualName">Full Name</Label>
                <Input id="preQualName" placeholder="Enter your full name" />
              </div>
              <div>
                <Label htmlFor="preQualEmail">Email Address</Label>
                <Input id="preQualEmail" type="email" placeholder="Enter your email" />
              </div>
              <div>
                <Label htmlFor="preQualPhone">Phone Number</Label>
                <Input id="preQualPhone" type="tel" placeholder="Enter your phone number" />
              </div>
              <div>
                <Label htmlFor="preQualIncome">Monthly Income</Label>
                <Input id="preQualIncome" type="number" placeholder="Enter your monthly income" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPreQualForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Here you would typically submit the form data
                  alert('Pre-qualification submitted! We will contact you within 24 hours.');
                  setShowPreQualForm(false);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Submit Application
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Mortgage;
