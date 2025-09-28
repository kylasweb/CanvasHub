"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users, 
  FileText, 
  Camera, 
  CreditCard, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Database,
  Shield,
  Bell,
  Zap,
  Calendar,
  MessageSquare,
  ShoppingCart,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalRevenue: number;
  systemLoad: number;
  storageUsed: number;
  errorRate: number;
  uptime: string;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'project' | 'payment' | 'system';
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    totalRevenue: 0,
    systemLoad: 0,
    storageUsed: 0,
    errorRate: 0,
    uptime: '0d 0h'
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    description: '',
    variant: 'default' as 'default' | 'destructive'
  });

  useEffect(() => {
    if (loading) return;
    
    // No client-side redirects - middleware handles authentication
    // Fetch real dashboard data from API
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/v1/admin/dashboard/stats');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to match our interface
        const transformedStats: SystemStats = {
          totalUsers: data.users.total,
          activeUsers: data.users.active,
          totalProjects: data.projects.total,
          totalRevenue: data.revenue.totalLifetime,
          systemLoad: data.system.load,
          storageUsed: data.system.storageUsed,
          errorRate: data.system.errorRate,
          uptime: data.system.uptime
        };
        
        const transformedActivity: RecentActivity[] = data.recentActivity.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          action: activity.action,
          user: activity.user,
          timestamp: formatTimestamp(activity.timestamp),
          details: activity.details
        }));
        
        setStats(transformedStats);
        setRecentActivity(transformedActivity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to empty data
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalProjects: 0,
          totalRevenue: 0,
          systemLoad: 0,
          storageUsed: 0,
          errorRate: 0,
          uptime: '0d 0h'
        });
        setRecentActivity([]);
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchDashboardData();
  }, [loading]);

  const handleManageUsers = () => {
    router.push('/admin/users');
  };

  const handleManageProjects = () => {
    router.push('/admin/projects');
  };

  const handleManagePayments = () => {
    router.push('/admin/payments');
  };

  const handleSystemSettings = () => {
    router.push('/admin/settings');
  };

  const handleViewAnalytics = () => {
    router.push('/admin/analytics');
  };

  const handleShowAlert = (type: 'system' | 'security' | 'warning') => {
    let config = {
      title: '',
      description: '',
      variant: 'default' as 'default' | 'destructive'
    };

    switch (type) {
      case 'system':
        config = {
          title: 'System Alert',
          description: `System load is currently at ${stats.systemLoad}%. Consider scaling resources if this continues.`,
          variant: 'destructive'
        };
        break;
      case 'security':
        config = {
          title: 'Security Alert',
          description: 'Unusual login activity detected. Please review recent login attempts.',
          variant: 'destructive'
        };
        break;
      case 'warning':
        config = {
          title: 'Storage Warning',
          description: `${stats.storageUsed}% of storage is used. Consider cleaning up old files or upgrading storage.`,
          variant: 'default'
        };
        break;
    }

    setAlertConfig(config);
    setShowAlert(true);
    
    // Auto-hide alert after 5 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleDismissAlert = () => {
    setShowAlert(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading || loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // No client-side access checks - middleware handles authentication
  // If user reaches here, they are authenticated and authorized

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Alert Component */}
        {showAlert && (
          <Alert className={`mb-6 ${alertConfig.variant === 'destructive' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{alertConfig.title}</AlertTitle>
            <AlertDescription>{alertConfig.description}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your entire platform from one central location</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin Access
              </Badge>
              <Badge variant="secondary">
                System Uptime: {stats.uptime}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers.toLocaleString()} active now
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(stats.totalRevenue / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">
                Total lifetime revenue
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{100 - stats.errorRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.errorRate}% error rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    System Status
                  </CardTitle>
                  <CardDescription>Current system performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">System Load</span>
                    <Badge variant={stats.systemLoad > 80 ? "destructive" : stats.systemLoad > 60 ? "default" : "secondary"}>
                      {stats.systemLoad}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Storage Used</span>
                    <Badge variant={stats.storageUsed > 80 ? "destructive" : "secondary"}>
                      {stats.storageUsed}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Error Rate</span>
                    <Badge variant={stats.errorRate > 1 ? "destructive" : "secondary"}>
                      {stats.errorRate}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Uptime</span>
                    <Badge variant="outline">{stats.uptime}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest system and user activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className="flex-shrink-0">
                          {activity.type === 'user' && <Users className="w-4 h-4 text-blue-500" />}
                          {activity.type === 'project' && <FileText className="w-4 h-4 text-green-500" />}
                          {activity.type === 'payment' && <CreditCard className="w-4 h-4 text-purple-500" />}
                          {activity.type === 'system' && <Database className="w-4 h-4 text-orange-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.details}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.user} • {activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleManageUsers}>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Manage Users
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleManageProjects}>
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Project Management</CardTitle>
                  <CardDescription>Oversee all projects across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Manage Projects
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleManagePayments}>
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Payment Management</CardTitle>
                  <CardDescription>Handle transactions, subscriptions, and billing</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Manage Payments
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle>Media Management</CardTitle>
                  <CardDescription>Manage photos, videos, and media storage</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Manage Media
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-red-600" />
                  </div>
                  <CardTitle>Content Management</CardTitle>
                  <CardDescription>Manage landing pages, blogs, and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Manage Content
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleSystemSettings}>
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Settings className="w-6 h-6 text-gray-600" />
                  </div>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure platform settings and integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    System Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/audit-logs')}>
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 text-indigo-600" />
                  </div>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>Track system activities and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Logs
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/system-health')}>
                <CardHeader>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6 text-teal-600" />
                  </div>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Monitor system performance and services</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    System Health
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/admin/notifications')}>
                <CardHeader>
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                    <Bell className="w-6 h-6 text-pink-600" />
                  </div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage system notifications and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Notifications
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Platform Analytics
                </CardTitle>
                <CardDescription>Comprehensive analytics and reporting dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-4">User Growth</h3>
                    <div className="text-3xl font-bold text-blue-600">+12.5%</div>
                    <p className="text-sm text-gray-600">vs last month</p>
                  </div>
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-4">Revenue Growth</h3>
                    <div className="text-3xl font-bold text-green-600">+18.3%</div>
                    <p className="text-sm text-gray-600">vs last month</p>
                  </div>
                </div>
                <div className="mt-6">
                  <Button onClick={handleViewAnalytics} className="w-full">
                    View Detailed Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    System Alerts
                  </CardTitle>
                  <CardDescription>Current system warnings and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">High System Load</p>
                        <p className="text-xs text-gray-600">System load is currently at {stats.systemLoad}%</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleShowAlert('system')}
                        className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                      >
                        View Details
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Database className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Storage Usage</p>
                        <p className="text-xs text-gray-600">{stats.storageUsed}% of storage is used</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleShowAlert('warning')}
                        className="text-blue-700 border-blue-300 hover:bg-blue-100"
                      >
                        View Details
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Shield className="w-5 h-5 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Security Alert</p>
                        <p className="text-xs text-gray-600">Unusual activity detected</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleShowAlert('security')}
                        className="text-red-700 border-red-300 hover:bg-red-100"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Send System Notification
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    Run System Backup
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleShowAlert('security')}>
                    <Shield className="w-4 h-4 mr-2" />
                    Security Audit
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleShowAlert('system')}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Test System Alert
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}