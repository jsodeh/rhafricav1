import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LocationSearch from "./LocationSearch";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import NotificationCenter from "./NotificationCenter";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface StickyNavigationProps {
  isScrolled?: boolean;
  showSearchInNav?: boolean;
}

const leftMenu = [
  { label: "Buy", to: "/properties?type=sale" },
  { label: "Rent", to: "/properties?type=rent" },
  { label: "Sell", to: "/properties?type=sell" },
  { label: "Mortgage", to: "/mortgage" },
  { label: "Agents", to: "/agents" },
];
const rightMenu = [
  { label: "Manage Rentals", to: "/manage-rentals" },
  { label: "Advertise", to: "/advertise" },
  { label: "Help", to: "/help" },
];

const StickyNavigation = ({
  isScrolled = false,
  showSearchInNav = false,
}: StickyNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Function to get the primary dashboard link based on user role
  const getPrimaryDashboardLink = () => {
    const accountType = user?.accountType?.toLowerCase() || "";
    if (accountType.includes("admin")) return { label: "Admin Dashboard", to: "/admin-dashboard" };
    if (accountType.includes("agent")) return { label: "Agent Dashboard", to: "/agent-dashboard" };
    if (accountType.includes("owner")) return { label: "Owner Dashboard", to: "/owner-dashboard" };
    if (accountType.includes("service") || accountType.includes("professional")) return { label: "Service Dashboard", to: "/service-dashboard" };
    return { label: "Dashboard", to: "/dashboard" }; // Default for buyers, renters, etc.
  };

  // Role-based dashboard links
  const roleLinks = [
    getPrimaryDashboardLink(),
    { label: "Messages", to: "/messages" },
    // Add Super Admin link for admin users
    ...(user?.accountType?.toLowerCase().includes('admin') ? [
      { label: "Super Admin", to: "/super-admin" }
    ] : [])
  ].filter(Boolean);

  // Filter rightMenu for 'Manage Rentals' based on user role
  const filteredRightMenu = rightMenu.filter(item => {
    if (item.label !== "Manage Rentals") return true;
    if (!isAuthenticated) return false;
    const type = user?.accountType?.toLowerCase() || "";
    return type.includes("agent") || type.includes("owner");
  });

  return (
    <nav className={`bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-lg bg-white/98 backdrop-blur-lg" : "shadow-sm"} nav-modern-transparent`}> 
      {/* Main Navigation Row */}
      {!isScrolled ? (
        // Idle (default) state: three-column grid layout for perfect alignment
        <>
          {/* Desktop idle - grid layout for alignment */}
          <div className="hidden lg:grid grid-cols-3 items-center h-20 py-4 container mx-auto px-4 max-w-7xl">
            {/* Left menu */}
            <div className="flex gap-6 justify-start">
              {leftMenu.map((item) => (
                <Link 
                  key={item.label} 
                  to={item.to} 
                  className="relative px-3 py-2 text-gray-800 hover:text-blue-700 font-medium transition-all duration-200 rounded-md hover:bg-blue-50 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  tabIndex={0}
                  role="menuitem"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-700 transition-all duration-200 group-hover:w-full group-hover:left-0 group-focus-visible:w-full group-focus-visible:left-0"></span>
                </Link>
              ))}
            </div>
            {/* Centered logo (centered in grid) */}
            <div className="flex justify-center">
              <Link to="/" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center group-hover:bg-blue-800 transition-colors duration-200 shadow-sm">
                  <span className="text-white font-bold text-sm">RH</span>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block group-hover:text-blue-700 transition-colors duration-200">Real Estate Hotspot</span>
              </Link>
            </div>
            {/* Right menu + Auth */}
            <div className="flex gap-6 items-center justify-end">
              {filteredRightMenu.map((item) => (
                <Link 
                  key={item.label} 
                  to={item.to} 
                  className="relative px-3 py-2 text-gray-800 hover:text-blue-700 font-medium transition-all duration-200 rounded-md hover:bg-blue-50 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  tabIndex={0}
                  role="menuitem"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-700 transition-all duration-200 group-hover:w-full group-hover:left-0 group-focus-visible:w-full group-focus-visible:left-0"></span>
                </Link>
              ))}
              {/* Auth/Account button */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 border-blue-700 text-blue-700 hover:bg-blue-50 hover:border-blue-800 transition-all duration-200 shadow-sm hover:shadow-md">
                      <UserIcon className="h-5 w-5" /> My Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg backdrop-blur-none">
                    {roleLinks.map((item) => (
                      <DropdownMenuItem key={item.label} asChild className="hover:bg-gray-50">
                        <Link to={item.to}>{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer hover:bg-red-50">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="blue" className="shadow-sm hover:shadow-md transition-all duration-200" onClick={() => navigate("/login")}>Get Started</Button>
              )}
              {isAuthenticated && <NotificationCenter />}
            </div>
          </div>
          {/* Mobile idle (unchanged) */}
          <div className="flex items-center h-20 py-4 container mx-auto px-4 max-w-7xl lg:hidden">
            {/* Full logo left-aligned */}
            <Link to="/" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center group-hover:bg-blue-800 transition-colors duration-200 shadow-sm">
                <span className="text-white font-bold text-sm">RH</span>
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Real Estate Hotspot</span>
            </Link>
            {/* Spacer */}
            <div className="flex-1" />
            {/* Mobile Menu Button */}
            <button 
              className="p-2 flex-shrink-0 ml-2 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-700 hover:text-gray-900" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </>
      ) : (
        // Sticky/Search state (unchanged)
        <>
          {/* Desktop sticky/search */}
          <div className="hidden lg:grid grid-cols-3 items-center h-20 py-2 container mx-auto px-4 max-w-7xl">
            {/* Logo left */}
            <div className="flex items-center flex-shrink-0 ml-2">
              <Link to="/" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center group-hover:bg-blue-800 transition-colors duration-200 shadow-sm">
                  <span className="text-white font-bold text-sm">RH</span>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block group-hover:text-blue-700 transition-colors duration-200">Real Estate Hotspot</span>
              </Link>
            </div>
            {/* Search bar center (truly centered, vertically centered, reduced height) */}
            <div className="flex items-center justify-center w-full max-w-xl mx-auto">
              <LocationSearch
                placeholder="Enter an address, neighborhood, city..."
                inputClassName="h-9 py-1 text-base rounded-xl"
                preventAutoSuggestions={true}
                onLocationSelect={(location) => {
                  console.log("Nav search location selected:", location);
                }}
              />
            </div>
            {/* Action right */}
            <div className="flex items-center gap-2 flex-shrink-0 justify-end mr-2">
              {isAuthenticated ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2 border-blue-700 text-blue-700 hover:bg-blue-50 hover:border-blue-800 transition-all duration-200 shadow-sm hover:shadow-md">
                        <UserIcon className="h-5 w-5" /> My Account
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg backdrop-blur-none">
                      {roleLinks.map((item) => (
                        <DropdownMenuItem key={item.label} asChild className="hover:bg-gray-50">
                          <Link to={item.to}>{item.label}</Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer hover:bg-red-50">
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <NotificationCenter />
                </>
              ) : (
                <Button variant="blue" className="shadow-sm hover:shadow-md transition-all duration-200" onClick={() => navigate("/login")}>Get Started</Button>
              )}
            </div>
            {/* Mobile Menu Button (sticky) */}
            <button className="lg:hidden p-2 flex-shrink-0 ml-2 absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          {/* Mobile sticky/search (unchanged) */}
          <div className="lg:hidden flex items-center h-20 container mx-auto px-4 max-w-7xl">
            {/* Logo left */}
            <Link to="/" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center group-hover:bg-blue-800 transition-colors duration-200 shadow-sm">
                <span className="text-white font-bold text-sm">RH</span>
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Real Estate Hotspot</span>
            </Link>
            {/* Search bar full width, vertically centered, reduced height */}
            <div className="flex-1 flex items-center px-2">
              <LocationSearch
                placeholder="Enter an address, neighborhood, city..."
                inputClassName="h-9 py-1 text-base rounded-xl"
                preventAutoSuggestions={true}
                onLocationSelect={(location) => {
                  console.log("Nav search location selected:", location);
                }}
              />
            </div>
            {/* Mobile Menu Button */}
            <button 
              className="p-2 flex-shrink-0 ml-2 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-700 hover:text-gray-900" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </>
      )}
      {/* Mobile Navigation Menu (always rendered, works in both header states) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay with solid background */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu content with solid white background */}
          <div 
            id="mobile-menu"
            className="absolute top-0 right-0 w-80 h-full bg-white shadow-2xl border-l border-gray-200"
            role="menu"
            aria-labelledby="mobile-menu-button"
          >
            {/* Menu header with close button */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Menu content with solid background */}
            <div className="flex flex-col h-full bg-white overflow-y-auto" role="navigation" aria-label="Mobile navigation menu">
              <div className="flex flex-col space-y-1 p-6">
                {/* Main navigation items */}
                {[...leftMenu, ...filteredRightMenu].map((item, index) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center px-4 py-3 text-gray-800 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => setIsMenuOpen(false)}
                    tabIndex={0}
                    role="menuitem"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsMenuOpen(false);
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Separator */}
                <div className="border-t border-gray-200 my-4" />
                
                {/* Auth/Account section with solid background */}
                <div className="space-y-1">
                  {isAuthenticated ? (
                    <>
                      {roleLinks.map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          className="flex items-center px-4 py-3 text-gray-800 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={() => setIsMenuOpen(false)}
                          tabIndex={0}
                          role="menuitem"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setIsMenuOpen(false);
                            }
                          }}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium rounded-lg transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4 mr-3" /> Logout
                      </button>
                    </>
                  ) : (
                    <div className="px-4">
                      <Button 
                        variant="blue" 
                        className="w-full" 
                        onClick={() => { 
                          setIsMenuOpen(false); 
                          navigate("/login"); 
                        }}
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default StickyNavigation;
