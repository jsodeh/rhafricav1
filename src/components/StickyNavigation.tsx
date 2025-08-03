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
  ].filter(Boolean);

  // Filter rightMenu for 'Manage Rentals' based on user role
  const filteredRightMenu = rightMenu.filter(item => {
    if (item.label !== "Manage Rentals") return true;
    if (!isAuthenticated) return false;
    const type = user?.accountType?.toLowerCase() || "";
    return type.includes("agent") || type.includes("owner");
  });

  return (
    <nav className={`bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-md" : ""}`}> 
      {/* Main Navigation Row */}
      {!isScrolled ? (
        // Idle (default) state: three-column grid layout for perfect alignment
        <>
          {/* Desktop idle - grid layout for alignment */}
          <div className="hidden lg:grid grid-cols-3 items-center h-20 py-4 px-4 w-full">
            {/* Left menu */}
            <div className="flex gap-6 justify-start">
              {leftMenu.map((item) => (
                <Link key={item.label} to={item.to} className="text-gray-700 hover:text-blue-700 font-medium transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
            {/* Centered logo (centered in grid) */}
            <div className="flex justify-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RH</span>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">Real Estate Hotspot</span>
              </Link>
            </div>
            {/* Right menu + Auth */}
            <div className="flex gap-6 items-center justify-end">
              {filteredRightMenu.map((item) => (
                <Link key={item.label} to={item.to} className="text-gray-700 hover:text-blue-700 font-medium transition-colors">
                  {item.label}
                </Link>
              ))}
              {/* Auth/Account button */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 border-blue-700 text-blue-700 hover:bg-blue-50">
                      <UserIcon className="h-5 w-5" /> My Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {roleLinks.map((item) => (
                      <DropdownMenuItem key={item.label} asChild>
                        <Link to={item.to}>{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="blue" onClick={() => navigate("/login")}>Get Started</Button>
              )}
              {isAuthenticated && <NotificationCenter />}
            </div>
          </div>
          {/* Mobile idle (unchanged) */}
          <div className="flex items-center h-20 py-4 px-4 lg:hidden w-full">
            {/* Full logo left-aligned */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RH</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Real Estate Hotspot</span>
            </Link>
            {/* Spacer */}
            <div className="flex-1" />
            {/* Mobile Menu Button */}
            <button className="p-2 flex-shrink-0 ml-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </>
      ) : (
        // Sticky/Search state (unchanged)
        <>
          {/* Desktop sticky/search */}
          <div className="hidden lg:grid grid-cols-3 items-center h-20 py-2 px-4 w-full">
            {/* Logo left */}
            <div className="flex items-center flex-shrink-0 ml-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RH</span>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">Real Estate Hotspot</span>
              </Link>
            </div>
            {/* Search bar center (truly centered, vertically centered, reduced height) */}
            <div className="flex items-center justify-center w-full max-w-xl mx-auto">
              <LocationSearch
                placeholder="Enter an address, neighborhood, city..."
                inputClassName="h-9 py-1 text-base"
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
                      <Button variant="outline" className="flex items-center gap-2 border-blue-700 text-blue-700 hover:bg-blue-50">
                        <UserIcon className="h-5 w-5" /> My Account
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {roleLinks.map((item) => (
                        <DropdownMenuItem key={item.label} asChild>
                          <Link to={item.to}>{item.label}</Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <NotificationCenter />
                </>
              ) : (
                <Button variant="blue" onClick={() => navigate("/login")}>Get Started</Button>
              )}
            </div>
            {/* Mobile Menu Button (sticky) */}
            <button className="lg:hidden p-2 flex-shrink-0 ml-2 absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          {/* Mobile sticky/search (unchanged) */}
          <div className="lg:hidden flex items-center h-20 px-4 w-full">
            {/* Logo left */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RH</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Real Estate Hotspot</span>
            </Link>
            {/* Search bar full width, vertically centered, reduced height */}
            <div className="flex-1 flex items-center px-2">
              <LocationSearch
                placeholder="Enter an address, neighborhood, city..."
                inputClassName="h-9 py-1 text-base"
                onLocationSelect={(location) => {
                  console.log("Nav search location selected:", location);
                }}
              />
            </div>
            {/* Mobile Menu Button */}
            <button className="p-2 flex-shrink-0 ml-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </>
      )}
      {/* Mobile Navigation Menu (always rendered, works in both header states) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute top-0 right-0 w-64 h-full bg-white shadow-lg p-6 flex flex-col">
            {/* ...mobile menu content... */}
            {/* Example: render leftMenu, rightMenu, and auth actions here */}
            <div className="flex flex-col space-y-3 pt-4">
              {[...leftMenu, ...filteredRightMenu].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-gray-700 hover:text-blue-700 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {/* Auth/Account button */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                {isAuthenticated ? (
                  <>
                    {roleLinks.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        className="text-gray-700 hover:text-blue-700 font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="text-red-600 font-medium py-2 text-left w-full"
                    >
                      <LogOut className="h-4 w-4 mr-2 inline" /> Logout
                    </button>
                  </>
                ) : (
                  <Button variant="blue" className="w-full" onClick={() => { setIsMenuOpen(false); navigate("/login"); }}>Get Started</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default StickyNavigation;
