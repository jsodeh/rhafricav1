import React, { useState } from "react";
import { Link } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Home,
  Users,
  MessageCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Bed,
  Bath,
  Square,
  Star,
  Clock,
  Filter,
  Download,
  BarChart3,
  Target,
  Award,
  Settings,
} from "lucide-react";
import ChatManagement from "@/components/ChatManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProperties } from "@/hooks/useProperties";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import EmptyState from "@/components/EmptyState";

// Real agent data will be loaded from user context and profile

// Real listings: fetched via useProperties filtered to agent

// Clients section will render an empty state until a proper CRM is integrated

// No mock activities; will show an empty state until real activity feed is integrated

const AgentDashboard = () => {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const [activeTab, setActiveTab] = useState("overview");
  const [listingFilter, setListingFilter] = useState("all");
  const { properties, isLoading: propsLoading, error: propsError, isEmpty } = useProperties({});
  const { notifyAdmins } = useNotifications();
  const { toast } = useToast();

  // Agent profile form state
  const [agentRow, setAgentRow] = useState<any | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentSaving, setAgentSaving] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [agentPhone, setAgentPhone] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState<string>("");
  const [specializations, setSpecializations] = useState<string>("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");

  // Load agent row
  React.useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setAgentLoading(true);
      try {
        const { data } = await supabase
          .from('real_estate_agents')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        setAgentRow(data || null);
        setAgencyName(data?.agency_name || "");
        setLicenseNumber(data?.license_number || "");
        setAgentPhone(data?.phone || profile?.phone || user?.phone || "");
        setBio(data?.bio || "");
        setYearsExperience(data?.years_experience ? String(data.years_experience) : "");
        setSpecializations(Array.isArray(data?.specializations) ? data.specializations.join(', ') : "");
        setInstagram(data?.social_media?.instagram || "");
        setFacebook(data?.social_media?.facebook || "");
        setTwitter(data?.social_media?.twitter || "");
        setWebsite(data?.social_media?.website || "");
      } finally {
        setAgentLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const saveAgentProfile = async () => {
    if (!user?.id) return;
    setAgentSaving(true);
    try {
      const payload: any = {
        user_id: user.id,
        agency_name: agencyName || null,
        license_number: licenseNumber || null,
        phone: agentPhone || null,
        bio: bio || null,
        years_experience: yearsExperience ? Number(yearsExperience) : null,
        specializations: specializations
          ? specializations.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        social_media: {
          instagram: instagram || null,
          facebook: facebook || null,
          twitter: twitter || null,
          website: website || null,
        },
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('real_estate_agents')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .maybeSingle();
      if (error) throw error;
      setAgentRow(data);
      toast({ title: 'Saved', description: 'Agent profile updated.' });

      // If there was no row before, notify admins
      if (!agentRow) {
        try { await notifyAdmins('Agent profile submitted', `${user.email || 'An agent'} submitted a profile and awaits verification`, 'info', 'system', '/admin-dashboard', { userId: user.id }); } catch {}
      }
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.message || 'Could not save agent profile', variant: 'destructive' });
    } finally {
      setAgentSaving(false);
    }
  };

  const requestVerification = async () => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('real_estate_agents')
        .update({ verification_status: 'pending', updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      if (error) throw error;
      setAgentRow(prev => prev ? { ...prev, verification_status: 'pending' } : prev);
      toast({ title: 'Verification requested', description: 'An admin will review your profile shortly.' });
      try { await notifyAdmins('Agent verification requested', `${user.email || 'An agent'} requested verification`, 'info', 'system', '/admin-dashboard', { userId: user.id }); } catch {}
    } catch (e: any) {
      toast({ title: 'Request failed', description: e?.message || 'Could not request verification', variant: 'destructive' });
    }
  };

  // Aggregate counts
  const activeListingsCount = (properties || []).filter((p: any) => (p.status || '').toLowerCase() === 'for_sale' || (p.status || '').toLowerCase() === 'for_rent').length;

  // Real agent data from user and profile
  const agentData = {
    name: user?.name || "Agent",
    email: user?.email || "",
    phone: agentPhone || profile?.phone || user?.phone || "",
    license: licenseNumber || "Not provided",
    company: agencyName || "",
    joinDate: user ? new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "",
    profilePhoto: user?.profilePhoto || profile?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    rating: 0, // Will be calculated from real reviews
    totalReviews: 0, // Will be fetched from database
    totalSales: 0, // Will be calculated from real sales
    totalCommission: "₦0", // Will be calculated from real data
    activeListings: activeListingsCount, // from properties
    pendingDeals: 0,
  };

  const filteredListings = (properties || []).filter((listing: any) => {
    if (listingFilter === "all") return true;
    return (listing.status || '').toLowerCase() === listingFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <img
              src={agentData.profilePhoto}
              alt={agentData.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Agent Dashboard
              </h1>
              <p className="text-gray-600">
                {agentData.name} • {agentData.company}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {agentData.rating}
                </span>
                <span className="text-sm text-gray-500">
                  ({agentData.totalReviews} reviews)
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="flex items-center gap-2" onClick={() => (window.location.href = '/properties/add')}>
              <Plus className="h-4 w-4" />
              Add Listing
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Messages
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Listings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {agentData.activeListings}
                  </p>
                </div>
                <Home className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Sales
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {agentData.totalSales}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Commission Earned
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {agentData.totalCommission}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Deals
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {agentData.pendingDeals}
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Listings Performance */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-500" />
                    Recent Listings
                  </CardTitle>
                  <Link to="#listings">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                 <CardContent className="space-y-4">
                  {filteredListings.slice(0, 3).map((listing: any) => (
                    <div
                      key={listing.id}
                      className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <img
                        src={(listing.images && listing.images[0]) || '/placeholder.svg'}
                        alt={listing.title || 'Property'}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {listing.title || 'Untitled Property'}
                        </h4>
                        <p className="text-sm text-gray-600">
                           {`${listing.address || ''}${listing.city ? `, ${listing.city}` : ''}`}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-semibold text-blue-700">
                            {`₦${Number(listing.price || 0).toLocaleString()}`}
                          </span>
                          <Badge
                            variant={((listing.status || '').toString().toLowerCase() === 'sold' || (listing.status || '').toString().toLowerCase() === 'off_market') ? 'destructive' : 'default'}
                          >
                            {(listing.status || '').toString()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                           <span>{listing.views_count || 0} views</span>
                           <span>0 inquiries</span>
                           <span>0 tours</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Activities</CardTitle>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {true ? (
                    <EmptyState
                      icon={MessageCircle}
                      title="No Recent Activity"
                      description="Your latest listing and client activities will appear here."
                      className="py-8"
                    />
                  ) : null}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <Button
                    variant="outline"
                    className="w-full h-16 flex flex-col gap-2"
                    onClick={() => (window.location.href = '/properties/add')}
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-sm">Add Listing</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-16 flex flex-col gap-2"
                    onClick={() => (window.location.href = '/clients/new')}
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Add Client</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-16 flex flex-col gap-2"
                    onClick={() => (window.location.href = '/calendar')}
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">Schedule Tour</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-16 flex flex-col gap-2"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm">View Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Listings</h2>
              <div className="flex gap-3">
                <select
                  value={listingFilter}
                  onChange={(e) => setListingFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="under contract">Under Contract</option>
                  <option value="sold">Sold</option>
                </select>
                <Button className="flex items-center gap-2" onClick={() => (window.location.href = '/properties/add')}>
                  <Plus className="h-4 w-4" />
                  Add New Listing
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing: any) => (
                <Card
                  key={listing.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={(listing.images && listing.images[0]) || '/placeholder.svg'}
                      alt={listing.title || 'Property'}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge
                      className={`absolute top-3 left-3 ${
                        ((listing.status || '').toString().toLowerCase() === 'sold' || (listing.status || '').toString().toLowerCase() === 'off_market')
                          ? 'bg-red-600'
                          : 'bg-green-600'
                      }`}
                    >
                      {(listing.status || '').toString()}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl font-bold text-blue-700">
                        {`₦${Number(listing.price || 0).toLocaleString()}`}
                      </span>
                      <span className="text-sm text-gray-500">{listing.listing_type || ''}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {listing.title || 'Untitled Property'}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{`${listing.address || ''}${listing.city ? `, ${listing.city}` : ''}`}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{listing.bedrooms ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{listing.bathrooms ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        <span>{listing.area_sqm ? `${listing.area_sqm} sqm` : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs bg-gray-50 p-2 rounded mb-3">
                      <div>
                        <div className="font-semibold">{listing.views_count || 0}</div>
                        <div className="text-gray-500">Views</div>
                      </div>
                      <div>
                        <div className="font-semibold">0</div>
                        <div className="text-gray-500">Inquiries</div>
                      </div>
                      <div>
                        <div className="font-semibold">0</div>
                        <div className="text-gray-500">Tours</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Clients</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Client
              </Button>
            </div>

            <div className="space-y-4">
              <EmptyState
                icon={Users}
                title="No Clients Yet"
                description="Your client list will appear here once you start engaging prospects and buyers."
                className="py-12"
              />
            </div>
          </TabsContent>

          <TabsContent value="chats" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Live Chat Management</h2>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Real-time
                </Badge>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <ChatManagement mode="agent" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-semibold">Performance Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>New Listings</span>
                      <span className="font-semibold">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Properties Sold</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commission Earned</span>
                      <span className="font-semibold">₦2,800,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New Clients</span>
                      <span className="font-semibold">7</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Avg. Days on Market</span>
                      <span className="font-semibold">30 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Listing-to-Sale Ratio</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Client Satisfaction</span>
                      <span className="font-semibold">4.9/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Time</span>
                      <span className="font-semibold">&lt; 1 hour</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Goals & Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Monthly Sales Goal</span>
                        <span className="text-sm">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">New Listings Goal</span>
                        <span className="text-sm">100%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full w-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Client Acquisition</span>
                        <span className="text-sm">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full w-[87%]"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <h2 className="text-2xl font-semibold">Calendar & Appointments</h2>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Calendar Integration Coming Soon
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Manage your appointments, property tours, and client
                    meetings all in one place.
                  </p>
                  <Button>Set Up Calendar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-semibold">Agent Profile</h2>

            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" value={agentData.name} className="w-full border border-gray-300 rounded-md px-3 py-2" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" value={agentData.email} className="w-full border border-gray-300 rounded-md px-3 py-2" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input type="tel" value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agency Name</label>
                    <input type="text" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <input type="number" min="0" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[100px]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specializations (comma separated)</label>
                  <input type="text" value={specializations} onChange={(e) => setSpecializations(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Luxury, Residential, Investment" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                    <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                    <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                    <input type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={saveAgentProfile} disabled={agentSaving}>
                    {agentSaving ? 'Saving...' : 'Save Profile'}
                  </Button>
                  <Button variant="outline" onClick={requestVerification} disabled={agentRow?.verification_status === 'pending' || agentSaving}>
                    {agentRow?.verification_status === 'verified' ? 'Verified' : agentRow?.verification_status === 'pending' ? 'Pending Verification' : 'Request Verification'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentDashboard;
