"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  Line, 
  LineChart, 
  Area, 
  AreaChart,
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Bar,
  BarChart
} from 'recharts';
import { 
  Zap, 
  Server, 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { usePerformance } from '@/lib/performance';

// Mock performance data
const systemMetrics = [
  { time: '00:00', cpu: 25, memory: 45, disk: 32, network: 150 },
  { time: '04:00', cpu: 18, memory: 42, disk: 30, network: 120 },
  { time: '08:00', cpu: 65, memory: 68, disk: 45, network: 450 },
  { time: '12:00', cpu: 78, memory: 72, disk: 48, network: 680 },
  { time: '16:00', cpu: 82, memory: 75, disk: 52, network: 720 },
  { time: '20:00', cpu: 45, memory: 55, disk: 38, network: 320 },
  { time: '24:00', cpu: 30, memory: 48, disk: 35, network: 180 }
];

const responseTimeData = [
  { time: '00:00', avg: 120, p95: 280, p99: 450 },
  { time: '04:00', avg: 95, p95: 220, p99: 380 },
  { time: '08:00', avg: 180, p95: 420, p99: 680 },
  { time: '12:00', avg: 220, p95: 520, p99: 890 },
  { time: '16:00', avg: 250, p95: 580, p99: 950 },
  { time: '20:00', avg: 160, p95: 380, p99: 620 },
  { time: '24:00', avg: 110, p95: 260, p99: 420 }
];

const errorRates = [
  { time: '00:00', errors: 0.2, warnings: 1.2 },
  { time: '04:00', errors: 0.1, warnings: 0.8 },
  { time: '08:00', errors: 0.8, warnings: 2.5 },
  { time: '12:00', errors: 1.2, warnings: 3.8 },
  { time: '16:00', errors: 1.5, warnings: 4.2 },
  { time: '20:00', errors: 0.6, warnings: 2.1 },
  { time: '24:00', errors: 0.3, warnings: 1.5 }
];

const healthChecks = [
  { name: 'Database', status: 'healthy', responseTime: 12, lastCheck: '2 minutes ago' },
  { name: 'API Server', status: 'healthy', responseTime: 45, lastCheck: '1 minute ago' },
  { name: 'Cache Server', status: 'warning', responseTime: 180, lastCheck: '3 minutes ago' },
  { name: 'File Storage', status: 'healthy', responseTime: 25, lastCheck: '2 minutes ago' },
  { name: 'Email Service', status: 'healthy', responseTime: 85, lastCheck: '5 minutes ago' }
];

const recentAlerts = [
  { id: 1, type: 'warning', message: 'High memory usage detected', time: '5 minutes ago', resolved: false },
  { id: 2, type: 'error', message: 'Database connection timeout', time: '15 minutes ago', resolved: true },
  { id: 3, type: 'info', message: 'Scheduled maintenance completed', time: '1 hour ago', resolved: true },
  { id: 4, type: 'warning', message: 'Slow API response times', time: '2 hours ago', resolved: true }
];

export default function Performance() {
  const [systemStatus, setSystemStatus] = useState({
    cpu: 23,
    memory: 45,
    disk: 38,
    network: 280,
    uptime: '15d 4h 32m',
    load: [0.8, 1.2, 0.9]
  });
  
  const { metrics, measure, measureAsync } = usePerformance();

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(85, prev.memory + (Math.random() - 0.5) * 8)),
        disk: Math.max(25, Math.min(75, prev.disk + (Math.random() - 0.5) * 5)),
        network: Math.max(100, Math.min(1000, prev.network + (Math.random() - 0.5) * 100))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
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

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'warning': return <Badge variant="outline">Warning</Badge>;
      case 'info': return <Badge variant="secondary">Info</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system performance metrics and optimization insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CPU Usage</p>
                <p className="text-2xl font-bold">{systemStatus.cpu}%</p>
                <Progress value={systemStatus.cpu} className="mt-2 h-2" />
              </div>
              <Cpu className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Memory</p>
                <p className="text-2xl font-bold">{systemStatus.memory}%</p>
                <Progress value={systemStatus.memory} className="mt-2 h-2" />
              </div>
              <HardDrive className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disk Usage</p>
                <p className="text-2xl font-bold">{systemStatus.disk}%</p>
                <Progress value={systemStatus.disk} className="mt-2 h-2" />
              </div>
              <Server className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Network</p>
                <p className="text-2xl font-bold">{systemStatus.network} Mbps</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  Stable
                </div>
              </div>
              <Wifi className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-lg font-bold">{systemStatus.uptime}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  Online
                </div>
              </div>
              <Activity className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Resource Usage</CardTitle>
            <CardDescription>CPU, Memory, and Disk utilization over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={systemMetrics}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="cpu" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="memory" 
                    stackId="2" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="disk" 
                    stackId="3" 
                    stroke="#ffc658" 
                    fill="#ffc658" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Times</CardTitle>
            <CardDescription>API response time percentiles</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="avg" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="p95" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="p99" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Error Rates and Health Checks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Rates</CardTitle>
            <CardDescription>System errors and warnings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={errorRates}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="errors" fill="#ef4444" />
                  <Bar dataKey="warnings" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Checks</CardTitle>
            <CardDescription>Service health and availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthChecks.map((check) => (
                <div key={check.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={getStatusColor(check.status)}>
                      {getStatusIcon(check.status)}
                    </div>
                    <div>
                      <p className="font-medium">{check.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {check.responseTime}ms • {check.lastCheck}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={check.status === 'healthy' ? 'default' : check.status === 'warning' ? 'outline' : 'destructive'}
                  >
                    {check.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>System alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getAlertBadge(alert.type)}
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
                {alert.resolved ? (
                  <Badge variant="outline" className="text-green-600">
                    Resolved
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Active
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}