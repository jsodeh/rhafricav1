import React, { useState } from "react";
import { Link } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Wrench,
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Clock,
  Settings,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertTriangle,
  FileText,
  Award,
  BarChart3,
  Download,
  Camera,
  MessageCircle,
  Filter,
} from "lucide-react";

// Mock service provider data
const mockProviderData = {
  name: "Engineer John Doe",
  email: "john.doe@engineering.com",
  phone: "+234 803 456 7890",
  license: "ENG-2024-001",
  company: "Lagos Engineering Services",
  specialization: "Structural Engineering",
  experience: "12 years",
  joinDate: "June 2020",
  profilePhoto:
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
  rating: 4.8,
  totalReviews: 89,
  completedJobs: 234,
  activeBookings: 8,
  monthlyEarnings: "₦1,850,000",
};

// Mock services data
const mockServices = [
  {
    id: 1,
    title: "Structural Assessment",
    category: "Engineering",
    price: "₦150,000",
    duration: "2-3 days",
    description:
      "Comprehensive structural analysis and safety assessment of buildings",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop",
    isActive: true,
    bookings: 23,
    avgRating: 4.9,
  },
  {
    id: 2,
    title: "Building Plan Review",
    category: "Architecture",
    price: "₦75,000",
    duration: "1-2 days",
    description:
      "Professional review of architectural plans and building designs",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop",
    isActive: true,
    bookings: 18,
    avgRating: 4.7,
  },
  {
    id: 3,
    title: "Property Inspection",
    category: "Inspection",
    price: "₦50,000",
    duration: "4-6 hours",
    description: "Detailed property inspection for buyers and sellers",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
    isActive: true,
    bookings: 45,
    avgRating: 4.8,
  },
];

// Mock bookings data
const mockBookings = [
  {
    id: 1,
    serviceId: 1,
    serviceTitle: "Structural Assessment",
    client: {
      name: "Michael Thompson",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      phone: "+234 802 345 6789",
      email: "michael.thompson@email.com",
    },
    property: {
      title: "4BR Duplex - Lekki",
      address: "123 Admiralty Way, Lekki, Lagos",
    },
    status: "Confirmed",
    scheduledDate: "2024-01-25",
    scheduledTime: "10:00 AM",
    price: "₦150,000",
    notes: "Focus on foundation and load-bearing walls",
    bookingDate: "2024-01-20",
  },
  {
    id: 2,
    serviceId: 3,
    serviceTitle: "Property Inspection",
    client: {
      name: "Sarah Williams",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face",
      phone: "+234 804 567 8901",
      email: "sarah.williams@email.com",
    },
    property: {
      title: "3BR Apartment - Victoria Island",
      address: "456 Ozumba Mbadiwe, Victoria Island, Lagos",
    },
    status: "In Progress",
    scheduledDate: "2024-01-22",
    scheduledTime: "2:00 PM",
    price: "₦50,000",
    notes: "Pre-purchase inspection for buyer",
    bookingDate: "2024-01-18",
  },
  {
    id: 3,
    serviceId: 2,
    serviceTitle: "Building Plan Review",
    client: {
      name: "David Okafor",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      phone: "+234 803 789 0123",
      email: "david.okafor@email.com",
    },
    property: {
      title: "New Commercial Building",
      address: "Plot 789, Central Business District, Abuja",
    },
    status: "Completed",
    scheduledDate: "2024-01-15",
    scheduledTime: "9:00 AM",
    price: "₦75,000",
    notes: "Review for planning approval submission",
    bookingDate: "2024-01-12",
    completedDate: "2024-01-16",
  },
];

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    client: "Michael Thompson",
    clientAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    service: "Structural Assessment",
    rating: 5,
    comment:
      "Excellent work! Very thorough and professional. The report was detailed and helped us make an informed decision.",
    date: "2024-01-18",
    verified: true,
  },
  {
    id: 2,
    client: "Sarah Williams",
    clientAvatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face",
    service: "Property Inspection",
    rating: 5,
    comment:
      "Found issues that could have cost us significantly later. Great attention to detail and very communicative throughout the process.",
    date: "2024-01-16",
    verified: true,
  },
  {
    id: 3,
    client: "David Okafor",
    clientAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    service: "Building Plan Review",
    rating: 4,
    comment:
      "Professional service and quick turnaround. The feedback was valuable for our project approval.",
    date: "2024-01-14",
    verified: true,
  },
];

// Mock earnings data
const mockEarnings = [
  {
    month: "January 2024",
    earnings: "₦1,250,000",
    jobs: 18,
    hours: 145,
  },
  {
    month: "December 2023",
    earnings: "₦1,680,000",
    jobs: 22,
    hours: 168,
  },
  {
    month: "November 2023",
    earnings: "₦1,420,000",
    jobs: 20,
    hours: 156,
  },
];

const ServiceProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingFilter, setBookingFilter] = useState("all");

  const filteredBookings = mockBookings.filter((booking) => {
    if (bookingFilter === "all") return true;
    return booking.status.toLowerCase().replace(" ", "_") === bookingFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <img
              src={mockProviderData.profilePhoto}
              alt={mockProviderData.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Service Provider Dashboard
              </h1>
              <p className="text-gray-600">
                {mockProviderData.name} ��� {mockProviderData.specialization}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {mockProviderData.rating}
                </span>
                <span className="text-sm text-gray-500">
                  ({mockProviderData.totalReviews} reviews)
                </span>
                <Badge variant="outline" className="ml-2">
                  {mockProviderData.experience} experience
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Service
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
                    Active Bookings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockProviderData.activeBookings}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completed Jobs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockProviderData.completedJobs}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Monthly Earnings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockProviderData.monthlyEarnings}
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
                    Avg. Rating
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockProviderData.rating}/5
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
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
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Recent Bookings
                  </CardTitle>
                  <Link to="#bookings">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <img
                        src={booking.client.avatar}
                        alt={booking.client.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">
                          {booking.serviceTitle}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {booking.client.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.property.title}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-semibold text-green-700">
                            {booking.price}
                          </span>
                          <Badge
                            variant={
                              booking.status === "Confirmed"
                                ? "default"
                                : booking.status === "In Progress"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.scheduledDate} at {booking.scheduledTime}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-semibold">
                        {mockEarnings[0].earnings}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Jobs Completed
                      </span>
                      <span className="font-semibold">
                        {mockEarnings[0].jobs}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Hours Worked
                      </span>
                      <span className="font-semibold">
                        {mockEarnings[0].hours}h
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                          {mockProviderData.rating}
                        </span>
                      </div>
                    </div>
                  </div>
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
                    <span className="text-sm">Add Service</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-16 flex flex-col gap-2"
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">Schedule</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-16 flex flex-col gap-2"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Create Invoice</span>
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

          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Services</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Service
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockServices.map((service) => (
                <Card
                  key={service.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={service.image}
                      alt={service.title}
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
                        service.isActive ? "bg-green-600" : "bg-gray-600"
                      }`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl font-bold text-blue-700">
                        {service.price}
                      </span>
                      <Badge variant="outline">{service.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>Duration: {service.duration}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{service.avgRating}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      {service.bookings} bookings completed
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

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                Bookings & Appointments
              </h2>
              <div className="flex gap-3">
                <select
                  value={bookingFilter}
                  onChange={(e) => setBookingFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">All Bookings</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendar View
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <img
                          src={booking.client.avatar}
                          alt={booking.client.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.serviceTitle}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Client: {booking.client.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.property.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.property.address}
                          </p>

                          <div className="flex items-center gap-4 mt-3">
                            <Badge
                              variant={
                                booking.status === "Confirmed"
                                  ? "default"
                                  : booking.status === "In Progress"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {booking.status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              <Clock className="h-4 w-4 inline mr-1" />
                              {booking.scheduledDate} at {booking.scheduledTime}
                            </span>
                            <span className="text-sm font-semibold text-green-700">
                              {booking.price}
                            </span>
                          </div>

                          {booking.notes && (
                            <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                              <strong>Notes:</strong> {booking.notes}
                            </p>
                          )}
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
                        {booking.status !== "Completed" && (
                          <Button size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Client Reviews</h2>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{mockProviderData.rating}</span>
                <span className="text-gray-600">
                  ({mockProviderData.totalReviews} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {mockReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={review.clientAvatar}
                        alt={review.client}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              {review.client}
                              {review.verified && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {review.service}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Earnings & Reports</h2>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      This Month
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {mockEarnings[0].earnings}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {mockEarnings[0].jobs} jobs completed
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Avg. per Job
                    </p>
                    <p className="text-3xl font-bold text-blue-600">₦69,444</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Based on recent jobs
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Hours Worked
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {mockEarnings[0].hours}h
                    </p>
                    <p className="text-sm text-gray-500 mt-1">This month</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEarnings.map((month, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {month.month}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {month.jobs} jobs • {month.hours} hours
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          {month.earnings}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₦
                          {Math.round(
                            parseInt(month.earnings.replace(/[₦,]/g, "")) /
                              month.jobs,
                          ).toLocaleString()}{" "}
                          avg/job
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-semibold">Professional Profile</h2>

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
                      value={mockProviderData.name}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      value={mockProviderData.specialization}
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
                      value={mockProviderData.license}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience
                    </label>
                    <input
                      type="text"
                      value={mockProviderData.experience}
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
                      <h4 className="font-medium">Service Pricing</h4>
                      <p className="text-sm text-gray-600">
                        Manage your service rates
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Availability Calendar</h4>
                      <p className="text-sm text-gray-600">
                        Set your working hours
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Setup
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Payment Methods</h4>
                      <p className="text-sm text-gray-600">
                        Bank and payment settings
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Certifications</h4>
                      <p className="text-sm text-gray-600">
                        Upload professional certificates
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Award className="h-4 w-4 mr-2" />
                      Upload
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

export default ServiceProviderDashboard;
