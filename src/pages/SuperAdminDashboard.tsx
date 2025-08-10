import React, { useState, useEffect } from "react";
import StickyNavigation from "@/components/StickyNavigation";
import AdminAnalytics from "@/components/AdminAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminOperations } from "@/hooks/useAdminOperations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Building,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Settings,
  Database,
  Activity,
  Shield,
  Mail,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  BarChart3,
  Search,
  Filter,
  Clock,
  Server,
  HardDrive,
  Zap,
} from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  totalProperties: number;
  totalAgents: number;
  pendingVerifications: number;
  totalInquiries: number;
  activeListings: number;
  monthlyRevenue: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface User {
  id: string;
  email: string;
  full_name: string;
  account_type: string;
  created_at: string;
  last_sign_in_at: string;
  email_confirmed_at: string;
  banned_until: string | null;
}

interface Agent {
  id: string;
  agency_name: string;
  license_number: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  rating: number;
  total_reviews: number;
  created_at: string;
  user_profiles: {
    full_name: string;
    email: string;
  };
}

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const {
    isAdmin,
    isLoading: adminLoading,
    error: adminError,
    fetchPlatformStats,
    fetchSystemHealth,
    fetchUsers,
    fetchPendingAgents,
    verifyAgent,
    banUser,
    unbanUser,
    deleteUser,
    fetchFlaggedProperties,
    moderateProperty,
    exportData,
    enableMaintenanceMode,
    performDatabaseBackup,
    getRecentActivity
  } = useAdminOperations();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [flaggedProperties, setFlaggedProperties] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [
        platformStats,
        healthData,
        usersData,
        agentsData,
        flaggedData,
        activityData
      ] = await Promise.all([
        fetchPlatformStats(),
        fetchSystemHealth(),
        fetchUsers({ limit: 50 }),
        fetchPendingAgents(),
        fetchFlaggedProperties(),
        getRecentActivity(20)
      ]);

      setStats(platformStats);
      setSystemHealth(healthData);
      setUsers(usersData);
      setAgents(agentsData);
      setFlaggedProperties(flaggedData);
      setRecentActivity(activityData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'delete', reason?: string) => {
    try {
      let success = false;
      
      switch (action) {
        case 'ban':
          success = await banUser(userId, 30, reason); // 30 days ban
          break;
        case 'unban':
          success = await unbanUser(userId);
          break;
        case 'delete':
          success = await deleteUser(userId);
          break;
      }

      if (success) {
        // Refresh users list
        const updatedUsers = await fetchUsers({ limit: 50 });
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const handleAgentVerification = async (agentId: string, status: 'verified' | 'rejected', notes?: string) => {
    try {
      const success = await verifyAgent(agentId, status, notes);
      
      if (success) {
        // Refresh agents list
        const updatedAgents = await fetchPendingAgents();
        setAgents(updatedAgents);
      }
    } catch (error) {
      console.error('Error updating agent verification:', error);
    }
  };

  const handleExportData = async (type: 'users' | 'properties' | 'agents' | 'inquiries') => {
    try {
      const data = await exportData(type);
      
      if (data) {
        const csv = convertToCSV(data);
        downloadCSV(csv, `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handlePropertyModeration = async (propertyId: string, action: 'approve' | 'reject' | 'remove', notes?: string) => {
    try {
      const success = await moderateProperty(propertyId, action, notes);
      
      if (success) {
        // Refresh flagged properties list
        const updatedFlagged = await fetchFlaggedProperties();
        setFlaggedProperties(updatedFlagged);
      }
    } catch (error) {
      console.error('Error moderating property:', error);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || user.account_type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Show loading state while checking admin status
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if admin check failed
  if (adminError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading admin dashboard: {adminError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Super Admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-600" />
              Super Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Platform management and oversight
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : stats ? (
            // Actual statistics
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers?.toLocaleString() || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Properties</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProperties?.toLocaleString() || 0}</p>
                    </div>
                    <Building className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Verified Agents</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalAgents?.toLocaleString() || 0}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications?.toLocaleString() || 0}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : systemHealth ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-gray-500" />
                          <span>Database Status</span>
                        </div>
                        <Badge 
                          variant={systemHealth.database === 'healthy' ? 'default' : 'destructive'}
                          className={systemHealth.database === 'healthy' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {systemHealth.database === 'healthy' ? 'Healthy' : 'Issues'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-gray-500" />
                          <span>API Response</span>
                        </div>
                        <Badge 
                          variant={systemHealth.responseTime < 500 ? 'default' : 'secondary'}
                          className={systemHealth.responseTime < 500 ? 'bg-green-100 text-green-800' : ''}
                        >
                          {systemHealth.responseTime}ms
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-gray-500" />
                          <span>Storage Usage</span>
                        </div>
                        <Badge variant="secondary">
                          {systemHealth.storageUsed}% Used
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>Active Users</span>
                        </div>
                        <span className="font-semibold">{systemHealth.activeUsers?.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <Server className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Unable to load system health</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Activity</span>
                    <Button variant="ghost" size="sm" onClick={handleRefresh}>
                      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="w-2 h-2 rounded-full" />
                          <Skeleton className="h-4 flex-1" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : recentActivity.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 text-sm">
                          <div 
                            className={`w-2 h-2 rounded-full ${
                              activity.severity === 'success' ? 'bg-green-500' :
                              activity.severity === 'warning' ? 'bg-amber-500' :
                              activity.severity === 'error' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`}
                          />
                          <span className="flex-1">{activity.description}</span>
                          <span className="text-gray-500 text-xs">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('agents')}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Verify Agents
                    {stats?.pendingVerifications > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {stats.pendingVerifications}
                      </Badge>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('properties')}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Review Properties
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExportData('users')}
                    disabled={adminLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('system')}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Platform Metrics Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Growth Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : stats ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Monthly User Growth</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-green-600">
                            +{stats.monthlyGrowth?.users || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">New Properties</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-blue-600">
                            +{stats.monthlyGrowth?.properties || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Monthly Inquiries</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                          <span className="font-semibold text-purple-600">
                            +{stats.monthlyGrowth?.inquiries || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Attention Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.pendingVerifications > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{stats.pendingVerifications}</strong> agent verification{stats.pendingVerifications !== 1 ? 's' : ''} pending review
                        </AlertDescription>
                      </Alert>
                    )}
                    {flaggedProperties.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{flaggedProperties.length}</strong> propert{flaggedProperties.length !== 1 ? 'ies' : 'y'} flagged for review
                        </AlertDescription>
                      </Alert>
                    )}
                    {systemHealth?.database !== 'healthy' && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Database health issues detected - immediate attention required
                        </AlertDescription>
                      </Alert>
                    )}
                    {(!stats?.pendingVerifications || stats.pendingVerifications === 0) && 
                     flaggedProperties.length === 0 && 
                     systemHealth?.database === 'healthy' && (
                      <div className="text-center text-gray-500 py-4">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p>All systems running smoothly</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Management Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
                <p className="text-gray-600">Manage all platform users and their permissions</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={() => handleExportData('users')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Users
                </Button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  <option value="all">All Account Types</option>
                  <option value="buyer">Buyers</option>
                  <option value="agent">Agents</option>
                  <option value="owner">Property Owners</option>
                  <option value="admin">Administrators</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>

            {/* User Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Verified Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {users.filter(u => u.email_confirmed_at).length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Banned Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {users.filter(u => u.banned_until && new Date(u.banned_until) > new Date()).length}
                      </p>
                    </div>
                    <Ban className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New This Month</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {users.filter(u => {
                          const userDate = new Date(u.created_at);
                          const monthAgo = new Date();
                          monthAgo.setMonth(monthAgo.getMonth() - 1);
                          return userDate > monthAgo;
                        }).length}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Users ({filteredUsers.length})</span>
                  <Badge variant="secondary">
                    Showing {filteredUsers.length} of {users.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-gray-900">User</th>
                          <th className="text-left p-3 font-medium text-gray-900">Account Type</th>
                          <th className="text-left p-3 font-medium text-gray-900">Status</th>
                          <th className="text-left p-3 font-medium text-gray-900">Joined</th>
                          <th className="text-left p-3 font-medium text-gray-900">Last Active</th>
                          <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => {
                          const isBanned = user.banned_until && new Date(user.banned_until) > new Date();
                          const isVerified = !!user.email_confirmed_at;
                          
                          return (
                            <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <Users className="h-4 w-4 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {user.full_name || 'No name provided'}
                                    </p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge 
                                  variant="secondary"
                                  className={
                                    user.account_type === 'admin' ? 'bg-red-100 text-red-800' :
                                    user.account_type === 'agent' ? 'bg-blue-100 text-blue-800' :
                                    user.account_type === 'owner' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {user.account_type || 'buyer'}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-col gap-1">
                                  <Badge 
                                    variant={isVerified ? "default" : "destructive"}
                                    className={isVerified ? "bg-green-100 text-green-800" : ""}
                                  >
                                    {isVerified ? 'Verified' : 'Unverified'}
                                  </Badge>
                                  {isBanned && (
                                    <Badge variant="destructive">
                                      Banned
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-sm text-gray-600">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="p-3 text-sm text-gray-600">
                                {user.last_sign_in_at 
                                  ? formatTimeAgo(user.last_sign_in_at)
                                  : 'Never'
                                }
                              </td>
                              <td className="p-3">
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" title="View Details">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" title="Edit User">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  {!isBanned ? (
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      title="Ban User"
                                      onClick={() => handleUserAction(user.id, 'ban', 'Banned by admin')}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Ban className="h-3 w-3" />
                                    </Button>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      title="Unban User"
                                      onClick={() => handleUserAction(user.id, 'unban')}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    title="Delete User"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                                        handleUserAction(user.id, 'delete');
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500">
                      {searchTerm || selectedFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'No users have been registered yet'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            {/* Agent Management Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Agent Management</h2>
                <p className="text-gray-600">Review and verify real estate agent applications</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={() => handleExportData('agents')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Agents
                </Button>
              </div>
            </div>

            {/* Agent Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Agents</p>
                      <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Review</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {agents.filter(a => a.verification_status === 'pending').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Verified</p>
                      <p className="text-2xl font-bold text-green-600">
                        {agents.filter(a => a.verification_status === 'verified').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">
                        {agents.filter(a => a.verification_status === 'rejected').length}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Verifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    Pending Verifications
                  </div>
                  <Badge variant="secondary">
                    {agents.filter(a => a.verification_status === 'pending').length} pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : agents.filter(agent => agent.verification_status === 'pending').length > 0 ? (
                  <div className="space-y-4">
                    {agents.filter(agent => agent.verification_status === 'pending').map((agent) => (
                      <div key={agent.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{agent.agency_name}</h3>
                                <p className="text-sm text-gray-600">
                                  {agent.user_profiles?.full_name} • {agent.user_profiles?.email}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-amber-600 border-amber-200">
                                Pending Review
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">License Number:</span>
                                <p className="text-gray-600">{agent.license_number}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Experience:</span>
                                <p className="text-gray-600">{agent.years_experience || 'Not specified'} years</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Specializations:</span>
                                <p className="text-gray-600">
                                  {agent.specializations?.length > 0 
                                    ? agent.specializations.join(', ')
                                    : 'Not specified'
                                  }
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Applied:</span>
                                <p className="text-gray-600">{new Date(agent.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>

                            {agent.verification_documents && agent.verification_documents.length > 0 && (
                              <div>
                                <span className="font-medium text-gray-700">Documents:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {agent.verification_documents.map((doc, index) => (
                                    <Button key={index} variant="outline" size="sm">
                                      <Eye className="h-3 w-3 mr-1" />
                                      Document {index + 1}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                            <Button 
                              size="sm" 
                              onClick={() => handleAgentVerification(agent.id, 'verified', 'Agent verified by admin')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt('Please provide a reason for rejection:');
                                if (reason) {
                                  handleAgentVerification(agent.id, 'rejected', reason);
                                }
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4 mr-2" />
                              Contact
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-500">No pending agent verifications at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Agents Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-blue-500" />
                  All Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : agents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-gray-900">Agent</th>
                          <th className="text-left p-3 font-medium text-gray-900">Agency</th>
                          <th className="text-left p-3 font-medium text-gray-900">License</th>
                          <th className="text-left p-3 font-medium text-gray-900">Status</th>
                          <th className="text-left p-3 font-medium text-gray-900">Rating</th>
                          <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agents.map((agent) => (
                          <tr key={agent.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <UserCheck className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {agent.user_profiles?.full_name || 'No name'}
                                  </p>
                                  <p className="text-sm text-gray-500">{agent.user_profiles?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <p className="font-medium text-gray-900">{agent.agency_name}</p>
                              <p className="text-sm text-gray-500">
                                {agent.years_experience || 0} years experience
                              </p>
                            </td>
                            <td className="p-3">
                              <p className="text-sm font-mono text-gray-600">{agent.license_number}</p>
                            </td>
                            <td className="p-3">
                              <Badge 
                                variant={
                                  agent.verification_status === 'verified' ? 'default' :
                                  agent.verification_status === 'pending' ? 'secondary' :
                                  'destructive'
                                }
                                className={
                                  agent.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                                  agent.verification_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                  ''
                                }
                              >
                                {agent.verification_status}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">
                                  {agent.rating ? agent.rating.toFixed(1) : 'N/A'}
                                </span>
                                {agent.rating && (
                                  <span className="text-xs text-gray-500">
                                    ({agent.total_reviews || 0} reviews)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" title="View Details">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" title="Contact Agent">
                                  <Mail className="h-3 w-3" />
                                </Button>
                                {agent.verification_status === 'verified' && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    title="Suspend Agent"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Ban className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                    <p className="text-gray-500">No agent applications have been submitted yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            {/* Property Management Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Property Management</h2>
                <p className="text-gray-600">Monitor and moderate property listings</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={() => handleExportData('properties')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Properties
                </Button>
              </div>
            </div>

            {/* Property Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Properties</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalProperties || 0}</p>
                    </div>
                    <Building className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Listings</p>
                      <p className="text-2xl font-bold text-green-600">{stats?.activeListings || 0}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New This Month</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats?.monthlyGrowth?.properties || 0}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Flagged Content</p>
                      <p className="text-2xl font-bold text-amber-600">{flaggedProperties.length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Flagged Properties */}
            {flaggedProperties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Flagged Properties
                    </div>
                    <Badge variant="destructive">
                      {flaggedProperties.length} require attention
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flaggedProperties.map((flagged) => (
                      <div key={flagged.id} className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-gray-900">{flagged.title}</h3>
                              <Badge variant="outline" className="text-amber-600 border-amber-300">
                                {flagged.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>Reason:</strong> {flagged.reason}
                            </p>
                            <p className="text-sm text-gray-500">
                              Reported by: {flagged.reporter_email} • {formatTimeAgo(flagged.flagged_at)}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                // View property details
                                console.log('View property:', flagged.property_id);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handlePropertyModeration(flagged.property_id, 'approve', 'Content reviewed and approved')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt('Please provide a reason for removal:');
                                if (reason) {
                                  handlePropertyModeration(flagged.property_id, 'remove', reason);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Property Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Views per Property</span>
                      <span className="font-semibold">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Inquiry Conversion Rate</span>
                      <span className="font-semibold text-green-600">3.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Time on Market</span>
                      <span className="font-semibold">45 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Properties Sold This Month</span>
                      <span className="font-semibold text-blue-600">23</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Most Popular Location</span>
                      <span className="font-semibold">Lekki, Lagos</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Property Price</span>
                      <span className="font-semibold">₦45,000,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Price Growth (YoY)</span>
                      <span className="font-semibold text-green-600">+12.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Most Listed Property Type</span>
                      <span className="font-semibold">Apartments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Property Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  Recent Property Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-2 h-2 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {/* Mock recent property activities */}
                    {[
                      {
                        id: '1',
                        type: 'property_listed',
                        description: 'New luxury apartment listed in Victoria Island',
                        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                        severity: 'info'
                      },
                      {
                        id: '2',
                        type: 'property_inquiry',
                        description: 'Inquiry received for 4-bedroom house in Lekki',
                        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
                        severity: 'info'
                      },
                      {
                        id: '3',
                        type: 'property_sold',
                        description: 'Property sold: 3-bedroom flat in Ikeja',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        severity: 'success'
                      },
                      {
                        id: '4',
                        type: 'property_flagged',
                        description: 'Property flagged for suspicious pricing',
                        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                        severity: 'warning'
                      }
                    ].map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 text-sm">
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            activity.severity === 'success' ? 'bg-green-500' :
                            activity.severity === 'warning' ? 'bg-amber-500' :
                            activity.severity === 'error' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}
                        />
                        <span className="flex-1">{activity.description}</span>
                        <span className="text-gray-500 text-xs">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Moderation Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Content Moderation Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Search className="h-6 w-6 mb-2" />
                    <span className="text-sm">Bulk Review</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    <span className="text-sm">Flag Content</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Ban className="h-6 w-6 mb-2" />
                    <span className="text-sm">Block Listings</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    <span className="text-sm">Export Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdminAnalytics 
              timeRange={analyticsTimeRange}
              onTimeRangeChange={setAnalyticsTimeRange}
            />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            {/* System Management Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">System Administration</h2>
                <p className="text-gray-600">Manage system settings and perform maintenance operations</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Status
                </Button>
              </div>
            </div>

            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Database Status</p>
                      <p className="text-lg font-bold text-green-600">Healthy</p>
                    </div>
                    <Database className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Server Status</p>
                      <p className="text-lg font-bold text-green-600">Online</p>
                    </div>
                    <Server className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Storage Usage</p>
                      <p className="text-lg font-bold text-blue-600">45%</p>
                    </div>
                    <HardDrive className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Maintenance</p>
                      <p className="text-lg font-bold text-gray-600">Disabled</p>
                    </div>
                    <Settings className="h-8 w-8 text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Database Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Database Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => performDatabaseBackup()}
                    disabled={adminLoading}
                  >
                    <Download className="h-6 w-6 mb-2" />
                    <span className="text-sm">Backup Database</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <RefreshCw className="h-6 w-6 mb-2" />
                    <span className="text-sm">Optimize Tables</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span className="text-sm">View Statistics</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Shield className="h-6 w-6 mb-2" />
                    <span className="text-sm">Security Scan</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Trash2 className="h-6 w-6 mb-2" />
                    <span className="text-sm">Clean Logs</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Activity className="h-6 w-6 mb-2" />
                    <span className="text-sm">Monitor Performance</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-gray-500">Temporarily disable platform access</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => enableMaintenanceMode(true, 'Scheduled maintenance')}
                    >
                      Enable
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">User Registration</p>
                      <p className="text-sm text-gray-500">Allow new user signups</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">System email notifications</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">API Rate Limiting</p>
                      <p className="text-sm text-gray-500">Control API request rates</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    Security & Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Failed Login Attempts</p>
                      <p className="text-sm text-gray-500">Last 24 hours: 12 attempts</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Logs
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Security Policies</p>
                      <p className="text-sm text-gray-500">Password and access rules</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Audit Logs</p>
                      <p className="text-sm text-gray-500">Admin action history</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">System Alerts</p>
                      <p className="text-sm text-gray-500">Configure alert thresholds</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  Recent System Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {[
                    {
                      id: '1',
                      type: 'system_backup',
                      description: 'Database backup completed successfully',
                      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                      severity: 'success'
                    },
                    {
                      id: '2',
                      type: 'security_alert',
                      description: 'Multiple failed login attempts detected',
                      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                      severity: 'warning'
                    },
                    {
                      id: '3',
                      type: 'system_update',
                      description: 'System configuration updated by admin',
                      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                      severity: 'info'
                    },
                    {
                      id: '4',
                      type: 'performance_alert',
                      description: 'High CPU usage detected on server',
                      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                      severity: 'warning'
                    }
                  ].map((event) => (
                    <div key={event.id} className="flex items-center gap-3 text-sm p-3 border rounded-lg">
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          event.severity === 'success' ? 'bg-green-500' :
                          event.severity === 'warning' ? 'bg-amber-500' :
                          event.severity === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}
                      />
                      <span className="flex-1">{event.description}</span>
                      <span className="text-gray-500 text-xs">
                        {formatTimeAgo(event.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;