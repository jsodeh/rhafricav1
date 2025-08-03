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

// Mock agent data
const mockAgentData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@realestate.com",
  phone: "+234 801 234 5678",
  license: "RE-2024-001",
  company: "Lagos Property Group",
  joinDate: "January 2020",
  profilePhoto:
    "https://images.unsplash.com/photo-1594736797933-d0ca9265b069?w=400&h=400&fit=crop&crop=face",
  rating: 4.9,
  totalReviews: 127,
  totalSales: 156,
  totalCommission: "₦45,800,000",
  activeListings: 12,
  pendingDeals: 8,
};

// Mock listings data
const mockListings = [
  {
    id: 1,
    title: "Modern 3-Bedroom Apartment",
    location: "Victoria Island, Lagos",
    price: "₦45,000,000",
    status: "Active",
    bedrooms: 3,
    bathrooms: 2,
    area: "150 sqm",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    daysOnMarket: 15,
    views: 234,
    inquiries: 8,
    tours: 5,
    createdDate: "2024-01-15",
  },
  {
    id: 2,
    title: "Luxury 4BR Penthouse",
    location: "Ikoyi, Lagos",
    price: "₦120,000,000",
    status: "Under Contract",
    bedrooms: 4,
    bathrooms: 3,
    area: "280 sqm",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop",
    daysOnMarket: 45,
    views: 567,
    inquiries: 23,
    tours: 12,
    createdDate: "2024-01-01",
  },
  {
    id: 3,
    title: "Family House with Garden",
    location: "Lekki, Lagos",
    price: "₦75,000,000",
    status: "Sold",
    bedrooms: 4,
    bathrooms: 3,
    area: "220 sqm",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
    daysOnMarket: 30,
    views: 345,
    inquiries: 15,
    tours: 8,
    createdDate: "2023-12-15",
  },
];

// Mock clients data
const mockClients = [
  {
    id: 1,
    name: "David Okonkwo",
    email: "david.okonkwo@email.com",
    phone: "+234 802 345 6789",
    type: "Buyer",
    status: "Active",
    budget: "₦50M - ₦80M",
    preferences: "3-4 BR, Victoria Island, Modern",
    lastContact: "2024-01-20",
    source: "Website",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Mrs. Adebisi",
    email: "adebisi@email.com",
    phone: "+234 803 456 7890",
    type: "Seller",
    status: "Under Contract",
    budget: "₦35M - ₦45M",
    preferences: "Quick Sale, Furnished",
    lastContact: "2024-01-18",
    source: "Referral",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "James Chen",
    email: "james.chen@email.com",
    phone: "+234 804 567 8901",
    type: "Investor",
    status: "Active",
    budget: "₦100M+",
    preferences: "High ROI, Commercial",
    lastContact: "2024-01-19",
    source: "Cold Call",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
];

// Mock recent activities
const mockActivities = [
  {
    id: 1,
    type: "inquiry",
    message: "New inquiry on Modern 3-Bedroom Apartment",
    client: "David Okonkwo",
    time: "2 hours ago",
    icon: MessageCircle,
  },
  {
    id: 2,
    type: "tour",
    message: "Scheduled tour for Luxury 4BR Penthouse",
    client: "Mrs. Adebisi",
    time: "4 hours ago",
    icon: Calendar,
  },
  {
    id: 3,
    type: "listing",
    message: "Family House with Garden marked as sold",
    client: "",
    time: "1 day ago",
    icon: Home,
  },
  {
    id: 4,
    type: "client",
    message: "Added new client: James Chen",
    client: "James Chen",
    time: "2 days ago",
    icon: Users,
  },
];

const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [listingFilter, setListingFilter] = useState("all");

  const filteredListings = mockListings.filter((listing) => {
    if (listingFilter === "all") return true;
    return listing.status.toLowerCase() === listingFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <img
              src={mockAgentData.profilePhoto}
              alt={mockAgentData.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Agent Dashboard
              </h1>
              <p className="text-gray-600">
                {mockAgentData.name} • {mockAgentData.company}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {mockAgentData.rating}
                </span>
                <span className="text-sm text-gray-500">
                  ({mockAgentData.totalReviews} reviews)
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="flex items-center gap-2">
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
                    {mockAgentData.activeListings}
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
                    {mockAgentData.totalSales}
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
                    {mockAgentData.totalCommission}
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
                    {mockAgentData.pendingDeals}
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
                  {mockListings.slice(0, 3).map((listing) => (
                    <div
                      key={listing.id}
                      className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {listing.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {listing.location}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-semibold text-blue-700">
                            {listing.price}
                          </span>
                          <Badge
                            variant={
                              listing.status === "Active"
                                ? "default"
                                : listing.status === "Sold"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {listing.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>{listing.views} views</span>
                          <span>{listing.inquiries} inquiries</span>
                          <span>{listing.tours} tours</span>
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
                  {mockActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <activity.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.message}
                        </p>
                        {activity.client && (
                          <p className="text-xs text-blue-600">
                            {activity.client}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
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
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-sm">Add Listing</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-16 flex flex-col gap-2"
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Add Client</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-16 flex flex-col gap-2"
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">Schedule Tour</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-16 flex flex-col gap-2"
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
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Listing
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={listing.image}
                      alt={listing.title}
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
                        listing.status === "Active"
                          ? "bg-green-600"
                          : listing.status === "Sold"
                            ? "bg-red-600"
                            : "bg-yellow-600"
                      }`}
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl font-bold text-blue-700">
                        {listing.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        {listing.daysOnMarket} days
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{listing.location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{listing.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{listing.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        <span>{listing.area}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs bg-gray-50 p-2 rounded mb-3">
                      <div>
                        <div className="font-semibold">{listing.views}</div>
                        <div className="text-gray-500">Views</div>
                      </div>
                      <div>
                        <div className="font-semibold">{listing.inquiries}</div>
                        <div className="text-gray-500">Inquiries</div>
                      </div>
                      <div>
                        <div className="font-semibold">{listing.tours}</div>
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
              {mockClients.map((client) => (
                <Card key={client.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={client.avatar}
                          alt={client.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {client.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <Badge variant="outline">{client.type}</Badge>
                            <Badge
                              variant={
                                client.status === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {client.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Budget: {client.budget} • {client.preferences}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Last contact: {client.lastContact} • Source:{" "}
                            {client.source}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={mockAgentData.name}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={mockAgentData.email}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={mockAgentData.phone}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={mockAgentData.license}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      readOnly
                    />
                  </div>
                  <Button className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Commission Structure</h4>
                      <p className="text-sm text-gray-600">
                        Manage your commission rates
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Notification Preferences</h4>
                      <p className="text-sm text-gray-600">
                        Email and SMS settings
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Lead Sources</h4>
                      <p className="text-sm text-gray-600">
                        Configure lead tracking
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Setup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentDashboard;
