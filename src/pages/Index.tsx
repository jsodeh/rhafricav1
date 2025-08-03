import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Shield,
  MessageSquare,
  CreditCard,
  MapPin,
  Users,
  Star,
  CheckCircle,
  Bed,
  Bath,
  Square,
  X,
  Phone,
  Mail,
  Calendar,
  BadgeCheck,
  Home,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import LocationSearch from "@/components/LocationSearch";
import { SearchProvider, useSearch } from "@/contexts/SearchContext";
import { useState, useEffect, useRef } from "react";
import React from "react";
import { useProperties } from "@/hooks/useProperties";
import { useFeaturedAgents } from "@/hooks/useAgents";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { pageConfigs } from "@/lib/seo";

// Stacked Carousel Component
const StackedCarousel = () => {
  const [activeCard, setActiveCard] = useState(0);

  const cards = [
    {
      icon: Search,
      title: "Buy a home",
      description: "Find your place with an immersive photo experience and the most listings",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      link: "/properties?type=sale"
    },
    {
      icon: Users,
      title: "Sell a home",
      description: "No matter what path you take to sell your home, we can help you navigate",
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/advertise"
    },
    {
      icon: CreditCard,
      title: "Rent a home",
      description: "We're creating a seamless online experience – from shopping to applying",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/properties?type=rent"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [cards.length]);

  return (
    <div className="relative w-[340px] h-[280px] md:w-[380px] md:h-[320px]">
      {cards.map((card, index) => {
        const isActive = index === activeCard;
        const offset = index - activeCard;

        return (
          <Link to={card.link} key={index}>
            <div
              className={`absolute w-full bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-700 ease-out hover:scale-105 ${
                isActive ? 'z-30' : index === (activeCard + 1) % cards.length ? 'z-20' : 'z-10'
              }`}
              style={{
                transform: `translateX(${offset * 16}px) translateY(${Math.abs(offset) * 24}px) scale(${1 - Math.abs(offset) * 0.05})`,
                boxShadow: isActive
                  ? '0 20px 40px rgba(0,0,0,0.15)'
                  : '0 8px 32px rgba(0,0,0,0.08)',
                opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.2
              }}
              onClick={() => setActiveCard(index)}
            >
              {/* Floating Badge */}
              <div className="absolute -top-6 left-6 bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 transition-all duration-300">
                <card.icon className={`h-5 w-5 ${card.color}`} />
                <span className="font-semibold text-gray-900 text-sm">{card.title}</span>
              </div>

              {/* Card Content */}
              <div className={`w-full h-28 md:h-32 ${card.bgColor} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <Home className={`h-16 w-16 ${card.color} opacity-20`} />
                <div className="absolute bottom-2 right-2">
                  <div className={`w-8 h-8 rounded-full ${card.bgColor} flex items-center justify-center`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
              </div>

              <div className="p-4 pt-3">
                <p className="text-gray-600 text-base leading-relaxed">{card.description}</p>

                {isActive && (
                  <div className="mt-3 flex items-center text-sm font-medium">
                    <span className={card.color}>Learn more</span>
                    <ChevronRight className={`h-4 w-4 ml-1 ${card.color}`} />
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}

      {/* Indicators */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveCard(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === activeCard
                ? 'bg-blue-700 scale-110'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const HeroSection = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <section
      className="relative min-h-screen flex items-center"
      id="hero-section"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/real-estate.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-left">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Africa's trusted<br />real estate Platform
            </h1>
          </div>
          {/* Centered Search Bar on Hero */}
          <div className="mb-8 flex justify-center md:justify-start">
            <div className="w-full max-w-xl" ref={ref}>
              <LocationSearch
                placeholder="Enter an address, neighborhood, city, or ZIP code"
                className="w-full"
                inputClassName="h-14 py-4 text-lg"
                onLocationSelect={(location) => {
                  console.log("Hero search location selected:", location);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

const Index = () => {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchInNav, setShowSearchInNav] = useState(false);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuth();

  // Fetch real data from Supabase
  const { data: featuredProperties, isLoading: propertiesLoading, error: propertiesError } = useProperties({ 
    searchTerm: '', 
    city: '' 
  });
  const { data: featuredAgents, isLoading: agentsLoading, error: agentsError } = useFeaturedAgents(6);

  // Handle scroll to show/hide search in navigation
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
        setShowSearchInNav(!entry.isIntersecting);
      },
      { threshold: 0.01 }
    );
    if (heroSearchRef.current) {
      observer.observe(heroSearchRef.current);
    }
    return () => {
      if (heroSearchRef.current) {
        observer.unobserve(heroSearchRef.current);
      }
    };
  }, []);

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property);
    setSelectedImageIndex(0); // Reset to first image when opening modal
    setShowPropertyModal(true);
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  return (
    <SearchProvider>
      <SEO
        title={pageConfigs.home.title}
        description={pageConfigs.home.description}
        keywords={pageConfigs.home.keywords}
        ogImage="/real-estate-hero.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Real Estate Hotspot",
          "url": "https://realestatehotspot.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://realestatehotspot.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      >
      <div className="min-h-screen bg-white">
        <StickyNavigation
          isScrolled={isScrolled}
          showSearchInNav={showSearchInNav}
        />
        <HeroSection ref={heroSearchRef} />

        {/* Stacked, Scrollable Recommendations/Services Section */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-12 px-4">
            {/* Left: Text and CTA */}
            <div className="flex-1 max-w-xs w-full mb-8 md:mb-0 md:mr-8">
              {isAuthenticated ? (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Welcome back, {user?.name?.split(' ')[0]}!</h2>
                  <p className="text-gray-600 mb-6">Discover personalized property recommendations just for you.</p>
                  <Link to="/dashboard">
                    <Button className="text-base px-8 py-2 rounded-lg font-semibold">View Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Get home recommendations</h2>
                  <p className="text-gray-600 mb-6">Sign in for a more personalized experience.</p>
                  <Link to="/login">
                    <Button className="text-base px-8 py-2 rounded-lg font-semibold">Sign in</Button>
                  </Link>
                </>
              )}
            </div>
            {/* Right: Interactive Stacked Carousel */}
            <div className="flex-1 w-full flex justify-center">
              <StackedCarousel />
            </div>
          </div>
        </section>

        {/* Featured Properties Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {isAuthenticated ? "Recommended for you" : "Featured properties"}
                  </h2>
                  <p className="text-gray-600">
                    {isAuthenticated ? "Based on your preferences and activity" : "Handpicked quality properties"}
                  </p>
                </div>
                <Link to="/properties">
                  <Button variant="outline">View all</Button>
                </Link>
              </div>

              {propertiesLoading ? (
                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="min-w-[280px] sm:min-w-[320px] flex-shrink-0 animate-pulse snap-start">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="h-6 bg-gray-200 rounded mb-3"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : propertiesError ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Unable to load properties. Please try again later.</p>
                </div>
              ) : featuredProperties && featuredProperties.length > 0 ? (
                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                  {featuredProperties.slice(0, 8).map((property) => (
                    <Link to={`/properties/${property.id}`} key={property.id}>
                      <Card className="hover:shadow-lg transition-shadow group cursor-pointer min-w-[280px] sm:min-w-[320px] flex-shrink-0 snap-start">
                        <div className="relative">
                          <img
                            src={property.images && property.images.length > 0 ? property.images[0] : "/placeholder.svg"}
                            alt={property.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <Badge className="absolute top-3 left-3 bg-blue-700 text-white border-0">
                            {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                          </Badge>
                        </div>

                        <CardContent className="p-4">
                          <div className="mb-3">
                            <span className="text-2xl font-bold text-gray-900">
                              ₦{property.price?.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Bed className="h-4 w-4 mr-1" />
                              <span className="text-sm">
                                {property.bedrooms || 0} bed
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Bath className="h-4 w-4 mr-1" />
                              <span className="text-sm">
                                {property.bathrooms || 0} bath
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Square className="h-4 w-4 mr-1" />
                              <span className="text-sm">{property.area_sqm ? `${property.area_sqm} sqm` : 'N/A'}</span>
                            </div>
                          </div>

                          <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{property.city}, {property.state}</span>
                          </div>

                          <h3 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                            {property.title}
                          </h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No properties available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Property Details Modal */}
        {showPropertyModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <img
                  src={selectedProperty.images[selectedImageIndex]}
                  alt={selectedProperty.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <button
                  onClick={() => setShowPropertyModal(false)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <Badge className="absolute top-4 left-4 bg-blue-700 text-white border-0">
                  {selectedProperty.type}
                </Badge>
              </div>

              {/* Image Gallery */}
              {selectedProperty.images &&
                selectedProperty.images.length > 1 && (
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Property Images
                    </h3>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                      {selectedProperty.images.map(
                        (image: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => handleImageClick(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              selectedImageIndex === index
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${selectedProperty.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedProperty.title}
                    </h2>
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {selectedProperty.price}
                    </p>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{selectedProperty.location}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Property Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Bedrooms:</span>
                        <span className="font-medium">
                          {selectedProperty.bedrooms}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Bathrooms:</span>
                        <span className="font-medium">
                          {selectedProperty.bathrooms}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Area:</span>
                        <span className="font-medium">
                          {selectedProperty.area}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Year Built:</span>
                        <span className="font-medium">
                          {selectedProperty.yearBuilt}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Floors:</span>
                        <span className="font-medium">
                          {selectedProperty.floors}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Furnished:</span>
                        <span className="font-medium">
                          {selectedProperty.furnished}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Features
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProperty.features.map(
                        (feature: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedProperty.description}
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Agent
                  </h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={selectedProperty.agent.image}
                      alt={selectedProperty.agent.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {selectedProperty.agent.name}
                      </h4>
                      <p className="text-sm text-gray-600">Real Estate Agent</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={() =>
                        window.open(`tel:${selectedProperty.agent.phone}`)
                      }
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        window.open(`mailto:${selectedProperty.agent.email}`)
                      }
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Viewing
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Features */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-0">
                Why Choose Us
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Safe, Smart, and Secure Real Estate
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We've built Nigeria's most comprehensive real estate platform
                with your safety and success in mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Verified Listings
                </h3>
                <p className="text-gray-600">
                  Every property and agent is thoroughly verified with proper
                  documentation and KYC checks.
                </p>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow p-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Safe Communication
                </h3>
                <p className="text-gray-600">
                  In-app messaging keeps your personal information private while
                  facilitating smooth negotiations.
                </p>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Escrow Payments
                </h3>
                <p className="text-gray-600">
                  Secure escrow system protects your deposits and ensures safe
                  transactions for all parties.
                </p>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Expert Services
                </h3>
                <p className="text-gray-600">
                  Access to vetted lawyers, surveyors, and other professionals
                  for complete real estate support.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Real Estate Experience?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of Nigerians who are already using Real Estate
              Hotspot for safer, smarter property transactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg"
                >
                  Get Started for Free
                </Button>
              </Link>
              <Button
                size="lg"
                className="border border-white bg-transparent text-white hover:bg-white hover:text-blue-700 px-8 py-6 text-lg hover:border-white"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Zillow-Style Footer */}
        <footer className="bg-white border-t pt-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">RH</span>
                </div>
                <span className="text-2xl font-bold text-blue-700">Real Estate Hotspot</span>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <a href="#" className="text-gray-500 hover:text-blue-700" aria-label="Facebook">
                  <i className="fab fa-facebook-f text-xl"></i>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-700" aria-label="Instagram">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-700" aria-label="Twitter">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-700" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in text-xl"></i>
                </a>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                  <span className="text-sm text-gray-600">📱 App Store</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                  <span className="text-sm text-gray-600">📱 Google Play</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm text-gray-600">
                <Link to="/properties" className="hover:text-blue-700">Buy</Link>
                <Link to="/properties?type=rent" className="hover:text-blue-700">Rent</Link>
                <Link to="/mortgage" className="hover:text-blue-700">Mortgage</Link>
                <Link to="/agents" className="hover:text-blue-700">Agents</Link>
                <Link to="/advertise" className="hover:text-blue-700">Advertise</Link>
                <Link to="/help" className="hover:text-blue-700">Help</Link>
                <Link to="/privacy" className="hover:text-blue-700">Privacy</Link>
                <Link to="/terms" className="hover:text-blue-700">Terms</Link>
              </div>
              <p className="text-xs text-gray-500 mb-2">&copy; {new Date().getFullYear()} Real Estate Hotspot. All rights reserved. • Made with ❤️ in Nigeria</p>
            </div>
          </div>
          {/* Lagos Skyline Silhouette Image - edge to edge, block element at bottom */}
          <img
            src="/Generated%20sillhuoette.png"
            alt="Lagos Skyline Silhouette"
            className="w-full h-40 object-cover mt-8"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
            draggable={false}
          />
        </footer>
      </div>
      </SEO>
    </SearchProvider>
  );
};

export default Index;
