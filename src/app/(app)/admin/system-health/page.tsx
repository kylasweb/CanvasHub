'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Wifi, 
  MemoryStick, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Clock,
  Users,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    total: number;
    used: number;
    available: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    available: number;
    usage: number;
  };
  network: {
    incoming: number;
    outgoing: number;
    latency: number;
  };
  uptime: string;
  loadAverage: number[];
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime: number;
  lastCheck: string;
  uptime: string;
  description: string;
}

interface HealthStats {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  uptime: string;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  databaseConnections: number;
  cacheHitRate: number;
  queueLength: number;
}

export default function AdminSystemHealthPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const mockMetrics: SystemMetrics = {
    cpu: {
      usage: 45.2,
      cores: 8,
      temperature: 52
    },
    memory: {
      total: 16384,
      used: 8192,
      available: 8192,
      usage: 50
    },
    disk: {
      total: 1000000,
      used: 650000,
      available: 350000,
      usage: 65
    },
    network: {
      incoming: 12.5,
      outgoing: 8.3,
      latency: 45
    },
    uptime: '15d 4h 23m',
    loadAverage: [1.2, 1.1, 1.0]
  };

  const mockServices: ServiceStatus[] = [
    {
      name: 'Web Server',
      status: 'healthy',
      responseTime: 45,
      lastCheck: '2024-01-15T10:30:00Z',
      uptime: '15d 4h 23m',
      description: 'Main web application server'
    },
    {
      name: 'Database',
      status: 'healthy',
      responseTime: 12,
      lastCheck: '2024-01-15T10:30:00Z',
      uptime: '15d 4h 23m',
      description: 'Primary database server'
    },
    {
      name: 'Redis Cache',
      status: 'healthy',
      responseTime: 2,
      lastCheck: '2024-01-15T10:30:00Z',
      uptime: '15d 4h 23m',
      description: 'In-memory cache server'
    },
    {
      name: 'Email Service',
      status: 'warning',
      responseTime: 1200,
      lastCheck: '2024-01-15T10:29:00Z',
      uptime: '14d 22h 45m',
      description: 'Email delivery service'
    },
    {
      name: 'Payment Gateway',
      status: 'healthy',
      responseTime: 180,
      lastCheck: '2024-01-15T10:30:00Z',
      uptime: '15d 4h 23m',
      description: 'Payment processing service'
    },
    {
      name: 'File Storage',
      status: 'healthy',
      responseTime: 85,
      lastCheck: '2024-01-15T10:30:00Z',
      uptime: '15d 4h 23m',
      description: 'File storage and CDN service'
    }
  ];

  const mockStats: HealthStats = {
    overallHealth: 'good',
    uptime: '15d 4h 23m',
    responseTime: 145,
    errorRate: 0.12,
    activeUsers: 1247,
    databaseConnections: 45,
    cacheHitRate: 94.5,
    queueLength: 12
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMetrics(mockMetrics);
      setServices(mockServices);
      setStats(mockStats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch system health data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (uptime: string) => {
    return uptime;
  };

  const handleExportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      stats,
      metrics,
      services
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-health-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Exported",
      description: "System health report has been exported successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600 mt-2">Monitor system performance, services, and infrastructure health</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" onClick={fetchHealthData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Health Status */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Overall System Health
            </CardTitle>
            <CardDescription>
              Current system status and key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getHealthColor(stats.overallHealth)}`}>
                  {stats.overallHealth.charAt(0).toUpperCase() + stats.overallHealth.slice(1)}
                </div>
                <p className="text-sm text-gray-600">Overall Health</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.uptime}</div>
                <p className="text-sm text-gray-600">System Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.responseTime}ms</div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.activeUsers}</div>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.errorRate.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database Connections</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.databaseConnections}</div>
                <p className="text-xs text-muted-foreground">
                  Active connections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.cacheHitRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Cache efficiency
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Queue Length</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.queueLength}</div>
                <p className="text-xs text-muted-foreground">
                  Pending jobs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Resources */}
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    CPU Usage
                  </CardTitle>
                  <CardDescription>
                    Processor utilization and performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-gray-600">{metrics.cpu.usage.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.cpu.usage} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Cores:</span>
                      <span className="ml-2 font-medium">{metrics.cpu.cores}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Temperature:</span>
                      <span className="ml-2 font-medium">{metrics.cpu.temperature}°C</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Load Average:</span>
                    <span className="ml-2 font-medium">
                      {metrics.loadAverage.map((load, index) => (
                        <span key={index}>{load.toFixed(2)}{index < metrics.loadAverage.length - 1 ? ', ' : ''}</span>
                      ))}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MemoryStick className="w-5 h-5" />
                    Memory Usage
                  </CardTitle>
                  <CardDescription>
                    RAM utilization and availability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-gray-600">{metrics.memory.usage.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.memory.usage} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="ml-2 font-medium">{formatBytes(metrics.memory.total)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Used:</span>
                      <span className="ml-2 font-medium">{formatBytes(metrics.memory.used)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <span className="ml-2 font-medium">{formatBytes(metrics.memory.available)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5" />
                    Disk Usage
                  </CardTitle>
                  <CardDescription>
                    Storage utilization and capacity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className="text-sm text-gray-600">{metrics.disk.usage.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.disk.usage} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="ml-2 font-medium">{formatBytes(metrics.disk.total)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Used:</span>
                      <span className="ml-2 font-medium">{formatBytes(metrics.disk.used)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <span className="ml-2 font-medium">{formatBytes(metrics.disk.available)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="w-5 h-5" />
                    Network
                  </CardTitle>
                  <CardDescription>
                    Network traffic and latency
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Incoming:</span>
                      <span className="ml-2 font-medium">{metrics.network.incoming} Mbps</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Outgoing:</span>
                      <span className="ml-2 font-medium">{metrics.network.outgoing} Mbps</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Latency:</span>
                      <span className="ml-2 font-medium">{metrics.network.latency}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Uptime:</span>
                      <span className="ml-2 font-medium">{metrics.uptime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Service Status
              </CardTitle>
              <CardDescription>
                Health status of all system services and components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(service.status)}
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">{service.description}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{service.responseTime}ms</div>
                        <div className="text-xs text-gray-500">Response time</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{service.uptime}</div>
                        <div className="text-xs text-gray-500">Uptime</div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Detailed performance metrics and historical data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performance Charts</h3>
                <p className="text-gray-600">
                  Advanced performance metrics and historical charts would be displayed here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                System Alerts
              </CardTitle>
              <CardDescription>
                Current system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Email Service Warning</AlertTitle>
                  <AlertDescription>
                    Email service response time is elevated (1200ms). Please investigate.
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4" />
                  <AlertTitle>High Memory Usage</AlertTitle>
                  <AlertDescription>
                    Memory usage is at 65%. Consider monitoring closely.
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>All Systems Operational</AlertTitle>
                  <AlertDescription>
                    All core services are running normally.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}