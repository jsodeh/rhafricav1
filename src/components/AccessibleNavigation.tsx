import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Building, 
  Users, 
  Phone, 
  User, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useKeyboardNavigation, 
  useFocusManagement, 
  useScreenReader,
  KEYBOARD_CODES,
  ARIA_ROLES,
  ARIA_PROPS
} from '@/lib/accessibility';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  children?: NavigationItem[];
}

interface AccessibleNavigationProps {
  className?: string;
  onNavigate?: (href: string) => void;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: Home,
    description: 'Return to homepage'
  },
  {
    id: 'properties',
    label: 'Properties',
    href: '/properties',
    icon: Building,
    description: 'Browse available properties',
    children: [
      { id: 'buy', label: 'Buy Properties', href: '/properties?type=buy', icon: Building },
      { id: 'rent', label: 'Rent Properties', href: '/properties?type=rent', icon: Building },
      { id: 'commercial', label: 'Commercial', href: '/properties?type=commercial', icon: Building },
    ]
  },
  {
    id: 'agents',
    label: 'Agents',
    href: '/agents',
    icon: Users,
    description: 'Find real estate agents'
  },
  {
    id: 'contact',
    label: 'Contact',
    href: '/contact',
    icon: Phone,
    description: 'Get in touch with us'
  },
];

const userMenuItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: User,
    description: 'Your personal dashboard'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Account settings'
  },
  {
    id: 'help',
    label: 'Help',
    href: '/help',
    icon: HelpCircle,
    description: 'Get help and support'
  },
];

export const AccessibleNavigation: React.FC<AccessibleNavigationProps> = ({
  className,
  onNavigate
}) => {
  const location = useLocation();
  const { announce } = useScreenReader();
  const { setFocus } = useFocusManagement();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  // Keyboard navigation for main navigation
  const { handleKeyDown: handleMainNavKeyDown } = useKeyboardNavigation(
    () => {
      // Enter key - activate focused item
      if (focusedItem) {
        const item = [...navigationItems, ...userMenuItems].find(item => item.id === focusedItem);
        if (item) {
          if (item.children) {
            setActiveDropdown(activeDropdown === item.id ? null : item.id);
          } else {
            handleNavigation(item.href, item.label);
          }
        }
      }
    },
    () => {
      // Space key - same as enter for navigation
      if (focusedItem) {
        const item = [...navigationItems, ...userMenuItems].find(item => item.id === focusedItem);
        if (item) {
          if (item.children) {
            setActiveDropdown(activeDropdown === item.id ? null : item.id);
          } else {
            handleNavigation(item.href, item.label);
          }
        }
      }
    },
    () => {
      // Escape key - close dropdowns and mobile menu
      setActiveDropdown(null);
      setIsMobileMenuOpen(false);
    },
    (direction) => {
      // Arrow keys - navigate through items
      const allItems = [...navigationItems, ...userMenuItems];
      const currentIndex = allItems.findIndex(item => item.id === focusedItem);
      
      if (direction === 'left' || direction === 'up') {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : allItems.length - 1;
        setFocusedItem(allItems[prevIndex].id);
      } else if (direction === 'right' || direction === 'down') {
        const nextIndex = currentIndex < allItems.length - 1 ? currentIndex + 1 : 0;
        setFocusedItem(allItems[nextIndex].id);
      }
    }
  );

  // Handle navigation with announcements
  const handleNavigation = (href: string, label: string) => {
    announce(`Navigating to ${label}`, 'polite');
    onNavigate?.(href);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    
    if (newState) {
      announce('Navigation menu opened', 'polite');
      // Focus first item when menu opens
      setTimeout(() => {
        const firstButton = mobileMenuRef.current?.querySelector('button, a');
        if (firstButton instanceof HTMLElement) {
          setFocus(firstButton);
        }
      }, 100);
    } else {
      announce('Navigation menu closed', 'polite');
    }
  };

  // Handle dropdown toggle
  const toggleDropdown = (itemId: string) => {
    const newState = activeDropdown === itemId ? null : itemId;
    setActiveDropdown(newState);
    
    const item = navigationItems.find(item => item.id === itemId);
    if (item) {
      announce(
        newState ? `${item.label} submenu opened` : `${item.label} submenu closed`,
        'polite'
      );
    }
  };

  // Skip to main content
  const skipToMainContent = (e: React.KeyboardEvent) => {
    if (e.key === KEYBOARD_CODES.ENTER || e.key === KEYBOARD_CODES.SPACE) {
      e.preventDefault();
      const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
      if (mainContent instanceof HTMLElement) {
        mainContent.focus();
        mainContent.scrollIntoView();
        announce('Skipped to main content', 'polite');
      }
    }
  };

  // Check if current path matches navigation item
  const isActiveItem = (href: string) => {
    return location.pathname === href || 
           (href !== '/' && location.pathname.startsWith(href));
  };

  // Effect to handle escape key globally
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_CODES.ESCAPE) {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Navigation item component
  const NavigationItem: React.FC<{
    item: NavigationItem;
    level?: number;
    inMobileMenu?: boolean;
  }> = ({ item, level = 1, inMobileMenu = false }) => {
    const isActive = isActiveItem(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isDropdownOpen = activeDropdown === item.id;
    const isFocused = focusedItem === item.id;

    const baseClasses = cn(
      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      isActive 
        ? 'bg-blue-100 text-blue-900 border-blue-500' 
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
      isFocused && 'ring-2 ring-blue-500 ring-offset-2'
    );

    if (hasChildren) {
      return (
        <div className="relative">
          <Button
            variant="ghost"
            className={cn(baseClasses, 'w-full justify-between')}
            onClick={() => toggleDropdown(item.id)}
            onKeyDown={handleMainNavKeyDown}
            onFocus={() => setFocusedItem(item.id)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
            aria-controls={`${item.id}-submenu`}
            aria-describedby={item.description ? `${item.id}-description` : undefined}
          >
            <span className="flex items-center gap-2">
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </span>
            <ChevronDown 
              className={cn(
                'h-4 w-4 transition-transform',
                isDropdownOpen && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </Button>
          
          {item.description && (
            <span id={`${item.id}-description`} className="sr-only">
              {item.description}
            </span>
          )}

          {isDropdownOpen && (
            <div
              id={`${item.id}-submenu`}
              role="menu"
              aria-labelledby={item.id}
              className={cn(
                'absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50',
                inMobileMenu && 'relative mt-0 w-full shadow-none border-0 bg-gray-50'
              )}
            >
              {item.children?.map((child) => (
                <Link
                  key={child.id}
                  to={child.href}
                  role="menuitem"
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
                    'focus-visible:outline-none focus-visible:bg-blue-100 focus-visible:text-blue-900',
                    isActiveItem(child.href) && 'bg-blue-50 text-blue-900'
                  )}
                  onClick={() => handleNavigation(child.href, child.label)}
                  tabIndex={0}
                >
                  <child.icon className="h-4 w-4" aria-hidden="true" />
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        to={item.href}
        className={baseClasses}
        onClick={() => handleNavigation(item.href, item.label)}
        onKeyDown={handleMainNavKeyDown}
        onFocus={() => setFocusedItem(item.id)}
        aria-current={isActive ? 'page' : undefined}
        aria-describedby={item.description ? `${item.id}-description` : undefined}
      >
        <item.icon className="h-4 w-4" aria-hidden="true" />
        {item.label}
        {item.description && (
          <span id={`${item.id}-description`} className="sr-only">
            {item.description}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Skip to main content link */}
      <a
        ref={skipLinkRef}
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50',
          'bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2'
        )}
        onKeyDown={skipToMainContent}
      >
        Skip to main content
      </a>

      <nav
        role="navigation"
        aria-label="Main navigation"
        className={cn('bg-white border-b border-gray-200', className)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className={cn(
                  'flex items-center gap-2 text-xl font-bold text-gray-900',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md'
                )}
                onClick={() => handleNavigation('/', 'Real Estate Hotspot')}
                aria-label="Real Estate Hotspot - Home"
              >
                <Building className="h-8 w-8 text-blue-600" aria-hidden="true" />
                <span>Real Estate Hotspot</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4" role="menubar">
                {navigationItems.map((item) => (
                  <NavigationItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Search Button */}
            <div className="hidden md:block">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                aria-label="Open search"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="hidden lg:inline">Search</span>
              </Button>
            </div>

            {/* User Menu */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-4">
                {userMenuItems.map((item) => (
                  <NavigationItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            role="menu"
            aria-label="Mobile navigation menu"
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Search in mobile */}
              <Button
                variant="outline"
                className="w-full justify-start gap-2 mb-4"
                aria-label="Search properties"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search Properties
              </Button>

              {/* Navigation items */}
              {navigationItems.map((item) => (
                <NavigationItem 
                  key={item.id} 
                  item={item} 
                  inMobileMenu={true}
                />
              ))}
              
              {/* Divider */}
              <div className="border-t border-gray-200 my-4" role="separator" />
              
              {/* User menu items */}
              {userMenuItems.map((item) => (
                <NavigationItem 
                  key={item.id} 
                  item={item} 
                  inMobileMenu={true}
                />
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default AccessibleNavigation;
