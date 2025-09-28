"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  Cell, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Area,
  AreaChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  Zap,
  Globe,
  Clock,
  DollarSign,
  FileText,
  Calendar
} from 'lucide-react';

// Mock analytics data
const userActivity = [
  { date: '2024-01-01', activeUsers: 1200, pageViews: 5600, sessions: 2100, bounceRate: 42 },
  { date: '2024-01-02', activeUsers: 1350, pageViews: 6200, sessions: 2400, bounceRate: 38 },
  { date: '2024-01-03', activeUsers: 1180, pageViews: 5400, sessions: 2000, bounceRate: 45 },
  { date: '2024-01-04', activeUsers: 1420, pageViews: 6800, sessions: 2600, bounceRate: 35 },
  { date: '2024-01-05', activeUsers: 1580, pageViews: 7200, sessions: 2800, bounceRate: 32 },
  { date: '2024-01-06', activeUsers: 1650, pageViews: 7800, sessions: 3000, bounceRate: 30 },
  { date: '2024-01-07', activeUsers: 1720, pageViews: 8200, sessions: 3200, bounceRate: 28 }
];

const trafficSources = [
  { name: 'Direct', value: 35, color: '#8884d8' },
  { name: 'Organic Search', value: 28, color: '#82ca9d' },
  { name: 'Social Media', value: 20, color: '#ffc658' },
  { name: 'Referral', value: 12, color: '#ff7300' },
  { name: 'Email', value: 5, color: '#8dd1e1' }
];

const pagePerformance = [
  { page: '/dashboard', views: 15420, avgTime: 245, bounceRate: 25 },
  { page: '/projects', views: 8750, avgTime: 180, bounceRate: 32 },
  { page: '/clients', views: 6540, avgTime: 195, bounceRate: 28 },
  { page: '/invoices', views: 4320, avgTime: 220, bounceRate: 35 },
  { page: '/photos', views: 3890, avgTime: 310, bounceRate: 22 }
];

const userDemographics = [
  { age: '18-24', users: 1250, percentage: 18 },
  { age: '25-34', users: 2800, percentage: 40 },
  { age: '35-44', users: 1950, percentage: 28 },
  { age: '45-54', users: 875, percentage: 12 },
  { age: '55+', users: 125, percentage: 2 }
];

const deviceStats = [
  { device: 'Desktop', users: 4200, percentage: 60, sessions: 8900 },
  { device: 'Mobile', users: 2450, percentage: 35, sessions: 5200 },
  { device: 'Tablet', users: 350, percentage: 5, sessions: 750 }
];

const conversionFunnel = [
  { stage: 'Visitors', value: 10000, dropoff: 0 },
  { stage: 'Sign-ups', value: 2500, dropoff: 75 },
  { stage: 'Active Users', value: 1800, dropoff: 28 },
  { stage: 'Paying Customers', value: 450, dropoff: 75 },
  { stage: 'Repeat Customers', value: 180, dropoff: 60 }
];

const analyticsMetrics = {
  totalUsers: 7000,
  activeUsers: 1720,
  pageViews: 8200,
  sessions: 3200,
  bounceRate: 28,
  avgSessionDuration: 245,
  conversionRate: 6.4,
  revenuePerUser: 89
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('users');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Business intelligence and user insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1day">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{analyticsMetrics.totalUsers.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  +12.5%
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{analyticsMetrics.activeUsers.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  +8.3%
                </div>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">{analyticsMetrics.pageViews.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  +15.2%
                </div>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analyticsMetrics.conversionRate}%</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  +2.1%
                </div>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Daily active users and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userActivity}>
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="activeUsers" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="pageViews" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your users are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Page Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Page Performance</CardTitle>
          <CardDescription>Top pages by views and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pagePerformance} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="page" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="views" fill="#8884d8" />
                <Bar dataKey="avgTime" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* User Demographics and Device Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
            <CardDescription>Age distribution of your users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userDemographics.map((demo) => (
                <div key={demo.age} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{demo.age}</span>
                    <span className="text-sm text-muted-foreground">
                      {demo.users.toLocaleString()} users ({demo.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${demo.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Statistics</CardTitle>
            <CardDescription>User device preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceStats.map((device) => (
                <div key={device.device} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{device.device}</span>
                    <span className="text-sm text-muted-foreground">
                      {device.users.toLocaleString()} users ({device.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {device.sessions.toLocaleString()} sessions
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey from visitor to customer</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionFunnel}>
                <XAxis dataKey="stage" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="grid grid-cols-5 gap-4 mt-4 text-center">
            {conversionFunnel.map((stage, index) => (
              <div key={stage.stage} className="space-y-1">
                <p className="text-sm font-medium">{stage.stage}</p>
                <p className="text-lg font-bold">{stage.value.toLocaleString()}</p>
                {stage.dropoff > 0 && (
                  <p className="text-xs text-red-600">
                    -{stage.dropoff}% dropoff
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}