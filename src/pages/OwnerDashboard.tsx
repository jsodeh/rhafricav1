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
  DollarSign,
  Calendar,
  Bell,
  Settings,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Bed,
  Bath,
  Square,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Wrench,
  CreditCard,
  BarChart3,
  Download,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import EmptyState from "@/components/EmptyState";
import { useProperties } from "@/hooks/useProperties";

// Real owner data will be loaded from user context



// No mock maintenance requests; show empty state until integrated


const OwnerDashboard = () => {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const [activeTab, setActiveTab] = useState("overview");
  const [propertyFilter, setPropertyFilter] = useState("all");

  // Real owner data
  const ownerData = {
    name: user?.name || "Property Owner",
    email: user?.email || "",
    phone: profile?.phone || user?.phone || "",
    profilePhoto: user?.profilePhoto || profile?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    joinDate: user ? new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "",
    totalProperties: 0, // Will be calculated from real data
    totalTenants: 0, // Will be calculated from real data
    monthlyIncome: "₦0", // Will be calculated from real data
    occupancyRate: 0, // Will be calculated from real data
  };

  // Fetch real properties (owned or by default all visibles)
  const { properties, isLoading: propsLoading, error: propsError, isEmpty: propsEmpty, retry: retryProps } = useProperties();
  const filteredProperties = (properties || []).filter((property) => {
    if (propertyFilter === "all") return true;
    return (property.status || '').toLowerCase() === propertyFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <img
              src={ownerData.profilePhoto}
              alt={ownerData.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Property Owner Dashboard
              </h1>
              <p className="text-gray-600">
                {ownerData.name} • Member since {ownerData.joinDate}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alerts
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
                    Total Properties
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {ownerData.totalProperties}
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
                    Active Tenants
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {ownerData.totalTenants}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Monthly Income
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {ownerData.monthlyIncome}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Occupancy Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {ownerData.occupancyRate}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Property Performance */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-500" />
                    Property Overview
                  </CardTitle>
                  <Link to="#properties">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(properties || []).slice(0, 3).map((property: any) => (
                    <div
                      key={property.id}
                      className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <img
                        src={(property.images && property.images[0]) || '/placeholder.svg'}
                        alt={property.title || 'Property'}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {property.title || 'Untitled Property'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {`${property.address || ''}${property.city ? `, ${property.city}` : ''}`}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-semibold text-green-700">
                            {`₦${Number(property.price || 0).toLocaleString()}`}
                          </span>
                          <Badge
                            variant={
                              (property.status || '').toLowerCase() === 'occupied'
                                ? "default"
                                : "secondary"
                            }
                          >
                            {property.status || 'Vacant'}
                          </Badge>
                        </div>
                        {property.tenant && (
                          <p className="text-xs text-gray-500 mt-1">
                            Tenant: {property.tenant}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Maintenance */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-500" />
                    Recent Maintenance
                  </CardTitle>
                  <Link to="#maintenance">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {true ? (
                    <EmptyState
                      icon={Wrench}
                      title="No Maintenance Requests"
                      description="Maintenance requests will appear here as tenants report issues from their portal."
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
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-sm">Add Property</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-16 flex flex-col gap-2"
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Add Tenant</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-16 flex flex-col gap-2"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Create Lease</span>
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

          <TabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Properties</h2>
              <div className="flex gap-3">
                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">All Properties</option>
                  <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
                </select>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Property
                </Button>
              </div>
            </div>

            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                <Card
                  key={property.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={(property.images && property.images[0]) || '/placeholder.svg'}
                      alt={property.title || 'Property'}
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
                    <Badge className="absolute top-3 left-3 bg-green-600">
                      {(property.status || '').toString()}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl font-bold text-green-700">
                        {`₦${Number(property.price || 0).toLocaleString()}`}
                      </span>
                      <span className="text-sm text-gray-500">
                        {property.listing_type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{`${property.address || ''}${property.city ? `, ${property.city}` : ''}`}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        <span>{property.area_sqm ? `${property.area_sqm} sqm` : 'N/A'}</span>
                      </div>
                    </div>
                    {/* Tenant details integration pending */}
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
            ) : (
              <EmptyState
                icon={Home}
                title="Ready to List Your First Property?"
                description="Start building your real estate portfolio! Add your first property to begin tracking tenants, income, and maintenance requests."
                action={{
                  label: "Add Property",
                  onClick: () => {
                    // TODO: Navigate to add property page
                    console.log("Navigate to add property");
                  }
                }}
                className="py-12"
              />
            )}
          </TabsContent>

          <TabsContent value="tenants" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Tenants</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Tenant
              </Button>
            </div>

            {/* Real tenants will be fetched from database */}
            {(() => {
              const tenants: any[] = []; // TODO: Replace with real data from database
              return tenants.length > 0 ? (
                <div className="space-y-4">
                  {tenants.map((tenant) => (
                <Card key={tenant.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={tenant.avatar}
                          alt={tenant.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {tenant.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {tenant.propertyTitle}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>Rent: {tenant.rent}/month</span>
                            <Badge
                              variant={
                                tenant.paymentStatus === "Current"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {tenant.paymentStatus}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Lease: {tenant.leaseStart} - {tenant.leaseEnd}
                          </p>
                          <p className="text-xs text-gray-500">
                            Last Payment: {tenant.lastPayment}
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
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No Tenants Yet"
                  description="Your tenant management tools will appear here once you have renters. Start by adding properties and finding tenants to manage."
                  className="py-12"
                />
              );
            })()}
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Maintenance Requests</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Request
              </Button>
            </div>

            <div className="space-y-4">
              <EmptyState
                icon={Wrench}
                title="No Maintenance Requests"
                description="When tenants submit maintenance requests, you'll see them here for quick action."
                className="py-12"
              />
            </div>
          </TabsContent>

          <TabsContent value="financials" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Financial Overview</h2>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>

            {/* Real financial data will be calculated from properties and tenants */}
            {(() => {
              const hasFinancialData = false; // TODO: Replace with real data check
              return hasFinancialData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          This Month Income
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          ₦0
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          No data yet
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          This Month Expenses
                        </p>
                        <p className="text-3xl font-bold text-red-600">₦0</p>
                        <p className="text-sm text-gray-500 mt-1">
                          No data yet
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Net Profit
                        </p>
                        <p className="text-3xl font-bold text-blue-600">₦0</p>
                        <p className="text-sm text-gray-500 mt-1">
                          No data yet
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <EmptyState
                  icon={DollarSign}
                  title="No Income Data Yet"
                  description="Income tracking will begin once you have active rentals. Add properties and tenants to start monitoring your financial performance."
                  className="py-12"
                />
              );
            })()}

            {(() => {
              const financials: any[] = []; // TODO: Replace with real financial data
              const hasFinancialData = false; // TODO: Replace with real data check
              return hasFinancialData ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {financials.map((month, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {month.month}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {month.properties} Properties
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-3 gap-8 text-sm">
                          <div>
                            <p className="text-gray-500">Income</p>
                            <p className="font-semibold text-green-600">
                              {month.income}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Expenses</p>
                            <p className="font-semibold text-red-600">
                              {month.expenses}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Profit</p>
                            <p className="font-semibold text-blue-600">
                              {month.profit}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null;
            })()}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-semibold">Owner Profile</h2>

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
                      value={ownerData.name}
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
                      value={ownerData.email}
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
                      value={ownerData.phone}
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
                      <h4 className="font-medium">Payment Settings</h4>
                      <p className="text-sm text-gray-600">
                        Manage rent collection methods
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Setup
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Notifications</h4>
                      <p className="text-sm text-gray-600">
                        Rent reminders and alerts
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Tax Reports</h4>
                      <p className="text-sm text-gray-600">
                        Annual tax documentation
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
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

export default OwnerDashboard;
