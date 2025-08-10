import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import ProfileSetupProgress from "@/components/ProfileSetupProgress";
import ErrorDisplay from "@/components/ErrorDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useActivity } from "@/hooks/useActivity";
import { useToast } from "@/components/Toast";
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
  Share2,
  Trash2,
  Plus,
  User,
  Edit,
  CreditCard,
  Filter,
} from "lucide-react";

// Real user data from auth context and database

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { user } = useAuth();
  const { profile, savedProperties, savedSearches, isLoading: profileLoading, error: profileError } = useUserProfile();
  const { activities, isLoading: activitiesLoading, error: activitiesError } = useActivity();
  const { showError } = useToast();
  const navigate = useNavigate();

  // Show profile setup on first visit or if profile is incomplete
  useEffect(() => {
    const hasSeenSetup = localStorage.getItem('hasSeenProfileSetup');
    if (!hasSeenSetup && user) {
      setShowProfileSetup(true);
      localStorage.setItem('hasSeenProfileSetup', 'true');
    }
  }, [user]);

  // Handle errors with user-friendly messages
  useEffect(() => {
    if (profileError) {
      showError(profileError, {
        label: 'Retry',
        onClick: () => window.location.reload()
      });
    }
  }, [profileError, showError]);

  useEffect(() => {
    if (activitiesError) {
      showError(activitiesError);
    }
  }, [activitiesError, showError]);

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
              src={user?.profilePhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"}
              alt={user?.name || "User"}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(" ")[0] || "User"}!
              </h1>
              <p className="text-gray-600">
                {user?.accountType || "User"} • Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
                    {profileLoading ? '...' : savedProperties.length}
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
                    {profileLoading ? '...' : savedSearches.length}
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
                    Profile Complete
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile ? Math.round(((profile.full_name ? 1 : 0) + 
                                        (profile.phone ? 1 : 0) + 
                                        (profile.location ? 1 : 0) + 
                                        (profile.avatar_url ? 1 : 0)) / 4 * 100) : 0}%
                  </p>
                </div>
                <User className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Account Status
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user?.emailVerified ? 'Verified' : 'Pending'}
                  </p>
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
                  {profileLoading ? (
                    <div className="text-center py-4 text-gray-600">Loading...</div>
                  ) : profileError ? (
                    <ErrorDisplay 
                      error={profileError} 
                      onRetry={() => window.location.reload()}
                      className="mb-4"
                    />
                  ) : savedProperties.length > 0 ? (
                    savedProperties.slice(0, 2).map((favorite) => {
                      if (!favorite.properties) return null;
                      return (
                        <div
                          key={favorite.id}
                          className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <img
                            src={favorite.properties.images?.[0] || '/placeholder.svg'}
                            alt={favorite.properties.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {favorite.properties.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {favorite.properties.address}, {favorite.properties.city}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-semibold text-blue-700">
                                ₦{favorite.properties.price?.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                Saved {new Date(favorite.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }).filter(Boolean)
                  ) : (
                    <div className="text-center py-4 text-gray-600">
                      No saved properties yet
                    </div>
                  )}
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
                  {activitiesLoading ? (
                    <div className="text-center py-4 text-gray-600">Loading...</div>
                  ) : activitiesError ? (
                    <ErrorDisplay 
                      error={activitiesError} 
                      onRetry={() => window.location.reload()}
                      className="mb-4"
                    />
                  ) : activities.length > 0 ? (
                    activities.slice(0, 4).map((activity) => (
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
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-600">
                      No recent activity
                    </div>
                  )}
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

            {profileLoading ? (
              <div className="text-center py-8 text-gray-600">Loading your saved properties...</div>
            ) : profileError ? (
              <ErrorDisplay 
                error={profileError} 
                onRetry={() => window.location.reload()}
                className="mb-4"
              />
            ) : savedProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProperties.map((favorite) => {
                  if (!favorite.properties) return null;
                  const property = favorite.properties;
                  return (
                    <Card
                      key={favorite.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={property.images?.[0] || '/placeholder.svg'}
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
                            ₦{property.price?.toLocaleString()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
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
                        <div className="text-xs text-gray-500 mb-3">
                          Saved on {new Date(favorite.created_at).toLocaleDateString()}
                        </div>
                        <Link to={`/properties/${property.id}`}>
                          <Button className="w-full">View Details</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                }).filter(Boolean)}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved properties yet</h3>
                <p className="text-gray-600 mb-4">Start exploring properties and save your favorites!</p>
                <Link to="/properties">
                  <Button>Browse Properties</Button>
                </Link>
              </div>
            )}
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
              {profileLoading ? (
                <div className="text-center py-4 text-gray-600">Loading...</div>
              ) : savedSearches.length > 0 ? (
                savedSearches.map((search) => (
                <Card key={search.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {search.name}
                          </h3>
                          <Badge
                            variant={search.email_alerts ? "default" : "secondary"}
                          >
                            {search.email_alerts ? "Alerts On" : "Alerts Off"}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">
                          {Object.entries(search.search_criteria).map(([key, value]) => 
                            `${key}: ${value}`
                          ).join(', ')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(search.created_at).toLocaleDateString()}
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
                ))
              ) : (
                <div className="text-center py-4 text-gray-600">
                  No saved searches yet
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <h2 className="text-2xl font-semibold">Activity History</h2>

            <div className="space-y-4">
              {activitiesLoading ? (
                <div className="text-center py-4 text-gray-600">Loading...</div>
              ) : activities.length > 0 ? (
                activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <activity.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{activity.title}</p>
                        {activity.description && (
                          <p className="text-sm text-gray-600">{activity.description}</p>
                        )}
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              ) : (
                <div className="text-center py-4 text-gray-600">
                  No activity history yet
                </div>
              )}
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
                      value={user?.name || ""}
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
                      value={user?.email || ""}
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
                      value={user?.phone || ""}
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
                        {user?.accountType || "Basic User"}
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
