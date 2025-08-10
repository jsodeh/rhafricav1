import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import ContactFormModal from "@/components/ContactFormModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Award,
  TrendingUp,
  Home,
  Users,
  Clock,
  CheckCircle,
  ArrowLeft,
  Share2,
  Heart,
  Bed,
  Bath,
  Square,
} from "lucide-react";
import { useContactForms } from "@/hooks/useContactForms";
import { supabase } from "@/integrations/supabase/client";

interface Agent {
  id: string;
  user_id: string;
  agency_name: string;
  license_number: string;
  phone: string;
  email: string;
  bio?: string;
  specializations?: string[];
  experience_years?: number;
  verification_status: string;
  rating?: number;
  total_reviews?: number;
  profile_image_url?: string;
  created_at: string;
  user_profiles?: {
    full_name: string;
    location?: string;
  };
}

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  images: string[];
  status: string;
  created_at: string;
}

const AgentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { submitContactForm } = useContactForms();

  useEffect(() => {
    if (id) {
      fetchAgentData();
    }
  }, [id]);

  const fetchAgentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch agent data
      const { data: agentData, error: agentError } = await supabase
        .from('real_estate_agents')
        .select(`
          *,
          user_profiles (
            full_name,
            location
          )
        `)
        .eq('id', id)
        .single();

      if (agentError) {
        throw agentError;
      }

      if (!agentData) {
        setError('Agent not found');
        return;
      }

      setAgent(agentData);

      // Fetch agent's properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', agentData.user_id)
        .order('created_at', { ascending: false });

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
      } else {
        setProperties(propertiesData || []);
      }

    } catch (err: any) {
      console.error('Error fetching agent:', err);
      setError(err.message || 'Failed to load agent profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StickyNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading agent profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StickyNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Agent Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || "The agent profile you're looking for doesn't exist or has been removed."}
            </p>
            <div className="space-x-4">
              <Link to="/agents">
                <Button>Browse All Agents</Button>
              </Link>
              <Link to="/">
                <Button variant="outline">Go Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const agentName = agent.user_profiles?.full_name || 'Real Estate Agent';
  const agentLocation = agent.user_profiles?.location || 'Lagos, Nigeria';
  const agentRating = agent.rating || 0;
  const agentReviews = agent.total_reviews || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/agents">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Agents
            </Button>
          </Link>
        </div>

        {/* Agent Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-shrink-0">
                <img
                  src={agent.profile_image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"}
                  alt={agentName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {agentName}
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">
                      {agent.agency_name}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{agentLocation}</span>
                    </div>
                    
                    {agentRating > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(agentRating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{agentRating.toFixed(1)}</span>
                        <span className="text-gray-500">({agentReviews} reviews)</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">
                        {agent.experience_years ? `${agent.experience_years} years experience` : 'Experienced Agent'}
                      </Badge>
                      <Badge variant="outline" className={
                        agent.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }>
                        {agent.verification_status === 'verified' ? 'Verified Agent' : 'Pending Verification'}
                      </Badge>
                      {agent.license_number && (
                        <Badge variant="outline">Licensed</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => setShowContactModal(true)}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contact Agent
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Details Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">Listings ({properties.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Agent Stats */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {agentName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {agent.bio || `${agentName} is a professional real estate agent with ${agent.agency_name}. They are committed to helping clients find their perfect property and providing exceptional service throughout the buying and selling process.`}
                    </p>
                  </CardContent>
                </Card>

                {agent.specializations && agent.specializations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Specializations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {agent.specializations.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{agent.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{agent.email || 'Not provided'}</span>
                    </div>
                    {agent.license_number && (
                      <div className="flex items-center gap-3">
                        <Award className="h-4 w-4 text-gray-500" />
                        <span>License: {agent.license_number}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Listings</span>
                      <span className="font-semibold">{properties.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience</span>
                      <span className="font-semibold">
                        {agent.experience_years ? `${agent.experience_years} years` : 'Experienced'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verification</span>
                      <Badge variant={agent.verification_status === 'verified' ? 'default' : 'secondary'}>
                        {agent.verification_status === 'verified' ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={property.images?.[0] || '/placeholder.svg'}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-3 left-3 bg-blue-600">
                        {property.status}
                      </Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-3 right-3 bg-white/90"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <span className="text-xl font-bold text-blue-700">
                          ₦{property.price?.toLocaleString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{property.address}, {property.city}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                        {property.area_sqm && (
                          <div className="flex items-center gap-1">
                            <Square className="h-4 w-4" />
                            <span>{property.area_sqm}m²</span>
                          </div>
                        )}
                      </div>
                      <Link to={`/properties/${property.id}`}>
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings Yet</h3>
                <p className="text-gray-600">This agent hasn't listed any properties yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">Be the first to leave a review for this agent.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Modal */}
      <ContactFormModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        type="agent"
        recipientId={agent.id}
        recipientName={agentName}
        recipientEmail={agent.email}
        recipientRole="agent"
        title="Contact Agent"
        description={`Send a message to ${agentName}`}
        onSubmit={submitContactForm}
      />
    </div>
  );
};

export default AgentProfile;