import React, { useState } from "react";
import { Link } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Filter,
  Search,
} from "lucide-react";
import { useAgents } from "@/hooks/useAgents";

const Agents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch real agents from Supabase
  const { data: agents, isLoading, error } = useAgents({
    searchTerm: searchTerm || undefined,
    specialization: selectedSpecialty === "all" ? undefined : selectedSpecialty,
    verifiedOnly: true,
  });

  const locations = ["all", "Lagos", "Abuja", "Port Harcourt", "Kano"];
  const specialties = [
    "all",
    "Luxury Homes",
    "Commercial Properties",
    "Investment Properties",
    "New Developments",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect Real Estate Agent
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with top-rated agents across Nigeria who will help you
              buy, sell, or rent your dream property.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search agents by name, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-600">
                {isLoading ? "Loading..." : agents ? `${agents.length} agents found` : "0 agents found"}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location === "all" ? "All Locations" : location}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialty
                    </label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {specialties.map((specialty) => (
                        <option key={specialty} value={specialty}>
                          {specialty === "all" ? "All Specialties" : specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Unable to load agents. Please try again later.</p>
          </div>
        ) : agents && agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-0">
                  {/* Agent Photo and Quick Actions */}
                  <div className="relative">
                    <img
                      src={agent.profile_image_url || "/placeholder.svg"}
                      alt={agent.agency_name || "Agent"}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        size="sm"
                        className="bg-white/90 text-gray-700 hover:bg-white"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Agent Details */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link to={`/agents/${agent.id}`}>
                          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-700 transition-colors">
                            {agent.agency_name || "Real Estate Agent"}
                          </h3>
                        </Link>
                        <p className="text-gray-600">Real Estate Agent</p>
                        <p className="text-sm text-gray-500">{agent.years_experience ? `${agent.years_experience} years experience` : "Experienced agent"}</p>
                      </div>
                    </div>

                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-900 ml-1">
                          {agent.rating || "N/A"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({agent.total_reviews || 0} reviews)
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center gap-2 mb-4">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {agent.phone || "Contact info available"}
                      </span>
                    </div>

                    {/* Specializations */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {agent.specializations && agent.specializations.slice(0, 2).map((specialty, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                        {agent.specializations && agent.specializations.length > 2 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{agent.specializations ? agent.specializations.length - 2 : 0} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {agent.bio && (
                      <div className="text-sm text-gray-600 mb-4">
                        <p className="line-clamp-2">{agent.bio}</p>
                      </div>
                    )}

                    {/* Verification Status */}
                    <div className="text-sm text-gray-600 mb-4">
                      <span className={`font-medium ${
                        agent.verification_status === 'verified' 
                          ? 'text-green-600' 
                          : agent.verification_status === 'pending'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {agent.verification_status === 'verified' 
                          ? '✓ Verified Agent' 
                          : agent.verification_status === 'pending'
                          ? '⏳ Verification Pending'
                          : 'Verification Failed'
                        }
                      </span>
                    </div>

                    {/* Contact Buttons */}
                    <div className="flex gap-2">
                      <Link to={`/agents/${agent.id}`} className="flex-1">
                        <Button variant="blue" className="w-full">
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0"
                      >
                        <a href={`tel:${agent.phone || ''}`} aria-label="Call agent">
                          <Phone className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0"
                      >
                        <a href={`mailto:${agent.email || ''}`} aria-label="Email agent">
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No agents found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find more agents.
            </p>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Work with a Top Agent?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Our agents are here to help you navigate the Nigerian real estate
            market with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-gray-100"
            >
              Get Matched with an Agent
            </Button>
            <Button
              size="lg"
              className="border border-white bg-transparent text-white hover:bg-white hover:text-blue-700 hover:border-white"
            >
              Learn About Our Services
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agents;
