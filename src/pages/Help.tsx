import React, { useState } from "react";
import { Link } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import ContactFormModal from "@/components/ContactFormModal";
import LiveChatWidget from "@/components/LiveChatWidget";
import SupportTickets from "@/components/SupportTickets";
import KnowledgeBase from "@/components/KnowledgeBase";
import { useContactForms } from "@/hooks/useContactForms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Users,
  Home,
  CreditCard,
  Shield,
  BookOpen,
  HeadphonesIcon,
  Clock,
  Globe,
  FileText,
  Video,
  Download,
} from "lucide-react";

const faqData = [
  {
    category: "Getting Started",
    icon: BookOpen,
    questions: [
      {
        question: "How do I create an account on Real Estate Hotspot?",
        answer: "Creating an account is simple! Click 'Get Started' in the top navigation, choose your account type (Buyer, Renter, Agent, Owner, or Service Professional), fill in your details, and verify your email. Your personalized dashboard will be ready in minutes."
      },
      {
        question: "What types of properties can I find on the platform?",
        answer: "We feature residential properties (apartments, houses, penthouses), commercial properties (offices, retail spaces), land for development, and rental properties across Nigeria. All listings are verified for authenticity and quality."
      },
      {
        question: "Is Real Estate Hotspot free to use?",
        answer: "Basic browsing, searching, and contacting agents is completely free for buyers and renters. Property owners and agents have access to premium features with our subscription plans. Service professionals can list their services with flexible pricing options."
      }
    ]
  },
  {
    category: "Property Search",
    icon: Search,
    questions: [
      {
        question: "How do I search for properties?",
        answer: "Use our advanced search features to filter by location, price range, property type, bedrooms, bathrooms, and amenities. You can also use our interactive map view to explore properties in specific neighborhoods."
      },
      {
        question: "Can I save properties I'm interested in?",
        answer: "Yes! Click the heart icon on any property to save it to your favorites. You can access all saved properties from your dashboard and receive notifications about price changes or updates."
      },
      {
        question: "How do I schedule a property viewing?",
        answer: "Click 'Schedule Viewing' on any property page, choose your preferred date and time, and the agent will confirm your appointment. You'll receive email and SMS confirmations with all the details."
      }
    ]
  },
  {
    category: "For Agents & Owners",
    icon: Users,
    questions: [
      {
        question: "How do I list my property?",
        answer: "After verifying your account, go to your dashboard and click 'Add Property'. Upload high-quality photos, add detailed descriptions, set your price, and submit for review. Approved listings go live within 24 hours."
      },
      {
        question: "What verification is required for agents?",
        answer: "Agents must provide valid real estate licenses, government-issued ID, and company documentation. We also conduct background checks to ensure all agents meet our professional standards."
      },
      {
        question: "How do payments and commissions work?",
        answer: "Our secure escrow system handles all transactions. Agent commissions are automatically calculated and released upon successful completion of deals. Owners receive payments directly to their verified bank accounts."
      }
    ]
  },
  {
    category: "Safety & Security",
    icon: Shield,
    questions: [
      {
        question: "How does the escrow system work?",
        answer: "Our escrow service holds buyer deposits securely until all terms are met. This protects both buyers and sellers, ensuring funds are only released when all parties fulfill their obligations and legal requirements are satisfied."
      },
      {
        question: "Are all agents and properties verified?",
        answer: "Yes! Every agent undergoes KYC verification and license validation. All properties are physically verified by our team, and we conduct title searches to ensure clear ownership before listing approval."
      },
      {
        question: "What if I encounter a fraudulent listing?",
        answer: "Report suspicious listings immediately using the 'Report' button. Our security team investigates all reports within 24 hours. We also maintain a database of flagged individuals and properties to prevent future fraud."
      }
    ]
  },
  {
    category: "Payments & Transactions",
    icon: CreditCard,
    questions: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept bank transfers, card payments, and mobile money through our secure Paystack integration. All transactions are encrypted and PCI DSS compliant for maximum security."
      },
      {
        question: "Are there any hidden fees?",
        answer: "No hidden fees! All charges are clearly displayed before payment. Basic platform use is free, with transparent pricing for premium features and transaction processing fees clearly stated."
      },
      {
        question: "How long do transactions take to process?",
        answer: "Card payments are instant, bank transfers typically take 1-2 business days. Escrow releases are processed within 24 hours of all conditions being met and verified by our team."
      }
    ]
  }
];

const supportChannels = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Get instant help from our support team",
    availability: "24/7",
    action: "Start Chat",
    color: "bg-blue-500"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our experts",
    availability: "9 AM - 9 PM",
    action: "Call Now",
    color: "bg-green-500"
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us detailed questions or documents",
    availability: "Response within 24 hours",
    action: "Send Email",
    color: "bg-purple-500"
  },
  {
    icon: Video,
    title: "Video Call",
    description: "Schedule a video consultation",
    availability: "By appointment",
    action: "Schedule Call",
    color: "bg-orange-500"
  }
];

const resourcesData = [
  {
    icon: FileText,
    title: "User Guides",
    description: "Step-by-step guides for all platform features",
    items: ["Buyer's Guide", "Seller's Guide", "Agent Handbook", "Investment Tips"]
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Watch how-to videos for common tasks",
    items: ["Property Search", "Listing Creation", "Scheduling Viewings", "Payment Process"]
  },
  {
    icon: Download,
    title: "Legal Documents",
    description: "Download important legal forms and templates",
    items: ["Purchase Agreement", "Rental Agreement", "Due Diligence Checklist", "Property Inspection Form"]
  },
  {
    icon: Globe,
    title: "Market Insights",
    description: "Stay updated with real estate market trends",
    items: ["Lagos Market Report", "Abuja Price Trends", "Investment Hotspots", "Market Forecast"]
  }
];

const Help = () => {
  const [openFaq, setOpenFaq] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const { submitContactForm } = useContactForms();

  const toggleFaq = (category: string, index: number) => {
    const key = `${category}-${index}`;
    setOpenFaq(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredFaqs = selectedCategory 
    ? faqData.filter(section => section.category === selectedCategory)
    : faqData;

  const searchFilteredFaqs = searchQuery 
    ? filteredFaqs.map(section => ({
        ...section,
        questions: section.questions.filter(q => 
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.questions.length > 0)
    : filteredFaqs;

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How can we help you?
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Find answers to common questions, get support, or explore our resources
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles, guides, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help Stats */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">&lt; 1hr</div>
              <div className="text-sm text-gray-600">Average Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">98%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">5,000+</div>
              <div className="text-sm text-gray-600">Issues Resolved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Support</h2>
            <p className="text-lg text-gray-600">Choose the best way to reach our support team</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${channel.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <channel.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{channel.title}</h3>
                  <p className="text-gray-600 mb-3">{channel.description}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4" />
                    {channel.availability}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (channel.title === "Live Chat") setShowLiveChat(true);
                      else if (channel.title === "Email Support") setShowContactModal(true);
                    }}
                  >
                    {channel.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Find quick answers to common questions</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="mb-2"
            >
              All Categories
            </Button>
            {faqData.map((section) => (
              <Button
                key={section.category}
                variant={selectedCategory === section.category ? "default" : "outline"}
                onClick={() => setSelectedCategory(section.category)}
                className="mb-2"
              >
                <section.icon className="h-4 w-4 mr-2" />
                {section.category}
              </Button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto space-y-8">
            {searchFilteredFaqs.map((section) => (
              <div key={section.category}>
                <div className="flex items-center gap-3 mb-4">
                  <section.icon className="h-6 w-6 text-blue-700" />
                  <h3 className="text-xl font-semibold text-gray-900">{section.category}</h3>
                  <Badge variant="secondary">{section.questions.length}</Badge>
                </div>
                
                <div className="space-y-3">
                  {section.questions.map((faq, index) => {
                    const key = `${section.category}-${index}`;
                    const isOpen = openFaq[key];
                    
                    return (
                      <Card key={index} className="border border-gray-200">
                        <CardHeader 
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleFaq(section.category, index)}
                        >
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-medium text-gray-900">
                              {faq.question}
                            </CardTitle>
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </CardHeader>
                        {isOpen && (
                          <CardContent className="pt-0">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {searchFilteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search or browse all categories</p>
            </div>
          )}
        </div>
      </section>

      {/* Comprehensive Help Center */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Help Center</h2>
            <p className="text-lg text-gray-600">Access our full range of support tools and resources</p>
          </div>

          {/* Help Center Tabs */}
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <Button
                variant={activeTab === "overview" ? "default" : "outline"}
                onClick={() => setActiveTab("overview")}
                className="mb-2"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={activeTab === "knowledge-base" ? "default" : "outline"}
                onClick={() => setActiveTab("knowledge-base")}
                className="mb-2"
              >
                <FileText className="h-4 w-4 mr-2" />
                Knowledge Base
              </Button>
              <Button
                variant={activeTab === "support-tickets" ? "default" : "outline"}
                onClick={() => setActiveTab("support-tickets")}
                className="mb-2"
              >
                <HeadphonesIcon className="h-4 w-4 mr-2" />
                Support Tickets
              </Button>
              <Button
                variant={activeTab === "live-support" ? "default" : "outline"}
                onClick={() => setActiveTab("live-support")}
                className="mb-2"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Support
              </Button>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {resourcesData.map((resource, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <resource.icon className="h-6 w-6 text-blue-700" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                      <p className="text-gray-600 mb-4">{resource.description}</p>
                      <ul className="space-y-2">
                        {resource.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-sm text-blue-700 hover:text-blue-800 cursor-pointer">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "knowledge-base" && (
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  <KnowledgeBase />
                </CardContent>
              </Card>
            )}

            {activeTab === "support-tickets" && (
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  <SupportTickets />
                </CardContent>
              </Card>
            )}

            {activeTab === "live-support" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {supportChannels.map((channel, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 ${channel.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <channel.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{channel.title}</h3>
                      <p className="text-gray-600 mb-3">{channel.description}</p>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                        <Clock className="h-4 w-4" />
                        {channel.availability}
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          if (channel.title === "Live Chat") setShowLiveChat(true);
                          else if (channel.title === "Email Support") setShowContactModal(true);
                          else if (channel.title === "Video Call") setShowContactModal(true);
                        }}
                      >
                        {channel.action}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-blue-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <HeadphonesIcon className="h-16 w-16 text-blue-200 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Our support team is here to help you with any questions or issues
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-gray-100"
                onClick={() => setShowLiveChat(true)}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Start Live Chat
              </Button>
              <Button
                size="lg"
                className="border border-white bg-transparent text-white hover:bg-white hover:text-blue-700 hover:border-white"
                onClick={() => setShowContactModal(true)}
              >
                <Mail className="h-5 w-5 mr-2" />
                Email Support
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support Modal */}
      <ContactFormModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        type="support"
        title="Contact Support"
        description="Send us a detailed message and we'll get back to you within 24 hours"
        defaultSubject="Support Request"
        onSubmit={submitContactForm}
      />

      {/* Live Chat Widget */}
      {showLiveChat && (
        <LiveChatWidget
          defaultOpen={true}
          agentId="support_team"
        />
      )}
    </div>
  );
};

export default Help;
