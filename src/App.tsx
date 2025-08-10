import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { createOptimizedQueryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SearchProvider } from "@/contexts/SearchContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ProtectedRoute, AdminRoute, AgentRoute, OwnerRoute, ProfessionalRoute, AuthRoute } from "@/components/ProtectedRoute";
import SuperAdminRoute from "@/components/SuperAdminRoute";
import { WelcomeNotificationProvider } from "./components/WelcomeNotificationProvider";
import { ErrorBoundary, CriticalErrorBoundary } from "./components/ErrorBoundary";
import ErrorNotificationSystem from "./components/ErrorNotificationSystem";
import AIAssistant from "./components/AIAssistant";
import LiveChatWidget from "./components/LiveChatWidget";
import PerformanceMonitor from "./components/PerformanceMonitor";
import PerformanceOptimizer from "./components/PerformanceOptimizer";
import { OrganizationSEO } from "./components/SEO";
import { AnalyticsProvider, AnalyticsDebugger } from "./components/AnalyticsProvider";
import MonitoringDashboard from "./components/MonitoringDashboard";
import { Suspense, lazy, useEffect } from "react";
import { ScreenReaderUtils } from "./lib/accessibility";
import { errorManager } from "./lib/errorManager";

// Lazy load page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Properties = lazy(() => import("./pages/Properties"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const MapSearch = lazy(() => import("./pages/MapSearch"));
const Agents = lazy(() => import("./pages/Agents"));
const AgentProfile = lazy(() => import("./pages/AgentProfile"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const ServiceProviderDashboard = lazy(() => import("./pages/ServiceProviderDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Messages = lazy(() => import("./pages/Messages"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Help = lazy(() => import("./pages/Help"));
const Advertise = lazy(() => import("./pages/Advertise"));
const Mortgage = lazy(() => import("./pages/Mortgage"));
const Services = lazy(() => import("./pages/Services"));
const ManageRentals = lazy(() => import("./pages/ManageRentals"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const AuthConfirm = lazy(() => import("./pages/AuthConfirm"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AddProperty = lazy(() => import("./pages/AddProperty"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));

const queryClient = createOptimizedQueryClient();

const AccessibleLoadingSpinner = () => (
  <div
    className="flex items-center justify-center min-h-screen"
    role="status"
    aria-live="polite"
    aria-label="Loading application"
  >
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" aria-hidden="true"></div>
    <span className="sr-only">Loading application, please wait...</span>
  </div>
);

const App = () => {
  useEffect(() => {
    // Announce application ready state
    ScreenReaderUtils.announce("Real Estate Hotspot application loaded", "polite");

    // Set up application-level accessibility
    document.documentElement.lang = "en";
    document.title = "Real Estate Hotspot - Find Your Perfect Property";

    // Initialize error management
    errorManager.clearErrorQueue();

    // Set up global error context
    const setGlobalErrorContext = () => {
      const userId = localStorage.getItem('user_id');
      const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
      sessionStorage.setItem('session_id', sessionId);

      // This context will be automatically included in all error reports
      (window as any).__errorContext = {
        userId,
        sessionId,
        buildVersion: import.meta.env.VITE_APP_VERSION || 'development',
        environment: import.meta.env.MODE,
      };
    };

    setGlobalErrorContext();
  }, []);

  return (
  <CriticalErrorBoundary>
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <SearchProvider>
          <WelcomeNotificationProvider />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnalyticsProvider>
            <Suspense fallback={<AccessibleLoadingSpinner />}>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/confirm" element={<AuthConfirm />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/properties/add" element={
                <AuthRoute>
                  <AddProperty />
                </AuthRoute>
              } />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/map" element={<MapSearch />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/agents/:id" element={<AgentProfile />} />
              <Route path="/help" element={<Help />} />
              <Route path="/advertise" element={<Advertise />} />
              <Route path="/mortgage" element={<Mortgage />} />
              <Route path="/services" element={<Services />} />
              
              {/* Protected Routes */}
              <Route path="/onboarding" element={
                <AuthRoute>
                  <Onboarding />
                </AuthRoute>
              } />
              <Route path="/dashboard" element={
                <AuthRoute>
                  <Dashboard />
                </AuthRoute>
              } />
              <Route path="/agent-dashboard" element={
                <AgentRoute>
                  <AgentDashboard />
                </AgentRoute>
              } />
              <Route path="/owner-dashboard" element={
                <OwnerRoute>
                  <OwnerDashboard />
                </OwnerRoute>
              } />
              <Route path="/service-dashboard" element={
                <ProfessionalRoute>
                  <ServiceProviderDashboard />
                </ProfessionalRoute>
              } />
              <Route path="/admin-dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/super-admin" element={
                <SuperAdminRoute>
                  <SuperAdminDashboard />
                </SuperAdminRoute>
              } />
              <Route path="/messages" element={
                <AuthRoute>
                  <Messages />
                </AuthRoute>
              } />
              <Route path="/manage-rentals" element={
                <AuthRoute>
                  <ManageRentals />
                </AuthRoute>
              } />
              
                {/* Catch-all Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <ErrorNotificationSystem
              maxNotifications={3}
              autoHideDelay={5000}
              showLowSeverity={false}
            />
            <AIAssistant />
            <LiveChatWidget />
            <PerformanceMonitor />
            <PerformanceOptimizer />
            <OrganizationSEO />
            <AnalyticsDebugger />
            <MonitoringDashboard />
            </AnalyticsProvider>
          </BrowserRouter>
        </SearchProvider>
      </AuthProvider>
      </AccessibilityProvider>
    </TooltipProvider>
    </QueryClientProvider>
  </CriticalErrorBoundary>
  );
};

export default App;
