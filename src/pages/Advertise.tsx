import React, { useState } from "react";
import { Link } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import PackagePurchaseModal from "@/components/PackagePurchaseModal";
import DemoSchedulingModal from "@/components/DemoSchedulingModal";
import ContactFormModal from "@/components/ContactFormModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Globe,
  Smartphone,
  Eye,
  MousePointer,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Calendar,
  CreditCard,
  Shield,
  HeadphonesIcon,
  Building,
  Home,
  MapPin,
  Trophy,
} from "lucide-react";

const advertisingPackages = [
  {
    name: "Starter",
    price: "₦50,000",
    period: "/month",
    description: "Perfect for individual agents and small property owners",
    features: [
      "Up to 5 property listings",
      "Basic listing promotion",
      "Email support",
      "Dashboard analytics",
      "Mobile app presence",
      "Standard listing duration"
    ],
    color: "border-gray-200",
    buttonStyle: "outline",
    popular: false
  },
  {
    name: "Professional",
    price: "₦150,000",
    period: "/month",
    description: "Ideal for established agents and property companies",
    features: [
      "Up to 25 property listings",
      "Premium listing placement",
      "Priority support",
      "Advanced analytics",
      "Featured agent profile",
      "Social media promotion",
      "Lead generation tools",
      "Custom branding options"
    ],
    color: "border-blue-500",
    buttonStyle: "default",
    popular: true
  },
  {
    name: "Enterprise",
    price: "₦350,000",
    period: "/month",
    description: "Complete solution for large real estate companies",
    features: [
      "Unlimited property listings",
      "Homepage banner ads",
      "Dedicated account manager",
      "Custom reporting",
      "API access",
      "White-label solutions",
      "Priority listing placement",
      "Multi-location management",
      "Advanced targeting",
      "Integration support"
    ],
    color: "border-purple-500",
    buttonStyle: "default",
    popular: false
  }
];

const platformStats = [
  {
    icon: Users,
    value: "250,000+",
    label: "Active Users",
    description: "Monthly active property seekers"
  },
  {
    icon: Eye,
    value: "2.5M+",
    label: "Page Views",
    description: "Monthly property page views"
  },
  {
    icon: MapPin,
    value: "36 States",
    label: "Coverage",
    description: "Nationwide property reach"
  },
  {
    icon: MousePointer,
    value: "95%",
    label: "Lead Quality",
    description: "High-intent property inquiries"
  }
];

const successStories = [
  {
    name: "Lagos Property Group",
    type: "Real Estate Agency",
    result: "300% increase in leads",
    quote: "Real Estate Hotspot transformed our business. We've closed more deals in 6 months than in the previous 2 years.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
    package: "Professional"
  },
  {
    name: "Prime Properties Abuja",
    type: "Property Developer",
    result: "50 units sold in 3 months",
    quote: "The targeted advertising helped us reach serious buyers. Our luxury development sold out faster than expected.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    package: "Enterprise"
  },
  {
    name: "Sarah Johnson",
    type: "Independent Agent",
    result: "₦500M in sales volume",
    quote: "The platform's tools and visibility helped me become a top performer in Victoria Island market.",
    image: "https://images.unsplash.com/photo-1594736797933-d0ca9265b069?w=400&h=400&fit=crop&crop=face",
    package: "Professional"
  }
];

const adFormats = [
  {
    icon: Building,
    title: "Property Listings",
    description: "Showcase your properties with high-quality photos and detailed descriptions",
    features: ["Premium placement", "Featured badges", "Social sharing", "Lead capture"]
  },
  {
    icon: Star,
    title: "Featured Agent",
    description: "Boost your professional profile and attract more clients",
    features: ["Profile highlighting", "Increased visibility", "Trust badges", "Review showcase"]
  },
  {
    icon: Target,
    title: "Banner Advertising",
    description: "Display ads across our platform for maximum brand exposure",
    features: ["Homepage placement", "Category targeting", "Mobile optimization", "Click tracking"]
  },
  {
    icon: Globe,
    title: "Sponsored Content",
    description: "Create engaging content that drives property interest",
    features: ["Market insights", "Property guides", "Video content", "SEO optimization"]
  }
];

const Advertise = () => {
  const [selectedPackage, setSelectedPackage] = useState("Professional");
  const [showVideo, setShowVideo] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(advertisingPackages[1]);

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-purple-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-0 text-sm">
              Trusted by 5,000+ Real Estate Professionals
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Reach Nigeria's Largest<br />
              <span className="text-yellow-400">Property Audience</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Connect with over 250,000 active property seekers every month. 
              Showcase your listings, build your brand, and grow your real estate business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8"
                onClick={() => {
                  setCurrentPackage(advertisingPackages[1]); // Professional package
                  setShowPurchaseModal(true);
                }}
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Start Advertising Today
              </Button>
              <Button
                size="lg"
                className="border border-white bg-transparent text-white hover:bg-white hover:text-blue-700 px-8 hover:border-white"
                onClick={() => setShowDemoModal(true)}
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo & Get Started
              </Button>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {platformStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-blue-200 font-medium">{stat.label}</div>
                  <div className="text-sm text-blue-300">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Advertise With Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Real Estate Hotspot?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're Nigeria's most trusted real estate platform, connecting serious buyers 
              with quality properties and professional agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {adFormats.map((format, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <format.icon className="h-8 w-8 text-blue-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{format.title}</h3>
                  <p className="text-gray-600 mb-4">{format.description}</p>
                  <ul className="space-y-2">
                    {format.features.map((feature, featureIndex) => (
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

      {/* Pricing Packages */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Advertising Package
            </h2>
            <p className="text-xl text-gray-600">
              Flexible plans designed to grow with your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {advertisingPackages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.color} ${pkg.popular ? 'border-2 shadow-lg' : ''} hover:shadow-xl transition-shadow`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">{pkg.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-blue-700">{pkg.price}</span>
                    <span className="text-gray-600">{pkg.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{pkg.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={pkg.buttonStyle === 'outline' ? 'outline' : 'blue'}
                    size="lg"
                    onClick={() => {
                      setCurrentPackage(pkg);
                      setShowPurchaseModal(true);
                    }}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Need a custom solution for your business?</p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowContactModal(true)}
            >
              <HeadphonesIcon className="h-5 w-5 mr-2" />
              Contact Sales Team
            </Button>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              See how our partners are growing their real estate business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {successStories.map((story, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{story.name}</h3>
                      <p className="text-gray-600 text-sm">{story.type}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {story.package} Plan
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-blue-700 mb-1">{story.result}</div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  
                  <blockquote className="text-gray-700 italic">
                    "{story.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Choose Your Package</h3>
                <p className="text-gray-600">Select the advertising package that fits your business needs and budget</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Set Up Your Campaign</h3>
                <p className="text-gray-600">Our team helps you create compelling ads and optimize your listings for maximum visibility</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Getting Leads</h3>
                <p className="text-gray-600">Watch your inquiries grow as your properties reach thousands of qualified buyers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Dominate Your Market?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of successful real estate professionals who trust Real Estate Hotspot 
              to grow their business and reach more clients.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8"
                onClick={() => setShowDemoModal(true)}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Schedule a Demo
              </Button>
              <Button
                size="lg"
                className="border border-white bg-transparent text-white hover:bg-white hover:text-blue-700 px-8 hover:border-white"
                onClick={() => {
                  setCurrentPackage(advertisingPackages[0]); // Starter package
                  setShowPurchaseModal(true);
                }}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Start Free Trial
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-blue-200 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                No Setup Fees
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Cancel Anytime
              </div>
              <div className="flex items-center gap-2">
                <HeadphonesIcon className="h-4 w-4" />
                24/7 Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <PackagePurchaseModal
        open={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        selectedPackage={currentPackage}
      />

      <DemoSchedulingModal
        open={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        packageName={selectedPackage}
      />

      <ContactFormModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        type="service"
        defaultSubject="Sales Inquiry - Advertising Package"
        defaultMessage="Hi, I'm interested in learning more about your advertising packages and would like to speak with a sales representative."
      />
    </div>
  );
};

export default Advertise;
