import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  MessageSquare,
  Calendar,
  DollarSign,
  Activity,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  userGrowth: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down';
  };
  propertyMetrics: {
    totalListings: number;
    activeListings: number;
    soldThisMonth: number;
    averagePrice: number;
  };
  engagementMetrics: {
    totalViews: number;
    inquiries: number;
    conversionRate: number;
    averageTimeOnSite: number;
  };
  revenueMetrics: {
    monthlyRevenue: number;
    yearlyRevenue: number;
    averageTransactionValue: number;
    growthRate: number;
  };
}

interface AdminAnalyticsProps {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ 
  timeRange = '30d', 
  onTimeRangeChange 
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData({
        userGrowth: {
          current: 2847,
          previous: 2156,
          change: 32.1,
          trend: 'up'
        },
        propertyMetrics: {
          totalListings: 1234,
          activeListings: 987,
          soldThisMonth: 45,
          averagePrice: 45000000
        },
        engagementMetrics: {
          totalViews: 15678,
          inquiries: 234,
          conversionRate: 1.49,
          averageTimeOnSite: 4.2
        },
        revenueMetrics: {
          monthlyRevenue: 2500000,
          yearlyRevenue: 28000000,
          averageTransactionValue: 55555,
          growthRate: 18.5
        }
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case '1y': return 'Last Year';
      default: return 'Last 30 Days';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Platform Analytics</h2>
          <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Platform Analytics</h2>
          <p className="text-gray-600">Comprehensive platform performance metrics</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeRangeChange?.(range as any)}
            >
              {getTimeRangeLabel(range)}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analyticsData.userGrowth.current)}
                </p>
                <div className="flex items-center mt-2">
                  {analyticsData.userGrowth.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    analyticsData.userGrowth.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analyticsData.userGrowth.change}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analyticsData.propertyMetrics.activeListings)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {formatNumber(analyticsData.propertyMetrics.totalListings)} total
                </p>
              </div>
              <Building className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analyticsData.revenueMetrics.monthlyRevenue)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {analyticsData.revenueMetrics.growthRate}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">growth</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.engagementMetrics.conversionRate}%
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {formatNumber(analyticsData.engagementMetrics.inquiries)} inquiries
                </p>
              </div>
              <Activity className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-green-500" />
              Property Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Properties Sold This Month</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {analyticsData.propertyMetrics.soldThisMonth}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Property Price</span>
              <span className="font-semibold">
                {formatCurrency(analyticsData.propertyMetrics.averagePrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Property Views</span>
              <span className="font-semibold">
                {formatNumber(analyticsData.engagementMetrics.totalViews)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Time on Site</span>
              <span className="font-semibold">
                {analyticsData.engagementMetrics.averageTimeOnSite} min
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Yearly Revenue</span>
              <span className="font-semibold">
                {formatCurrency(analyticsData.revenueMetrics.yearlyRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Transaction Value</span>
              <span className="font-semibold">
                {formatCurrency(analyticsData.revenueMetrics.averageTransactionValue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Revenue Growth Rate</span>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="font-semibold text-green-600">
                  {analyticsData.revenueMetrics.growthRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>User growth chart would be rendered here</p>
                <p className="text-sm">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Property Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Property activity chart would be rendered here</p>
                <p className="text-sm">Shows listings, views, and inquiries over time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;