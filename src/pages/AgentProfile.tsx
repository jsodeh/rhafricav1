import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import ContactFormModal from "@/components/ContactFormModal";
import { useContactForms } from "@/hooks/useContactForms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Award,
  Home,
  TrendingUp,
  Clock,
  Languages,
  Share2,
  Heart,
  ArrowLeft,
} from "lucide-react";

// Mock agent data - in real app this would come from an API
const mockAgentData = {
  "1": {
    id: "1",
    name: "Sarah Johnson",
    title: "Senior Real Estate Agent",
    company: "Lagos Property Group",
    photo:
      "https://images.unsplash.com/photo-1594736797933-d0ca9265b069?w=400&h=400&fit=crop&crop=face",
    rating: 4.9,
    reviewCount: 127,
    location: "Victoria Island, Lagos",
    specialties: [
      "Luxury Homes",
      "Waterfront Properties",
      "Investment Properties",
      "Commercial Real Estate",
    ],
    experience: "8 years",
    languages: ["English", "Yoruba", "Igbo"],
    phone: "+234 801 234 5678",
    email: "sarah.johnson@lpg.com",
    recentSales: 45,
    avgPrice: "₦85,000,000",
    responseTime: "< 1 hour",
    bio: "With over 8 years of experience in Lagos's luxury real estate market, Sarah has helped hundreds of clients find their dream homes and investment properties. She specializes in waterfront properties and high-end developments across Victoria Island and Ikoyi.",
    certifications: [
      "NIESV Certified",
      "Real Estate License #LG-2156",
      "Luxury Property Specialist",
    ],
    totalSales: "₦12.8 billion",
    activeListings: 28,
    soldThisYear: 45,
    education: "BSc Real Estate - University of Lagos",
    serviceAreas: [
      "Victoria Island",
      "Ikoyi",
      "Lekki Phase 1",
      "Banana Island",
    ],
    socialMedia: {
      linkedin: "https://linkedin.com/in/sarahjohnson",
      instagram: "@sarahjohnsonrealty",
      twitter: "@sjohnson_realty",
    },
  },
  "2": {
    id: "2",
    name: "Michael Adebayo",
    title: "Real Estate Consultant",
    company: "Prime Properties Nigeria",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    rating: 4.8,
    reviewCount: 89,
    location: "Lekki, Lagos",
    specialties: ["Residential Properties", "First-time Buyers", "Property Investment", "Land Development"],
    experience: "6 years",
    languages: ["English", "Yoruba", "Hausa"],
    phone: "+234 802 345 6789",
    email: "michael.adebayo@primeprop.com",
    recentSales: 32,
    avgPrice: "₦65,000,000",
    responseTime: "< 2 hours",
    bio: "Michael brings 6 years of experience in residential real estate, specializing in helping first-time buyers find their dream homes. His expertise in Lekki and mainland Lagos properties makes him the go-to agent for quality residential investments.",
    certifications: ["NIESV Member", "Real Estate License #LG-3247", "Property Investment Advisor"],
    totalSales: "₦8.2 billion",
    activeListings: 22,
    soldThisYear: 32,
    education: "MBA Real Estate Finance - Lagos Business School",
    serviceAreas: ["Lekki Phase 1", "Lekki Phase 2", "Ajah", "Sangotedo"],
    socialMedia: {
      linkedin: "https://linkedin.com/in/michaeladebayo",
      instagram: "@michael_realty_ng",
      twitter: "@madebayo_homes",
    },
  },
  "3": {
    id: "3",
    name: "Fatima Hassan",
    title: "Commercial Real Estate Specialist",
    company: "Hassan & Associates",
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b47b?w=400&h=400&fit=crop&crop=face",
    rating: 4.9,
    reviewCount: 156,
    location: "Abuja, FCT",
    specialties: ["Commercial Properties", "Office Buildings", "Retail Spaces", "Industrial Properties"],
    experience: "10 years",
    languages: ["English", "Hausa", "French"],
    phone: "+234 803 456 7890",
    email: "fatima.hassan@hassanassoc.com",
    recentSales: 18,
    avgPrice: "₦180,000,000",
    responseTime: "< 30 minutes",
    bio: "With a decade of experience in commercial real estate, Fatima is Abuja's leading expert in office buildings and retail spaces. She has facilitated over ₦20 billion in commercial property transactions across Nigeria's capital.",
    certifications: ["NIESV Certified", "Commercial Real Estate License #AB-1156", "Investment Property Specialist", "CCIM Candidate"],
    totalSales: "₦20.5 billion",
    activeListings: 15,
    soldThisYear: 18,
    education: "MSc Estate Management - University of Abuja",
    serviceAreas: ["Central Business District", "Garki", "Wuse", "Maitama"],
    socialMedia: {
      linkedin: "https://linkedin.com/in/fatimahassan",
      instagram: "@fatima_commercial_realty",
      twitter: "@fhassan_realty",
    },
  },
  "4": {
    id: "4",
    name: "David Okoro",
    title: "Luxury Property Specialist",
    company: "Elite Homes Lagos",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    rating: 4.7,
    reviewCount: 73,
    location: "Ikoyi, Lagos",
    specialties: ["Luxury Estates", "High-End Condos", "Celebrity Homes", "Exclusive Listings"],
    experience: "5 years",
    languages: ["English", "Igbo"],
    phone: "+234 804 567 8901",
    email: "david.okoro@elitehomes.com",
    recentSales: 28,
    avgPrice: "₦120,000,000",
    responseTime: "< 1 hour",
    bio: "David specializes in luxury properties in Ikoyi and exclusive developments. Known for his discretion and professionalism when dealing with high-profile clients and premium properties.",
    certifications: ["NIESV Certified", "Luxury Property License #LG-4578", "Celebrity Real Estate Specialist"],
    totalSales: "₦9.8 billion",
    activeListings: 18,
    soldThisYear: 28,
    education: "BSc Architecture - University of Nigeria, Nsukka",
    serviceAreas: ["Ikoyi", "Banana Island", "Victoria Island", "Lekki Phase 1"],
    socialMedia: {
      linkedin: "https://linkedin.com/in/davidokoro",
      instagram: "@david_luxury_homes",
      twitter: "@dokoro_luxury",
    },
  },
  "5": {
    id: "5",
    name: "Aisha Musa",
    title: "Affordable Housing Expert",
    company: "Musa Realty Solutions",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    rating: 4.8,
    reviewCount: 94,
    location: "Kano, Nigeria",
    specialties: ["Affordable Housing", "Government Schemes", "Rural Properties", "Land Acquisition"],
    experience: "7 years",
    languages: ["English", "Hausa", "Fulfulde"],
    phone: "+234 805 678 9012",
    email: "aisha.musa@musarealty.com",
    recentSales: 67,
    avgPrice: "₦25,000,000",
    responseTime: "< 3 hours",
    bio: "Aisha is passionate about making homeownership accessible to everyone. She specializes in affordable housing schemes and has helped over 200 families secure their first homes through government and private initiatives.",
    certifications: ["NIESV Member", "Affordable Housing Specialist #KN-2234", "Rural Development Advisor"],
    totalSales: "₦4.2 billion",
    activeListings: 45,
    soldThisYear: 67,
    education: "BSc Estate Management - Ahmadu Bello University",
    serviceAreas: ["Kano Metropolitan", "Kaduna", "Zaria", "Jos"],
    socialMedia: {
      linkedin: "https://linkedin.com/in/aishamusa",
      instagram: "@aisha_affordable_homes",
      twitter: "@amusa_realty",
    },
  },
  "6": {
    id: "6",
    name: "Chinedu Okafor",
    title: "Investment Property Advisor",
    company: "Okafor Investment Properties",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
    rating: 4.9,
    reviewCount: 112,
    location: "Port Harcourt, Rivers",
    specialties: ["Investment Properties", "Portfolio Building", "Rental Properties", "ROI Analysis"],
    experience: "9 years",
    languages: ["English", "Igbo"],
    phone: "+234 806 789 0123",
    email: "chinedu.okafor@okaforinvest.com",
    recentSales: 34,
    avgPrice: "₦75,000,000",
    responseTime: "< 2 hours",
    bio: "With 9 years of experience in investment real estate, Chinedu helps clients build profitable property portfolios. His analytical approach and market insights have generated millions in returns for his clients.",
    certifications: ["NIESV Certified", "Investment Property License #PH-3456", "Portfolio Management Certified", "Real Estate Financial Analyst"],
    totalSales: "₦11.5 billion",
    activeListings: 31,
    soldThisYear: 34,
    education: "MSc Finance - University of Port Harcourt",
    serviceAreas: ["Port Harcourt", "Aba", "Owerri", "Uyo"],
    socialMedia: {
      linkedin: "https://linkedin.com/in/chineduokafor",
      instagram: "@chinedu_invest_realty",
      twitter: "@cokafor_invest",
    },
  },
};

// Mock property listings for the agent
const mockAgentListings = [
  {
    id: "1",
    title: "Luxury 4BR Waterfront Penthouse",
    location: "Banana Island, Lagos",
    price: "₦280,000,000",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop",
    beds: 4,
    baths: 5,
    sqft: "3,500 sq ft",
    status: "For Sale",
    daysOnMarket: 15,
  },
  {
    id: "2",
    title: "Modern 3BR Apartment with Pool",
    location: "Victoria Island, Lagos",
    price: "₦125,000,000",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    beds: 3,
    baths: 3,
    sqft: "2,200 sq ft",
    status: "For Sale",
    daysOnMarket: 8,
  },
  {
    id: "3",
    title: "Executive 5BR Family Home",
    location: "Ikoyi, Lagos",
    price: "₦350,000,000",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
    beds: 5,
    baths: 6,
    sqft: "4,800 sq ft",
    status: "Sold",
    daysOnMarket: 22,
  },
];

// Mock reviews
const mockReviews = [
  {
    id: "1",
    name: "David Okonkwo",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Sarah helped us find our dream home in record time. Her knowledge of the Lagos market is exceptional and she was always available to answer our questions.",
    propertyType: "Luxury Home Purchase",
  },
  {
    id: "2",
    name: "Mrs. Adebisi",
    rating: 5,
    date: "1 month ago",
    comment:
      "Professional, knowledgeable, and incredibly patient. Sarah made selling our property stress-free and got us above asking price!",
    propertyType: "Property Sale",
  },
  {
    id: "3",
    name: "James Chen",
    rating: 4,
    date: "2 months ago",
    comment:
      "Great experience working with Sarah. She understood exactly what we were looking for and found us several excellent investment opportunities.",
    propertyType: "Investment Property",
  },
];

const AgentProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("about");
  const [showAllListings, setShowAllListings] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const { submitContactForm } = useContactForms();

  const agent = mockAgentData[id as keyof typeof mockAgentData];

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StickyNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowLeft className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Agent Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The agent profile you're looking for doesn't exist or may have been removed.
              Try browsing our available agents or contact us for assistance.
            </p>
            <div className="space-y-3">
              <Link to="/agents" className="block">
                <Button className="w-full">Browse All Agents</Button>
              </Link>
              <Link to="/help" className="block">
                <Button variant="outline" className="w-full">Contact Support</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayedListings = showAllListings
    ? mockAgentListings
    : mockAgentListings.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />

      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/agents"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Agents
          </Link>
        </div>
      </div>

      {/* Agent Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Agent Photo and Basic Info */}
            <div className="flex flex-col items-center lg:items-start">
              <img
                src={agent.photo}
                alt={agent.name}
                className="w-32 h-32 lg:w-48 lg:h-48 rounded-lg object-cover mb-4"
              />
              <div className="flex gap-2 mb-4">
                <Button size="sm" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" variant="outline">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Agent Details */}
            <div className="flex-1">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {agent.name}
                </h1>
                <p className="text-xl text-gray-600 mb-1">{agent.title}</p>
                <p className="text-lg text-gray-500 mb-4">{agent.company}</p>

                {/* Rating and Reviews */}
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900 ml-1">
                        {agent.rating}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      ({agent.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{agent.location}</span>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-gray-900">
                      {agent.experience}
                    </div>
                    <div className="text-sm text-gray-500">Experience</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-gray-900">
                      {agent.recentSales}
                    </div>
                    <div className="text-sm text-gray-500">Recent Sales</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-gray-900">
                      {agent.avgPrice}
                    </div>
                    <div className="text-sm text-gray-500">Avg. Price</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-sm font-semibold text-green-600">
                      {agent.responseTime}
                    </div>
                    <div className="text-sm text-gray-500">Response Time</div>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                  <Button
                    variant="blue"
                    className="flex-1"
                    onClick={() => setShowContactModal(true)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Tour
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: "about", label: "About" },
              { id: "listings", label: "Current Listings" },
              { id: "reviews", label: "Reviews" },
              { id: "contact", label: "Contact" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-700 text-blue-700 font-medium"
                    : "border-transparent text-gray-600 hover:text-blue-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === "about" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main About Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4">
                      About {agent.name}
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {agent.bio}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Specialties
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {agent.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Service Areas
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {agent.serviceAreas.map((area, index) => (
                            <Badge key={index} variant="outline">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Languages
                        </h3>
                        <div className="flex items-center gap-2">
                          <Languages className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">
                            {agent.languages.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Stats */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-6">
                      Professional Stats
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-700 mb-2">
                          {agent.totalSales}
                        </div>
                        <div className="text-sm text-gray-500">Total Sales</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-700 mb-2">
                          {agent.activeListings}
                        </div>
                        <div className="text-sm text-gray-500">
                          Active Listings
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-700 mb-2">
                          {agent.soldThisYear}
                        </div>
                        <div className="text-sm text-gray-500">
                          Sold This Year
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-700 mb-2">
                          {agent.experience}
                        </div>
                        <div className="text-sm text-gray-500">Experience</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Certifications */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-700" />
                      Certifications
                    </h3>
                    <div className="space-y-2">
                      {agent.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-700 bg-gray-50 p-2 rounded"
                        >
                          {cert}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Education */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Education
                    </h3>
                    <p className="text-gray-700">{agent.education}</p>
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{agent.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{agent.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-green-600 font-medium">
                          Responds {agent.responseTime}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "listings" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Current Listings</h2>
                <div className="text-gray-600">
                  {mockAgentListings.length} properties
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {displayedListings.map((property) => (
                  <Card
                    key={property.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant={
                            property.status === "Sold"
                              ? "destructive"
                              : "default"
                          }
                          className={
                            property.status === "Sold"
                              ? "bg-red-600"
                              : "bg-green-600"
                          }
                        >
                          {property.status}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-700 mb-2">
                        {property.price}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{property.location}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{property.beds} beds</span>
                        <span>{property.baths} baths</span>
                        <span>{property.sqft}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.daysOnMarket} days on market
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!showAllListings && mockAgentListings.length > 3 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllListings(true)}
                    className="min-w-32"
                  >
                    View All Listings
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Client Reviews</h2>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{agent.rating}</span>
                  <span className="text-gray-600">
                    ({agent.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {review.propertyType}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {review.date}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold text-center mb-6">
                    Contact {agent.name}
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        I'm interested in...
                      </label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Buying a home</option>
                        <option>Selling a home</option>
                        <option>Renting a property</option>
                        <option>Investment opportunities</option>
                        <option>General consultation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tell me about your real estate needs..."
                      />
                    </div>
                    <Button variant="blue" className="w-full">
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Contact Agent Modal */}
      <ContactFormModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        type="agent"
        recipientId={agent.id}
        recipientName={agent.name}
        recipientRole={agent.title}
        title="Contact Agent"
        description={`Send a message to ${agent.name}`}
        defaultSubject={`Inquiry from Real Estate Platform`}
        onSubmit={submitContactForm}
      />
    </div>
  );
};

export default AgentProfile;
