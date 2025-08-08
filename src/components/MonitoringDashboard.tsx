import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Monitor,
  Zap,
  Server,
  Globe,
  ChevronDown,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { healthCheckManager, SystemHealth, HealthCheckResult } from '@/lib/healthCheck';
import { performanceMonitor, PerformanceReport, PerformanceMetric } from '@/lib/performanceMonitor';
import { useAuth } from '@/contexts/AuthContext';

interface MonitoringDashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  defaultVisible?: boolean;
}

// Helper function to check if user has admin access
const hasAdminAccess = (user: any): boolean => {
  if (!user) return false;
  
  // Check for admin account types
  const adminAccountTypes = [
    'Admin',
    'Super Admin', 
    'System Administrator',
    'Platform Admin'
  ];
  
  return adminAccountTypes.includes(user.accountType);
};

// Helper function to check if monitoring should be visible
const shouldShowMonitoring = (user: any): boolean => {
  // Check environment variables for explicit monitoring control
  const enableMonitoring = import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING;
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  // If monitoring is explicitly disabled, don't show
  if (enableMonitoring === 'false') {
    return false;
  }
  
  // In development environment, always show monitoring
  if (isDevelopment) {
    return true;
  }
  
  // In production, only show to admin users
  if (isProduction) {
    return hasAdminAccess(user);
  }
  
  // Default fallback - show to admin users only
  return hasAdminAccess(user);
};

const StatusIcon: React.FC<{ status: 'healthy' | 'degraded' | 'unhealthy' }> = ({ status }) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'degraded':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'unhealthy':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
  }
};

const MetricCard: React.FC<{ 
  title: string; 
  metric?: PerformanceMetric; 
  icon: React.ComponentType<any>;
}> = ({ title, metric, icon: Icon }) => {
  if (!metric) {
    return (
      <Card className="opacity-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{title}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">No data</p>
        </CardContent>
      </Card>
    );
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={cn('transition-colors', getRatingColor(metric.rating))}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{title}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {metric.rating}
          </Badge>
        </div>
        <p className="text-lg font-semibold mt-1">
          {metric.value.toFixed(metric.name === 'cls' ? 3 : 0)}{metric.unit}
        </p>
        {metric.threshold && (
          <p className="text-xs opacity-75 mt-1">
            Target: ≤{metric.threshold.good}{metric.unit}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const HealthCheckCard: React.FC<{ check: HealthCheckResult }> = ({ check }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'border-green-200 bg-green-50';
      case 'degraded':
        return 'border-yellow-200 bg-yellow-50';
      case 'unhealthy':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className={cn('transition-colors', getStatusColor(check.status))}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon status={check.status} />
            <span className="text-sm font-medium capitalize">
              {check.name.replace('-', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {check.responseTime}ms
            </Badge>
            {check.details && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-6 w-6 p-0"
              >
                <ChevronDown className={cn(
                  'h-3 w-3 transition-transform',
                  showDetails && 'rotate-180'
                )} />
              </Button>
            )}
          </div>
        </div>
        
        {check.message && (
          <p className="text-xs mt-2 opacity-75">{check.message}</p>
        )}

        {showDetails && check.details && (
          <Collapsible open={showDetails}>
            <CollapsibleContent className="mt-3">
              <pre className="text-xs bg-white/50 p-2 rounded border overflow-auto">
                {JSON.stringify(check.details, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  className,
  autoRefresh = true,
  refreshInterval = 30000,
  defaultVisible = false,
}) => {
  const { user, isAuthenticated } = useAuth();
  
  // Check if monitoring should be available for this user
  const canAccessMonitoring = shouldShowMonitoring(user);
  
  // If user doesn't have access, don't render anything
  if (!canAccessMonitoring) {
    return null;
  }
  
  // Additional check for development-only features
  const isDevelopmentMode = import.meta.env.DEV;
  const showAdvancedFeatures = isDevelopmentMode || hasAdminAccess(user);
  
  const [isVisible, setIsVisible] = useState(defaultVisible || process.env.NODE_ENV === 'development');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [health, performance] = await Promise.all([
        healthCheckManager.runAllChecks(),
        Promise.resolve(performanceMonitor.getPerformanceReport()),
      ]);
      
      setSystemHealth(health);
      setPerformanceReport(performance);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Monitoring refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Initial load
    refresh();

    // Setup auto-refresh
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(refresh, refreshInterval);
    }

    // Setup performance monitoring
    performanceMonitor.startMonitoring();
    
    // Setup health monitoring
    healthCheckManager.startMonitoring(refreshInterval);

    // Add listeners
    const healthListener = (health: SystemHealth) => setSystemHealth(health);
    const performanceListener = (report: PerformanceReport) => setPerformanceReport(report);
    
    healthCheckManager.addListener(healthListener);
    performanceMonitor.addListener(performanceListener);

    return () => {
      if (interval) clearInterval(interval);
      healthCheckManager.removeListener(healthListener);
      performanceMonitor.removeListener(performanceListener);
    };
  }, [isVisible, autoRefresh, refreshInterval, refresh]);

  const downloadReport = useCallback(() => {
    const report = {
      systemHealth,
      performanceReport,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [systemHealth, performanceReport]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          <Monitor className="h-4 w-4 mr-2" />
          Show Monitoring
        </Button>
      </div>
    );
  }

  const getOverallStatus = () => {
    if (!systemHealth || !performanceReport) return 'unknown';
    
    if (systemHealth.overall === 'unhealthy' || performanceReport.summary.overall === 'poor') {
      return 'critical';
    }
    if (systemHealth.overall === 'degraded' || performanceReport.summary.overall === 'needs-improvement') {
      return 'warning';
    }
    return 'healthy';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 w-96 max-h-[70vh] overflow-hidden',
      'bg-white rounded-lg shadow-xl border',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          <h3 className="font-semibold">System Monitor</h3>
          {isDevelopmentMode && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              DEV
            </Badge>
          )}
          {hasAdminAccess(user) && !isDevelopmentMode && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              ADMIN
            </Badge>
          )}
          {overallStatus === 'healthy' && <CheckCircle className="h-4 w-4 text-green-600" />}
          {overallStatus === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
          {overallStatus === 'critical' && <AlertTriangle className="h-4 w-4 text-red-600" />}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            onClick={refresh}
            disabled={isRefreshing}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Refresh monitoring data"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </Button>
          
          {showAdvancedFeatures && (
            <Button
              onClick={downloadReport}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Download monitoring report (Admin/Dev only)"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[50vh]">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 m-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-4 space-y-4">
            {/* System Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Health:</span>
                    <Badge variant="outline" className="ml-1 text-xs">
                      {systemHealth?.overall || 'unknown'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Performance:</span>
                    <Badge variant="outline" className="ml-1 text-xs">
                      {performanceReport?.summary.overall || 'unknown'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Uptime:</span>
                    <span className="ml-1">
                      {systemHealth ? Math.round(systemHealth.uptime / 1000 / 60) : 0}m
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Score:</span>
                    <span className="ml-1">
                      {performanceReport?.summary.score || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <MetricCard
                title="LCP"
                metric={performanceReport?.coreWebVitals.lcp}
                icon={Clock}
              />
              <MetricCard
                title="CLS"
                metric={performanceReport?.coreWebVitals.cls}
                icon={TrendingUp}
              />
            </div>

            {/* Recent Alerts */}
            {performanceReport?.alerts && performanceReport.alerts.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Recent Alerts ({performanceReport.alerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2">
                    {performanceReport.alerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="text-xs p-2 bg-red-50 rounded border">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{alert.metric}</span>
                          <Badge variant="outline" className="text-xs">
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-red-600 mt-1">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {lastUpdate && (
              <p className="text-xs text-gray-500 text-center">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </TabsContent>

          <TabsContent value="health" className="p-4 space-y-3">
            {systemHealth?.checks.map((check) => (
              <HealthCheckCard key={check.name} check={check} />
            )) || (
              <div className="text-center text-gray-500 py-8">
                <Server className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No health data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="p-4 space-y-3">
            {/* Core Web Vitals */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-2">
                <MetricCard
                  title="LCP"
                  metric={performanceReport?.coreWebVitals.lcp}
                  icon={Clock}
                />
                <MetricCard
                  title="FID"
                  metric={performanceReport?.coreWebVitals.fid}
                  icon={Zap}
                />
                <MetricCard
                  title="CLS"
                  metric={performanceReport?.coreWebVitals.cls}
                  icon={TrendingUp}
                />
                <MetricCard
                  title="FCP"
                  metric={performanceReport?.coreWebVitals.fcp}
                  icon={Clock}
                />
              </CardContent>
            </Card>

            {/* Custom Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Custom Metrics</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-2">
                <MetricCard
                  title="API Response"
                  metric={performanceReport?.customMetrics.apiResponseTime}
                  icon={Server}
                />
                <MetricCard
                  title="Memory Usage"
                  metric={performanceReport?.customMetrics.memoryUsage}
                  icon={Activity}
                />
                <MetricCard
                  title="Error Rate"
                  metric={performanceReport?.customMetrics.errorRate}
                  icon={AlertTriangle}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
