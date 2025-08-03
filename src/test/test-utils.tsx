import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { SearchProvider } from '@/contexts/SearchContext';

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
  user?: any;
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    queryClient = createTestQueryClient(),
    user,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider value={user}>
              <SearchProvider>
                {children}
              </SearchProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Custom render for components that don't need full provider context
export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'] }: { initialEntries?: string[] } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper }),
  };
}

// Mock user data
export const mockUser = {
  id: 'mock-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  role: 'user',
};

export const mockAgent = {
  id: 'mock-agent-id',
  email: 'agent@example.com',
  user_metadata: {
    name: 'Test Agent',
    avatar_url: 'https://example.com/agent-avatar.jpg',
  },
  role: 'agent',
};

export const mockAdmin = {
  id: 'mock-admin-id',
  email: 'admin@example.com',
  user_metadata: {
    name: 'Test Admin',
  },
  role: 'admin',
};

// Mock property data
export const mockProperty = {
  id: '1',
  title: 'Modern Apartment',
  description: 'A beautiful modern apartment in the city center',
  price: 250000,
  location: 'Lagos, Nigeria',
  bedrooms: 3,
  bathrooms: 2,
  area: 1200,
  property_type: 'apartment',
  listing_type: 'sale',
  images: ['/api/placeholder/400/300'],
  features: ['Air Conditioning', 'Swimming Pool', 'Parking'],
  agent_id: 'agent-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockProperties = [
  mockProperty,
  {
    id: '2',
    title: 'Family House',
    description: 'Perfect family home with garden',
    price: 450000,
    location: 'Abuja, Nigeria',
    bedrooms: 4,
    bathrooms: 3,
    area: 2000,
    property_type: 'house',
    listing_type: 'sale',
    images: ['/api/placeholder/400/300'],
    features: ['Garden', 'Garage', 'Security'],
    agent_id: 'agent-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Test utilities
export const testUtils = {
  // Wait for element to appear
  waitForElement: async (selector: string) => {
    return await waitFor(() => screen.getByTestId(selector));
  },

  // Wait for element by text
  waitForText: async (text: string) => {
    return await waitFor(() => screen.getByText(text));
  },

  // Fill form field
  fillField: async (user: any, label: string, value: string) => {
    const field = screen.getByLabelText(label);
    await user.clear(field);
    await user.type(field, value);
  },

  // Submit form
  submitForm: async (user: any, submitText = 'Submit') => {
    const submitButton = screen.getByRole('button', { name: new RegExp(submitText, 'i') });
    await user.click(submitButton);
  },

  // Navigate to page
  navigateTo: async (user: any, linkText: string) => {
    const link = screen.getByRole('link', { name: new RegExp(linkText, 'i') });
    await user.click(link);
  },

  // Open dropdown/select
  openSelect: async (user: any, label: string) => {
    const select = screen.getByLabelText(label);
    await user.click(select);
  },

  // Select option from dropdown
  selectOption: async (user: any, optionText: string) => {
    const option = screen.getByRole('option', { name: new RegExp(optionText, 'i') });
    await user.click(option);
  },

  // Check/uncheck checkbox
  toggleCheckbox: async (user: any, label: string) => {
    const checkbox = screen.getByLabelText(label);
    await user.click(checkbox);
  },

  // Mock window methods
  mockWindowMethod: (method: string, mockImplementation: any) => {
    const originalMethod = (window as any)[method];
    (window as any)[method] = mockImplementation;
    return () => {
      (window as any)[method] = originalMethod;
    };
  },

  // Mock localStorage
  mockLocalStorage: () => {
    const store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach(key => delete store[key]);
      },
    };
  },

  // Create mock intersection observer
  mockIntersectionObserver: () => {
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });
    (window as any).IntersectionObserver = mockIntersectionObserver;
    return mockIntersectionObserver;
  },

  // Wait for loading to complete
  waitForLoadingToFinish: async () => {
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  },

  // Assert error message
  expectErrorMessage: async (message: string) => {
    await waitFor(() => {
      expect(screen.getByText(message)).toBeInTheDocument();
    });
  },

  // Assert success message
  expectSuccessMessage: async (message: string) => {
    await waitFor(() => {
      expect(screen.getByText(message)).toBeInTheDocument();
    });
  },

  // Simulate file upload
  uploadFile: async (user: any, input: HTMLElement, file: File) => {
    await user.upload(input, file);
  },

  // Create mock file
  createMockFile: (name = 'test.jpg', type = 'image/jpeg', size = 1024) => {
    return new File(['mock file content'], name, { type, size });
  },

  // Mock geolocation
  mockGeolocation: (coords?: { latitude: number; longitude: number }) => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => {
        success({
          coords: coords || {
            latitude: 6.5244,
            longitude: 3.3792,
            accuracy: 100,
          },
        });
      }),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };
    
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });
    
    return mockGeolocation;
  },

  // Simulate keyboard navigation
  pressKey: async (user: any, key: string) => {
    await user.keyboard(`{${key}}`);
  },

  // Focus element
  focusElement: (element: HTMLElement) => {
    fireEvent.focus(element);
  },
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { userEvent };

// Custom matchers
export const customMatchers = {
  toBeAccessible: (element: HTMLElement) => {
    // Basic accessibility checks
    const hasAriaLabel = element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby');
    const hasRole = element.hasAttribute('role');
    const isFocusable = element.tabIndex >= 0 || ['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase());
    
    return {
      pass: hasAriaLabel || hasRole || isFocusable,
      message: () => 'Element should have accessibility attributes (aria-label, role, or be focusable)',
    };
  },
};

// Export default render with providers
export { renderWithProviders as render };
