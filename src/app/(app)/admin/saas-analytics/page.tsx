"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  Database,
  CreditCard,
  UserCheck,
  UserX,
  Clock,
  Star,
  Award,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: any;
  description: string;
}

interface RevenueData {
  month: string;
  revenue: number;
  subscriptions: number;
  churn: number;
}

interface PlanPerformance {
  planName: string;
  subscribers: number;
  revenue: number;
  growth: number;
  churnRate: number;
}

interface CohortData {
  cohort: string;
  month1: number;
  month3: number;
  month6: number;
  month12: number;
}

interface TopFeature {
  name: string;
  usage: number;
  satisfaction: number;
  category: string;
}

export default function SaaSAnalytics() {
  const router = useRouter();
  const { user, appUser, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('30d');
  const [loadingData, setLoadingData] = useState(true);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [planPerformance, setPlanPerformance] = useState<PlanPerformance[]>([]);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [topFeatures, setTopFeatures] = useState<TopFeature[]>([]);

  // Mock data for demonstration
  const mockMetrics: MetricCard[] = [
    {
      title: 'Monthly Recurring Revenue',
      value: '$124,500',
      change: 12.5,
      changeType: 'increase',
      icon: DollarSign,
      description: 'vs last month'
    },
    {
      title: 'Active Subscribers',
      value: '5,647',
      change: 8.2,
      changeType: 'increase',
      icon: Users,
      description: 'vs last month'
    },
    {
      title: 'Customer Lifetime Value',
      value: '$1,247',
      change: -2.1,
      changeType: 'decrease',
      icon: Target,
      description: 'vs last month'
    },
    {
      title: 'Churn Rate',
      value: '3.2%',
      change: -0.8,
      changeType: 'increase',
      icon: TrendingDown,
      description: 'vs last month'
    },
    {
      title: 'Average Revenue Per User',
      value: '$22.04',
      change: 3.7,
      changeType: 'increase',
      icon: BarChart3,
      description: 'vs last month'
    },
    {
      title: 'Conversion Rate',
      value: '4.8%',
      change: 1.2,
      changeType: 'increase',
      icon: Zap,
      description: 'vs last month'
    }
  ];

  const mockRevenueData: RevenueData[] = [
    { month: 'Jan', revenue: 95000, subscriptions: 4800, churn: 4.2 },
    { month: 'Feb', revenue: 102000, subscriptions: 5100, churn: 3.8 },
    { month: 'Mar', revenue: 108000, subscriptions: 5300, churn: 3.5 },
    { month: 'Apr', revenue: 115000, subscriptions: 5500, churn: 3.2 },
    { month: 'May', revenue: 118000, subscriptions: 5600, churn: 3.0 },
    { month: 'Jun', revenue: 124500, subscriptions: 5647, churn: 3.2 }
  ];

  const mockPlanPerformance: PlanPerformance[] = [
    { planName: 'Starter', subscribers: 3200, revenue: 92800, growth: 5.2, churnRate: 4.1 },
    { planName: 'Professional', subscribers: 1800, revenue: 142200, growth: 12.8, churnRate: 2.3 },
    { planName: 'Enterprise', subscribers: 247, revenue: 73853, growth: 18.5, churnRate: 1.2 },
    { planName: 'Free Trial', subscribers: 400, revenue: 0, growth: -2.1, churnRate: 15.3 }
  ];

  const mockCohortData: CohortData[] = [
    { cohort: 'Jan 2024', month1: 100, month3: 85, month6: 72, month12: 65 },
    { cohort: 'Feb 2024', month1: 100, month3: 87, month6: 75, month12: 0 },
    { cohort: 'Mar 2024', month1: 100, month3: 89, month6: 78, month12: 0 },
    { cohort: 'Apr 2024', month1: 100, month3: 91, month6: 0, month12: 0 },
    { cohort: 'May 2024', month1: 100, month3: 93, month6: 0, month12: 0 },
    { cohort: 'Jun 2024', month1: 100, month3: 0, month6: 0, month12: 0 }
  ];

  const mockTopFeatures: TopFeature[] = [
    { name: 'API Access', usage: 87, satisfaction: 92, category: 'API' },
    { name: 'Advanced Analytics', usage: 78, satisfaction: 88, category: 'Analytics' },
    { name: 'Priority Support', usage: 65, satisfaction: 95, category: 'Support' },
    { name: 'Custom Integrations', usage: 45, satisfaction: 82, category: 'Integrations' },
    { name: 'White Label', usage: 23, satisfaction: 76, category: 'Customization' }
  ];

  useEffect(() => {
    if (loading) return;
    
    if (!user || appUser?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setMetrics(mockMetrics);
      setRevenueData(mockRevenueData);
      setPlanPerformance(mockPlanPerformance);
      setCohortData(mockCohortData);
      setTopFeatures(mockTopFeatures);
      setLoadingData(false);
    }, 1500);
  }, [user, appUser, loading, router]);

  const handleExport = (format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting analytics data as ${format.toUpperCase()}`,
    });
  };

  const handleRefresh = () => {
    setLoadingData(true);
    setTimeout(() => {
      setLoadingData(false);
      toast({
        title: "Data Refreshed",
        description: "Analytics data has been updated",
      });
    }, 1000);
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SAAS Analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || appUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access SAAS analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SAAS Analytics</h1>
              <p className="text-gray-600 mt-2">Comprehensive SAAS metrics and business insights</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  {metric.changeType === 'increase' ? (
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                  )}
                  <span className={metric.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(metric.change)}%
                  </span>
                  <span className="text-muted-foreground">{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="plans">Plan Performance</TabsTrigger>
            <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
            <TabsTrigger value="features">Feature Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly recurring revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{data.month}</p>
                            <p className="text-sm text-gray-500">{data.subscriptions} subscribers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${data.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{data.churn}% churn</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Insights</CardTitle>
                  <CardDescription>Key revenue metrics and trends</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Revenue Growth</span>
                    </div>
                    <p className="text-sm text-green-700">
                      31% growth over the last 6 months with consistent upward trend
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Churn Alert</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Churn rate increased slightly this month. Monitor customer satisfaction.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">ARPU Improvement</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Average revenue per user increased by 3.7% this month
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Performance</CardTitle>
                  <CardDescription>Subscription plan metrics and growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {planPerformance.map((plan, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{plan.planName}</h4>
                          <Badge variant={plan.growth > 0 ? "default" : "secondary"}>
                            {plan.growth > 0 ? '+' : ''}{plan.growth}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Subscribers</p>
                            <p className="font-medium">{plan.subscribers.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Revenue</p>
                            <p className="font-medium">${plan.revenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Churn Rate</p>
                            <p className={`font-medium ${plan.churnRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                              {plan.churnRate}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plan Distribution</CardTitle>
                  <CardDescription>Subscriber distribution across plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {planPerformance.map((plan, index) => {
                      const totalSubscribers = planPerformance.reduce((sum, p) => sum + p.subscribers, 0);
                      const percentage = (plan.subscribers / totalSubscribers) * 100;
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{plan.planName}</span>
                            <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cohorts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cohort Retention</CardTitle>
                  <CardDescription>Customer retention by signup cohort</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Cohort</th>
                          <th className="text-center p-2">Month 1</th>
                          <th className="text-center p-2">Month 3</th>
                          <th className="text-center p-2">Month 6</th>
                          <th className="text-center p-2">Month 12</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cohortData.map((cohort, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{cohort.cohort}</td>
                            <td className="p-2 text-center">
                              <Badge variant="outline">{cohort.month1}%</Badge>
                            </td>
                            <td className="p-2 text-center">
                              {cohort.month3 ? (
                                <Badge variant="outline">{cohort.month3}%</Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {cohort.month6 ? (
                                <Badge variant="outline">{cohort.month6}%</Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {cohort.month12 ? (
                                <Badge variant="outline">{cohort.month12}%</Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retention Insights</CardTitle>
                  <CardDescription>Key findings from cohort analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Strong Retention</span>
                    </div>
                    <p className="text-sm text-green-700">
                      65% of customers from January cohort still active after 12 months
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Improving Trend</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Recent cohorts show better 3-month retention rates
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Best Performing</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Enterprise customers show 92% retention after 3 months
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Features by Usage</CardTitle>
                  <CardDescription>Most used features and satisfaction rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topFeatures.map((feature, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{feature.name}</h4>
                          <Badge variant="outline">{feature.category}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Usage Rate</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${feature.usage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{feature.usage}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Satisfaction</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${feature.satisfaction}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{feature.satisfaction}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Insights</CardTitle>
                  <CardDescription>Key findings from feature usage analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">High Satisfaction</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Priority support has 95% satisfaction rate - excellent for retention
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Underutilized</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      White label feature has low usage (23%) - consider better onboarding
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">High Value</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      API access drives enterprise adoption with 87% usage rate
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}