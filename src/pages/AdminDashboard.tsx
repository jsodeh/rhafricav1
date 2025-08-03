import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Home,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  Shield,
  FileText,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Building,
  CreditCard,
  Bell,
  Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock admin data
const mockAdminData = {
  name: "Admin User",
  email: "admin@realestatehotspot.com",
  role: "Super Admin",
  lastLogin: "2024-01-20 14:30",
  permissions: ["users", "content", "finance", "support", "analytics"],
};

// Mock users data
// const mockUsers = [
//   {
//     id: 1,
//     name: "John Doe",
//     email: "john.doe@email.com",
//     role: "Property Buyer",
//     status: "Active",
//     joinDate: "2024-01-15",
//     lastActive: "2024-01-20",
//     verified: true,
//     avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
//   },
//   {
//     id: 2,
//     name: "Sarah Johnson",
//     email: "sarah.johnson@realestate.com",
//     role: "Real Estate Agent",
//     status: "Pending Verification",
//     joinDate: "2024-01-18",
//     lastActive: "2024-01-19",
//     verified: false,
//     avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face",
//   },
//   {
//     id: 3,
//     name: "Michael Thompson",
//     email: "michael.thompson@email.com",
//     role: "Property Owner",
//     status: "Suspended",
//     joinDate: "2024-01-10",
//     lastActive: "2024-01-17",
//     verified: true,
//     avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
//   },
// ]; // REMOVE this line and the array

// Mock pending approvals
// const mockPendingApprovals = [
//   {
//     id: 1,
//     type: "Property Listing",
//     title: "Luxury 4BR Penthouse",
//     submittedBy: "Sarah Johnson",
//     submittedDate: "2024-01-20",
//     status: "Pending Review",
//     priority: "High",
//   },
//   {
//     id: 2,
//     type: "Agent Verification",
//     title: "License Verification",
//     submittedBy: "David Okafor",
//     submittedDate: "2024-01-19",
//     status: "Pending Documents",
//     priority: "Medium",
//   },
//   {
//     id: 3,
//     type: "Service Provider",
//     title: "Engineering Services",
//     submittedBy: "Engineer John Doe",
//     submittedDate: "2024-01-18",
//     status: "Pending Review",
//     priority: "Low",
//   },
// ];

// Mock support tickets
// const mockSupportTickets = [
//   {
//     id: 1,
//     user: "John Doe",
//     subject: "Payment Issue",
//     priority: "High",
//     status: "Open",
//     assignedTo: "Support Team",
//     createdAt: "2024-01-20",
//     lastUpdated: "2024-01-20",
//   },
//   {
//     id: 2,
//     user: "Sarah Johnson",
//     subject: "Account Verification",
//     priority: "Medium",
//     status: "In Progress",
//     assignedTo: "Admin",
//     createdAt: "2024-01-19",
//     lastUpdated: "2024-01-20",
//   },
//   {
//     id: 3,
//     user: "Michael Thompson",
//     subject: "Property Listing Issue",
//     priority: "Low",
//     status: "Resolved",
//     assignedTo: "Support Team",
//     createdAt: "2024-01-18",
//     lastUpdated: "2024-01-19",
//   },
// ];

// Mock financial data
const mockFinancialData = [
  {
    month: "January 2024",
    revenue: "₦45,800,000",
    transactions: 234,
    commission: "₦4,580,000",
    expenses: "₦2,300,000",
    profit: "₦43,500,000",
  },
  {
    month: "December 2023",
    revenue: "₦38,200,000",
    transactions: 198,
    commission: "₦3,820,000",
    expenses: "₦1,900,000",
    profit: "₦36,300,000",
  },
  {
    month: "November 2023",
    revenue: "₦32,500,000",
    transactions: 167,
    commission: "₦3,250,000",
    expenses: "₦1,600,000",
    profit: "₦30,900,000",
  },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userFilter, setUserFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [users, setUsers] = useState<any[]>([]); // TODO: type properly
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalProperties, setTotalProperties] = useState<number | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [approvalsError, setApprovalsError] = useState<string | null>(null);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [financeError, setFinanceError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUsersError(null);
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        setUsersError(error.message);
      } else {
        setUsers(data || []);
      }
      setLoadingUsers(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        // Total users
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (userError) throw userError;
        setTotalUsers(userCount || 0);

        // Total properties
        const { count: propertyCount, error: propertyError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });
        if (propertyError) throw propertyError;
        setTotalProperties(propertyCount || 0);

        // Monthly revenue (sum of price for properties created this month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);
        const { data: revenueData, error: revenueError } = await supabase
          .from('properties')
          .select('price,created_at');
        if (revenueError) throw revenueError;
        const thisMonthRevenue = (revenueData || [])
          .filter((p: any) => p.created_at && new Date(p.created_at) >= startOfMonth)
          .reduce((sum: number, p: any) => sum + (p.price || 0), 0);
        setMonthlyRevenue(thisMonthRevenue);

        // Pending approvals (properties with verified = false)
        const { count: pendingCount, error: pendingError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('verified', false);
        if (pendingError) throw pendingError;
        setPendingApprovals(pendingCount || 0);
      } catch (err: any) {
        setStatsError(err.message || 'Failed to fetch stats');
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchApprovals = async () => {
      setLoadingApprovals(true);
      setApprovalsError(null);
      try {
        // Fetch properties with verified = false
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('verified', false);
        if (error) throw error;
        // Map to approval card fields
        const mapped = (data || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          type: 'Property Listing',
          submittedBy: p.agent_id || 'N/A',
          submittedDate: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A',
          status: 'Pending Review',
          priority: 'Medium',
        }));
        setApprovals(mapped);
      } catch (err: any) {
        setApprovalsError(err.message || 'Failed to fetch approvals');
      } finally {
        setLoadingApprovals(false);
      }
    };
    fetchApprovals();
  }, []);

  useEffect(() => {
    const fetchSupportTickets = async () => {
      setLoadingTickets(true);
      setTicketsError(null);
      try {
        const { data, error } = await supabase
          .from('case_submissions')
          .select('*');
        if (error) throw error;
        // Map to ticket fields
        const mapped = (data || []).map((t: any) => ({
          id: t.id,
          subject: t.case_type,
          user: t.name || t.email,
          priority: t.urgency || 'Medium',
          status: t.status || 'Open',
          assignedTo: 'Support Team',
          createdAt: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A',
        }));
        setSupportTickets(mapped);
      } catch (err: any) {
        setTicketsError(err.message || 'Failed to fetch support tickets');
      } finally {
        setLoadingTickets(false);
      }
    };
    fetchSupportTickets();
  }, []);

  useEffect(() => {
    const fetchFinance = async () => {
      setLoadingFinance(true);
      setFinanceError(null);
      try {
        // Total revenue: sum of all property prices
        const { data, error } = await supabase
          .from('properties')
          .select('price');
        if (error) throw error;
        const totalRevenue = (data || []).reduce((sum: number, p: any) => sum + (p.price || 0), 0);
        const totalCommission = totalRevenue * 0.1;
        const totalExpenses = totalRevenue * 0.05;
        const netProfit = totalRevenue - totalCommission - totalExpenses;
        setFinanceSummary({
          totalRevenue,
          totalCommission,
          totalExpenses,
          netProfit,
        });
      } catch (err: any) {
        setFinanceError(err.message || 'Failed to fetch financial data');
      } finally {
        setLoadingFinance(false);
      }
    };
    fetchFinance();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (userFilter === "all") return true;
    // Assuming user.status exists, otherwise adjust as needed
    return user.status?.toLowerCase() === userFilter.toLowerCase();
  });

  const filteredApprovals = approvals.filter((approval) => {
    if (approvalFilter === "all") return true;
    if (approvalFilter === "pending") return approval.status.toLowerCase().includes("pending");
    if (approvalFilter === "documents") return approval.status.toLowerCase().includes("documents");
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "approved":
      case "resolved":
        return "bg-green-100 text-green-800";
      case "pending":
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                System Management & Analytics
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalUsers !== null ? totalUsers.toLocaleString() : (statsLoading ? 'Loading...' : 'N/A')}
                  </p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12% this month
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Properties</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalProperties !== null ? totalProperties.toLocaleString() : (statsLoading ? 'Loading...' : 'N/A')}
                  </p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +8% this month
                  </p>
                </div>
                <Home className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {monthlyRevenue !== null ? `₦${monthlyRevenue.toLocaleString()}` : (statsLoading ? 'Loading...' : 'N/A')}
                  </p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +15% this month
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingApprovals !== null ? pendingApprovals : (statsLoading ? 'Loading...' : 'N/A')}
                  </p>
                  <p className="text-sm text-yellow-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Requires attention
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>System Uptime</span>
                    <Badge variant="outline" className="text-green-600">
                      "99.9%"
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg Response Time</span>
                    <Badge variant="outline">2.3s</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Sessions</span>
                    <Badge variant="outline">1,247</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Support Tickets</span>
                    <Badge variant="outline" className="text-yellow-600">
                      {supportTickets.length} Open
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registration</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Property listing approved</p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Support ticket created</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment processed</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Users
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Verified
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={"https://via.placeholder.com/50"}
                                alt={user.email}
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.email}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {user.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.role || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor("active")}>Active</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {/* No is_verified field in profiles, so always show as not verified */}
                            <XCircle className="h-5 w-5 text-red-500" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Approvals</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="documents">Pending Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingApprovals ? (
                <p>Loading approvals...</p>
              ) : approvalsError ? (
                <p className="text-red-500">{approvalsError}</p>
              ) : filteredApprovals.length === 0 ? (
                <p>No pending approvals found.</p>
              ) : (
                filteredApprovals.map((approval) => (
                  <Card key={approval.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{approval.title}</CardTitle>
                          <p className="text-sm text-gray-500">{approval.type}</p>
                        </div>
                        <Badge className={getPriorityColor(approval.priority)}>
                          {approval.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Submitted by:</span>
                        <span className="font-medium">{approval.submittedBy}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date:</span>
                        <span>{approval.submittedDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <Badge className={getStatusColor(approval.status)}>
                          {approval.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ticket
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loadingTickets ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center">Loading support tickets...</td>
                        </tr>
                      ) : ticketsError ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-red-500">{ticketsError}</td>
                        </tr>
                      ) : supportTickets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center">No support tickets found.</td>
                        </tr>
                      ) : (
                        supportTickets.map((ticket) => (
                          <tr key={ticket.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  #{ticket.id} - {ticket.subject}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {ticket.user}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {ticket.assignedTo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {ticket.createdAt}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Revenue</span>
                    <span className="font-bold text-green-600">
                      {loadingFinance ? 'Loading...' : financeError ? (
                        <span className="text-red-500">{financeError}</span>
                      ) : (
                        `₦${financeSummary?.totalRevenue?.toLocaleString() ?? '0'}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Commission</span>
                    <span className="font-bold text-blue-600">₦{loadingFinance ? 'Loading...' : financeError ? <span className="text-red-500">{financeError}</span> : <span>{financeSummary?.totalCommission?.toLocaleString() ?? '0'}</span>}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Expenses</span>
                    <span className="font-bold text-red-600">₦{loadingFinance ? 'Loading...' : financeError ? <span className="text-red-500">{financeError}</span> : <span>{financeSummary?.totalExpenses?.toLocaleString() ?? '0'}</span>}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Net Profit</span>
                    <span className="font-bold text-green-600">₦{loadingFinance ? 'Loading...' : financeError ? <span className="text-red-500">{financeError}</span> : <span>{financeSummary?.netProfit?.toLocaleString() ?? '0'}</span>}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockFinancialData.map((data, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{data.month}</span>
                        <div className="text-right">
                          <div className="font-medium">{data.revenue}</div>
                          <div className="text-xs text-gray-500">
                            {data.transactions} transactions
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>New Registrations</span>
                    <span className="font-bold text-green-600">+156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Users</span>
                    <span className="font-bold text-blue-600">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Conversion Rate</span>
                    <span className="font-bold text-purple-600">12.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg Session Duration</span>
                    <span className="font-bold text-orange-600">8m 32s</span>
                  </div>
                </CardContent>
              </Card>

              {/* Property Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Property Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Listings</span>
                    <span className="font-bold text-green-600">892</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Listings</span>
                    <span className="font-bold text-blue-600">567</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg Days on Market</span>
                    <span className="font-bold text-purple-600">23 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg Views per Listing</span>
                    <span className="font-bold text-orange-600">156</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard; 