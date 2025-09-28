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
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  FileText,
  Target
} from 'lucide-react';

// Mock revenue data
const monthlyRevenue = [
  { month: 'Jan', revenue: 45000, profit: 18000, invoices: 15, clients: 12 },
  { month: 'Feb', revenue: 52000, profit: 20800, invoices: 18, clients: 14 },
  { month: 'Mar', revenue: 48000, profit: 19200, invoices: 16, clients: 13 },
  { month: 'Apr', revenue: 61000, profit: 24400, invoices: 22, clients: 16 },
  { month: 'May', revenue: 55000, profit: 22000, invoices: 19, clients: 15 },
  { month: 'Jun', revenue: 67000, profit: 26800, invoices: 25, clients: 18 },
];

const revenueByService = [
  { name: 'Web Design', value: 125000, color: '#8884d8' },
  { name: 'Development', value: 98000, color: '#82ca9d' },
  { name: 'Photography', value: 76000, color: '#ffc658' },
  { name: 'Consulting', value: 45000, color: '#ff7300' },
  { name: 'Other', value: 32000, color: '#8dd1e1' }
];

const clientSegments = [
  { name: 'Enterprise', value: 180000, clients: 8, avgInvoice: 22500 },
  { name: 'Mid-Market', value: 145000, clients: 15, avgInvoice: 9667 },
  { name: 'Small Business', value: 98000, clients: 28, avgInvoice: 3500 },
  { name: 'Startup', value: 45000, clients: 12, avgInvoice: 3750 }
];

const topClients = [
  { name: 'Acme Corp', revenue: 67000, invoices: 8, growth: 15 },
  { name: 'Tech Solutions', revenue: 45000, invoices: 6, growth: 8 },
  { name: 'Global Industries', revenue: 38000, invoices: 5, growth: 22 },
  { name: 'Startup Inc', revenue: 32000, invoices: 4, growth: -5 },
  { name: 'Digital Agency', revenue: 28000, invoices: 3, growth: 12 }
];

const revenueMetrics = {
  totalRevenue: 468000,
  totalProfit: 187200,
  profitMargin: 40,
  avgInvoiceValue: 3120,
  recurringRevenue: 125000,
  growthRate: 12.5
};

export default function Revenue() {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">
            Financial performance and revenue insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${revenueMetrics.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  +{revenueMetrics.growthRate}%
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold">${revenueMetrics.totalProfit.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  +{revenueMetrics.growthRate}%
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">{revenueMetrics.profitMargin}%</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  +2.1%
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Invoice</p>
                <p className="text-2xl font-bold">${revenueMetrics.avgInvoiceValue.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <ArrowDownRight className="w-3 h-3" />
                  -3.2%
                </div>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recurring</p>
                <p className="text-2xl font-bold">${revenueMetrics.recurringRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  +8.7%
                </div>
              </div>
              <Calendar className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">63</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  +12%
                </div>
              </div>
              <Users className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue and profit over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenue}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stackId="2" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service</CardTitle>
            <CardDescription>Breakdown of revenue by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByService}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {revenueByService.map((entry, index) => (
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

      {/* Client Segments and Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Segments</CardTitle>
            <CardDescription>Revenue distribution by client segment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientSegments.map((segment, index) => (
                <div key={segment.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{segment.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ${segment.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                    <span>{segment.clients} clients</span>
                    <span>Avg: ${segment.avgInvoice.toLocaleString()}</span>
                    <span>{((segment.value / revenueMetrics.totalRevenue) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(segment.value / revenueMetrics.totalRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
            <CardDescription>Highest revenue clients and growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{client.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {client.invoices} invoices
                        </span>
                        <Badge variant={client.growth > 0 ? "default" : "destructive"} className="text-xs">
                          {client.growth > 0 ? '+' : ''}{client.growth}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-lg font-semibold">${client.revenue.toLocaleString()}</span>
                      {client.growth > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Performance</CardTitle>
          <CardDescription>Monthly invoice volume and client acquisition</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="invoices" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Invoices"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="clients" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Clients"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}