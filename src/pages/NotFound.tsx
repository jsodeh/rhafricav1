import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, MapPin, Building, Users, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useScreenReader } from '@/lib/accessibility';
import { logWarning } from '@/lib/errorLogging';

interface SuggestionLink {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
}

const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { announce } = useScreenReader();
  const [searchQuery, setSearchQuery] = useState('');
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  useEffect(() => {
    // Log 404 for analytics
    logWarning('404 Page Not Found', {
      route: location.pathname,
      search: location.search,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });

    // Announce to screen readers
    announce('Page not found. You have reached a page that does not exist.', 'assertive');

    // Get previous path from browser history
    const entries = window.history.length;
    if (entries > 1) {
      // Try to get referrer if it's from the same origin
      const referrer = document.referrer;
      if (referrer && new URL(referrer).origin === window.location.origin) {
        setPreviousPath(new URL(referrer).pathname);
      }
    }
  }, [location, announce]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Generate suggestions based on the current path
  const generateSuggestions = (): SuggestionLink[] => {
    const path = location.pathname.toLowerCase();
    const suggestions: SuggestionLink[] = [];

    // Always include home
    suggestions.push({
      href: '/',
      label: 'Homepage',
      description: 'Return to the main page',
      icon: Home,
      category: 'Navigation',
    });

    // Path-specific suggestions
    if (path.includes('property') || path.includes('properties')) {
      suggestions.push({
        href: '/properties',
        label: 'Browse Properties',
        description: 'View all available properties',
        icon: Building,
        category: 'Properties',
      });
    }

    if (path.includes('agent') || path.includes('agents')) {
      suggestions.push({
        href: '/agents',
        label: 'Find Agents',
        description: 'Connect with real estate agents',
        icon: Users,
        category: 'Agents',
      });
    }

    if (path.includes('search')) {
      suggestions.push({
        href: '/search',
        label: 'Property Search',
        description: 'Search for properties in your area',
        icon: Search,
        category: 'Search',
      });
    }

    if (path.includes('map')) {
      suggestions.push({
        href: '/map',
        label: 'Map Search',
        description: 'Find properties on the map',
        icon: MapPin,
        category: 'Search',
      });
    }

    // Common pages
    if (!suggestions.some(s => s.href === '/properties')) {
      suggestions.push({
        href: '/properties',
        label: 'Properties',
        description: 'Browse available properties',
        icon: Building,
        category: 'Properties',
      });
    }

    if (!suggestions.some(s => s.href === '/agents')) {
      suggestions.push({
        href: '/agents',
        label: 'Agents',
        description: 'Find real estate professionals',
        icon: Users,
        category: 'Agents',
      });
    }

    suggestions.push({
      href: '/help',
      label: 'Help Center',
      description: 'Get help and support',
      icon: HelpCircle,
      category: 'Support',
    });

    return suggestions;
  };

  const suggestions = generateSuggestions();
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.category]) {
      acc[suggestion.category] = [];
    }
    acc[suggestion.category].push(suggestion);
    return acc;
  }, {} as Record<string, SuggestionLink[]>);

  const getPathSegments = () => {
    return location.pathname.split('/').filter(Boolean);
  };

  const renderBreadcrumb = () => {
    const segments = getPathSegments();
    
    if (segments.length === 0) return null;

    return (
      <nav aria-label="Attempted path breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link to="/" className="hover:text-gray-700">
              Home
            </Link>
          </li>
          {segments.map((segment, index) => (
            <li key={index} className="flex items-center">
              <span className="mx-2">/</span>
              <span className={cn(
                index === segments.length - 1 && 'text-red-600 font-medium'
              )}>
                {decodeURIComponent(segment)}
              </span>
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="mb-6">
            <h1 className="text-9xl font-bold text-gray-200 select-none">
              404
            </h1>
            <div className="relative -mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Page Not Found
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                The page you're looking for doesn't exist or may have been moved.
              </p>
            </div>
          </div>

          {renderBreadcrumb()}

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Button onClick={handleGoBack} variant="outline" className="min-w-[140px]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            
            <Button asChild className="min-w-[140px]">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>

          {/* Search */}
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <Search className="h-5 w-5" />
                Search Instead
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search properties, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!searchQuery.trim()}>
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Try these pages instead
          </h3>

          {Object.entries(groupedSuggestions).map(([category, categoryLinks]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryLinks.map((link) => (
                  <Card
                    key={link.href}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <CardContent className="p-4">
                      <Link to={link.href} className="block">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors">
                            <link.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {link.label}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {link.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Previous Path Suggestion */}
        {previousPath && previousPath !== location.pathname && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <ArrowLeft className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">
                    Go back to where you came from
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Return to: {previousPath}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={previousPath}>
                    Go Back
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Still need help?</h4>
          <p className="text-sm text-gray-600 mb-4">
            If you believe this is an error, please contact our support team.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/help">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help Center
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/contact">
                Contact Support
              </Link>
            </Button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            Error ID: 404-{Date.now().toString(36)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
