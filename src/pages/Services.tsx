import React, { useState } from "react";
import { Link } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Star,
  Phone,
  Mail,
  Calendar,
  Shield,
  Award,
  Building,
  Wrench,
  PaintBucket,
  Zap,
  Trees,
  HardHat,
  Camera,
} from "lucide-react";

const serviceCategories = [
  { id: "all", name: "All Services", icon: Building },
  { id: "engineering", name: "Engineering", icon: HardHat },
  { id: "architecture", name: "Architecture", icon: Building },
  { id: "construction", name: "Construction", icon: Wrench },
  { id: "interior", name: "Interior Design", icon: PaintBucket },
  { id: "electrical", name: "Electrical", icon: Zap },
  { id: "landscaping", name: "Landscaping", icon: Trees },
  { id: "photography", name: "Photography", icon: Camera },
];

const mockServices = [
  {
    id: 1,
    name: "Adebayo Engineering Solutions",
    category: "engineering",
    rating: 4.9,
    reviewCount: 127,
    location: "Lagos, Nigeria",
    services: ["Structural Engineering", "Project Management", "Site Inspection"],
    price: "₦50,000 - ₦500,000",
    image: "/placeholder.svg",
    verified: true,
    yearsExperience: 12,
    completedProjects: 89,
    description: "Professional structural engineering services for residential and commercial properties."
  },
  {
    id: 2,
    name: "Modern Architects Studio",
    category: "architecture",
    rating: 4.8,
    reviewCount: 94,
    location: "Abuja, Nigeria",
    services: ["Architectural Design", "3D Modeling", "Planning Permission"],
    price: "₦75,000 - ₦800,000",
    image: "/placeholder.svg",
    verified: true,
    yearsExperience: 8,
    completedProjects: 156,
    description: "Contemporary architectural designs that blend functionality with aesthetic appeal."
  },
  {
    id: 3,
    name: "Elite Construction Group",
    category: "construction",
    rating: 4.7,
    reviewCount: 203,
    location: "Port Harcourt, Nigeria",
    services: ["General Construction", "Renovation", "Project Management"],
    price: "₦100,000 - ��2,000,000",
    image: "/placeholder.svg",
    verified: true,
    yearsExperience: 15,
    completedProjects: 234,
    description: "Full-service construction company specializing in residential and commercial projects."
  },
  {
    id: 4,
    name: "Creative Interiors Lagos",
    category: "interior",
    rating: 4.9,
    reviewCount: 78,
    location: "Lagos, Nigeria",
    services: ["Interior Design", "Space Planning", "Furniture Selection"],
    price: "₦30,000 - ₦400,000",
    image: "/placeholder.svg",
    verified: true,
    yearsExperience: 6,
    completedProjects: 112,
    description: "Transforming spaces with innovative interior design solutions for modern living."
  },
  {
    id: 5,
    name: "PowerTech Electrical Services",
    category: "electrical",
    rating: 4.6,
    reviewCount: 145,
    location: "Kano, Nigeria",
    services: ["Electrical Installation", "Wiring", "Solar Solutions"],
    price: "₦20,000 - ₦300,000",
    image: "/placeholder.svg",
    verified: true,
    yearsExperience: 10,
    completedProjects: 178,
    description: "Professional electrical services with focus on safety and energy efficiency."
  },
  {
    id: 6,
    name: "Green Spaces Landscaping",
    category: "landscaping",
    rating: 4.8,
    reviewCount: 67,
    location: "Ibadan, Nigeria",
    services: ["Garden Design", "Landscaping", "Irrigation Systems"],
    price: "₦40,000 - ₦600,000",
    image: "/placeholder.svg",
    verified: true,
    yearsExperience: 7,
    completedProjects: 93,
    description: "Creating beautiful outdoor spaces that enhance property value and livability."
  }
];

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const filteredServices = mockServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || service.location.includes(selectedLocation);
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const getCategoryIcon = (category: string) => {
    const categoryData = serviceCategories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : Building;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Professional Real Estate Services
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Connect with verified professionals for all your real estate needs - from engineering and architecture to interior design and construction.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search for services or professionals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Lagos">Lagos</SelectItem>
                  <SelectItem value="Abuja">Abuja</SelectItem>
                  <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                  <SelectItem value="Kano">Kano</SelectItem>
                  <SelectItem value="Ibadan">Ibadan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {serviceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 text-center rounded-lg transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Icon className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">
              {selectedCategory === "all" ? "All Services" : serviceCategories.find(c => c.id === selectedCategory)?.name} 
              <span className="text-gray-500 ml-2">({filteredServices.length} found)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const CategoryIcon = getCategoryIcon(service.category);
              return (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CategoryIcon className="h-6 w-6 text-blue-700" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            {service.verified && (
                              <Badge className="bg-green-500 text-white border-0">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm">{service.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{service.rating}</span>
                        <span className="text-gray-500">({service.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {service.location}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4 text-blue-600" />
                          <span>{service.yearsExperience}+ years</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4 text-green-600" />
                          <span>{service.completedProjects} projects</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Services Offered:</p>
                      <div className="flex flex-wrap gap-1">
                        {service.services.map((serviceType, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {serviceType}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-700">{service.price}</span>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="blue" size="sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            Book
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or browse different categories.</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedLocation("all");
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Are You a Service Professional?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our platform and connect with property owners and agents who need your expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button variant="secondary" size="lg">
                Join as Professional
              </Button>
            </Link>
            <Link to="/help">
              <Button size="lg" className="border border-white bg-transparent text-white hover:bg-white hover:text-blue-700 hover:border-white">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
