import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import ProfileSetupProgress from "@/components/ProfileSetupProgress";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Search,
  Bell,
  Settings,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  TrendingUp,
  Eye,
  Share2,
  Trash2,
  Plus,
  Home,
  User,
  Mail,
  Phone,
  Edit,
  CreditCard,
  Building,
  Filter,
} from "lucide-react";

// Mock user data - in real app would come from auth context/API
const mockUser = {
  name: "John Doe",
  email: "john.doe@email.com",
  phone: "+234 801 234 5678",
  memberSince: "January 2024",
  accountType: "Premium Buyer",
  profilePhoto:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
};

// Mock saved properties
const mockSavedProperties = [
  {
    id: 1,
    title: "Modern 3-Bedroom Apartment",
    location: "Victoria Island, Lagos",
    price: "₦45,000,000",
    bedrooms: 3,
    bathrooms: 2,
    area: "150 sqm",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    savedDate: "2024-01-15",
    priceChange: "+2.3%",
    status: "For Sale",
  },
  {
    id: 2,
    title: "Luxury 4BR Penthouse",
    location: "Ikoyi, Lagos",
    price: "₦120,000,000",
    bedrooms: 4,
    bathrooms: 3,
    area: "280 sqm",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop",
    savedDate: "2024-01-10",
    priceChange: "-1.5%",
    status: "For Sale",
  },
];

// Mock saved searches
const mockSavedSearches = [
  {
    id: 1,
    name: "3BR Apartments in VI",
    criteria: "3 bedrooms, Victoria Island, ₦30M-₦60M",
    newResults: 5,
    lastChecked: "2 hours ago",
    alerts: true,
  },
  {
    id: 2,
    name: "Family Homes Lekki",
    criteria: "4+ bedrooms, Lekki, ₦40M-₦80M",
    newResults: 12,
    lastChecked: "1 day ago",
    alerts: false,
  },
];

// Mock recent activities
const mockActivities = [
  {
    id: 1,
    type: "property_viewed",
    title: "Viewed Modern 3-Bedroom Apartment",
    time: "2 hours ago",
    icon: Eye,
  },
  {
    id: 2,
    type: "property_saved",
    title: "Saved Luxury 4BR Penthouse to favorites",
    time: "1 day ago",
    icon: Heart,
  },
  {
    id: 3,
    type: "search_created",
    title: "Created new search: 3BR Apartments in VI",
    time: "3 days ago",
    icon: Search,
  },
  {
    id: 4,
    type: "agent_contacted",
    title: "Contacted Sarah Johnson about property",
    time: "5 days ago",
    icon: Mail,
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Show profile setup on first visit or if profile is incomplete
  useEffect(() => {
    const hasSeenSetup = localStorage.getItem('hasSeenProfileSetup');
    if (!hasSeenSetup && user) {
      setShowProfileSetup(true);
      localStorage.setItem('hasSeenProfileSetup', 'true');
    }
  }, [user]);

  useEffect(() => {
    // Redirect to role-specific dashboard if user type is not buyer/renter
    if (user?.accountType) {
      const userType = user.accountType.toLowerCase();
      if (userType.includes("agent")) {
        navigate("/agent-dashboard");
      } else if (userType.includes("owner") || userType.includes("landlord")) {
        navigate("/owner-dashboard");
      } else if (
        userType.includes("service") ||
        userType.includes("professional")
      ) {
        navigate("/service-dashboard");
      }
      // If buyer/renter, stay on current dashboard
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <img
              src={mockUser.profilePhoto}
              alt={mockUser.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {mockUser.name.split(" ")[0]}!
              </h1>
              <p className="text-gray-600">
                {mockUser.accountType} • Member since {mockUser.memberSince}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowProfileSetup(true)}
            >
              <User className="h-4 w-4" />
              Setup Profile
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Saved Properties
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockSavedProperties.length}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Saved Searches
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockSavedSearches.length}
                  </p>
                </div>
                <Search className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Properties Viewed
                  </p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    New Alerts
                  </p>
                  <p className="text-2xl font-bold text-gray-900">7</p>
                </div>
                <Bell className="h-8 w-8 text-amber-500" />
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="searches">Searches</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Saved Properties */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Recently Saved
                  </CardTitle>
                  <Link to="/dashboard?tab=saved">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockSavedProperties.slice(0, 2).map((property) => (
                    <div
                      key={property.id}
                      className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {property.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {property.location}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-semibold text-blue-700">
                            {property.price}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              property.priceChange.startsWith("+")
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {property.priceChange}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <Link to="/dashboard?tab=activity">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockActivities.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <activity.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.title}
                        </p>
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
                  <Link to="/search">
                    <Button
                      variant="outline"
                      className="w-full h-16 flex flex-col gap-2"
                    >
                      <Search className="h-5 w-5" />
                      <span className="text-sm">Search Properties</span>
                    </Button>
                  </Link>
                  <Link to="/map">
                    <Button
                      variant="outline"
                      className="w-full h-16 flex flex-col gap-2"
                    >
                      <MapPin className="h-5 w-5" />
                      <span className="text-sm">Map Search</span>
                    </Button>
                  </Link>
                  <Link to="/agents">
                    <Button
                      variant="outline"
                      className="w-full h-16 flex flex-col gap-2"
                    >
                      <User className="h-5 w-5" />
                      <span className="text-sm">Find Agents</span>
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full h-16 flex flex-col gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-sm">List Property</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Saved Properties</h2>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockSavedProperties.map((property) => (
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
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-blue-600">
                      {property.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl font-bold text-blue-700">
                        {property.price}
                      </span>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          property.priceChange.startsWith("+")
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {property.priceChange}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        <span>{property.area}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      Saved on{" "}
                      {new Date(property.savedDate).toLocaleDateString()}
                    </div>
                    <Link to={`/properties/${property.id}`}>
                      <Button className="w-full">View Details</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="searches" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Saved Searches</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Search
              </Button>
            </div>

            <div className="space-y-4">
              {mockSavedSearches.map((search) => (
                <Card key={search.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {search.name}
                          </h3>
                          <Badge
                            variant={search.alerts ? "default" : "secondary"}
                          >
                            {search.alerts ? "Alerts On" : "Alerts Off"}
                          </Badge>
                          {search.newResults > 0 && (
                            <Badge variant="destructive">
                              {search.newResults} New
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{search.criteria}</p>
                        <p className="text-sm text-gray-500">
                          Last checked: {search.lastChecked}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          View Results
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <h2 className="text-2xl font-semibold">Activity History</h2>

            <div className="space-y-4">
              {mockActivities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <activity.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-semibold">Profile Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={mockUser.name}
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
                      value={mockUser.email}
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
                      value={mockUser.phone}
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
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">
                        Receive updates about your searches
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Privacy Settings</h4>
                      <p className="text-sm text-gray-600">
                        Manage your privacy preferences
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Subscription</h4>
                      <p className="text-sm text-gray-600">
                        {mockUser.accountType}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Setup Progress Modal */}
      <ProfileSetupProgress 
        isOpen={showProfileSetup} 
        onClose={() => setShowProfileSetup(false)} 
      />
    </div>
  );
};

export default Dashboard;
