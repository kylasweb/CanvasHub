'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Pause,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Star,
  Crown,
  Zap,
  Database,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Subscription {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  planId: string
  planName: string
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'past_due'
  billingCycle: 'monthly' | 'quarterly' | 'annual'
  amount: number
  currency: string
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  cancelledAt?: string
  pausedAt?: string
  createdAt: string
  updatedAt: string
  metadata: Record<string, any>
}

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  billingCycle: 'monthly' | 'quarterly' | 'annual'
  features: string[]
  isActive: boolean
  isPopular: boolean
  maxProjects?: number
  maxUsers?: number
  storageLimit?: number
  prioritySupport: boolean
  customDomain: boolean
  analytics: boolean
  apiAccess: boolean
}

interface SubscriptionStats {
  totalSubscriptions: number
  activeSubscriptions: number
  pausedSubscriptions: number
  cancelledSubscriptions: number
  monthlyRecurringRevenue: number
  annualRecurringRevenue: number
  averageRevenuePerUser: number
  churnRate: number
  subscriptionsByPlan: Array<{
    planName: string
    count: number
    revenue: number
  }>
  subscriptionsByStatus: {
    active: number
    paused: number
    cancelled: number
    expired: number
    past_due: number
  }
  newSubscriptions: Array<{
    date: string
    count: number
    revenue: number
  }>
  churnedSubscriptions: Array<{
    date: string
    count: number
    reason: string
  }>
}

const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for individuals and small projects',
    price: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    features: ['Up to 5 projects', '10GB storage', 'Basic analytics', 'Email support'],
    isActive: true,
    isPopular: false,
    maxProjects: 5,
    maxUsers: 1,
    storageLimit: 10,
    prioritySupport: false,
    customDomain: false,
    analytics: true,
    apiAccess: false
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Ideal for growing businesses and teams',
    price: 29.99,
    currency: 'USD',
    billingCycle: 'monthly',
    features: ['Up to 25 projects', '100GB storage', 'Advanced analytics', 'Priority support', 'Custom domain'],
    isActive: true,
    isPopular: true,
    maxProjects: 25,
    maxUsers: 5,
    storageLimit: 100,
    prioritySupport: true,
    customDomain: true,
    analytics: true,
    apiAccess: true
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Comprehensive solution for large organizations',
    price: 99.99,
    currency: 'USD',
    billingCycle: 'monthly',
    features: ['Unlimited projects', '1TB storage', 'Advanced analytics', '24/7 phone support', 'Custom domain', 'API access', 'White-label options'],
    isActive: true,
    isPopular: false,
    maxProjects: -1,
    maxUsers: -1,
    storageLimit: 1000,
    prioritySupport: true,
    customDomain: true,
    analytics: true,
    apiAccess: true
  }
]

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_1',
    customerId: 'cust_1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    planId: 'pro',
    planName: 'Professional',
    status: 'active',
    billingCycle: 'monthly',
    amount: 29.99,
    currency: 'USD',
    currentPeriodStart: '2024-01-01T00:00:00Z',
    currentPeriodEnd: '2024-02-01T00:00:00Z',
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    metadata: { signup_source: 'web' }
  },
  {
    id: 'sub_2',
    customerId: 'cust_2',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    planId: 'business',
    planName: 'Business',
    status: 'active',
    billingCycle: 'annual',
    amount: 1199.88,
    currency: 'USD',
    currentPeriodStart: '2024-01-15T00:00:00Z',
    currentPeriodEnd: '2025-01-15T00:00:00Z',
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    metadata: { signup_source: 'sales' }
  },
  {
    id: 'sub_3',
    customerId: 'cust_3',
    customerName: 'Mike Johnson',
    customerEmail: 'mike@example.com',
    planId: 'basic',
    planName: 'Basic',
    status: 'paused',
    billingCycle: 'monthly',
    amount: 9.99,
    currency: 'USD',
    currentPeriodStart: '2024-01-01T00:00:00Z',
    currentPeriodEnd: '2024-02-01T00:00:00Z',
    pausedAt: '2024-01-10T00:00:00Z',
    createdAt: '2023-11-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    metadata: { signup_source: 'web' }
  },
  {
    id: 'sub_4',
    customerId: 'cust_4',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah@example.com',
    planId: 'pro',
    planName: 'Professional',
    status: 'cancelled',
    billingCycle: 'monthly',
    amount: 29.99,
    currency: 'USD',
    currentPeriodStart: '2024-01-01T00:00:00Z',
    currentPeriodEnd: '2024-02-01T00:00:00Z',
    cancelledAt: '2024-01-20T00:00:00Z',
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
    metadata: { signup_source: 'referral' }
  },
  {
    id: 'sub_5',
    customerId: 'cust_5',
    customerName: 'Tom Brown',
    customerEmail: 'tom@example.com',
    planId: 'basic',
    planName: 'Basic',
    status: 'active',
    billingCycle: 'monthly',
    amount: 9.99,
    currency: 'USD',
    currentPeriodStart: '2024-01-25T00:00:00Z',
    currentPeriodEnd: '2024-02-25T00:00:00Z',
    trialEnd: '2024-02-25T00:00:00Z',
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
    metadata: { signup_source: 'trial' }
  }
]

const mockStats: SubscriptionStats = {
  totalSubscriptions: 1542,
  activeSubscriptions: 1234,
  pausedSubscriptions: 89,
  cancelledSubscriptions: 156,
  monthlyRecurringRevenue: 45670,
  annualRecurringRevenue: 548040,
  averageRevenuePerUser: 37.89,
  churnRate: 2.3,
  subscriptionsByPlan: [
    { planName: 'Basic', count: 678, revenue: 6773.22 },
    { planName: 'Professional', count: 654, revenue: 19613.46 },
    { planName: 'Business', count: 210, revenue: 20997.90 }
  ],
  subscriptionsByStatus: {
    active: 1234,
    paused: 89,
    cancelled: 156,
    expired: 45,
    past_due: 18
  },
  newSubscriptions: [
    { date: '2024-01-01', count: 45, revenue: 1234.56 },
    { date: '2024-01-02', count: 52, revenue: 1456.78 },
    { date: '2024-01-03', count: 38, revenue: 987.65 },
    { date: '2024-01-04', count: 61, revenue: 1678.90 },
    { date: '2024-01-05', count: 55, revenue: 1432.11 }
  ],
  churnedSubscriptions: [
    { date: '2024-01-01', count: 3, reason: 'cost' },
    { date: '2024-01-02', count: 2, reason: 'not_using' },
    { date: '2024-01-03', count: 4, reason: 'switched_competitor' },
    { date: '2024-01-04', count: 1, reason: 'technical_issues' },
    { date: '2024-01-05', count: 2, reason: 'cost' }
  ]
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions)
  const [plans] = useState<SubscriptionPlan[]>(mockSubscriptionPlans)
  const [stats] = useState<SubscriptionStats>(mockStats)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = searchTerm === '' || 
      subscription.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.planName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter
    const matchesPlan = planFilter === 'all' || subscription.planId === planFilter
    
    return matchesSearch && matchesStatus && matchesPlan
  })

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      case 'past_due':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'expired':
        return <Clock className="w-4 h-4 text-gray-500" />
      case 'past_due':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic':
        return <Star className="w-4 h-4" />
      case 'pro':
        return <Zap className="w-4 h-4" />
      case 'business':
        return <Crown className="w-4 h-4" />
      default:
        return <Database className="w-4 h-4" />
    }
  }

  const handleToggleStatus = (subscriptionId: string, newStatus: string) => {
    setSubscriptions(prev => prev.map(sub =>
      sub.id === subscriptionId
        ? { 
            ...sub, 
            status: newStatus as any,
            updatedAt: new Date().toISOString(),
            pausedAt: newStatus === 'paused' ? new Date().toISOString() : undefined,
            cancelledAt: newStatus === 'cancelled' ? new Date().toISOString() : undefined
          }
        : sub
    ))
    toast.success(`Subscription ${newStatus} successfully!`)
  }

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Subscriptions Management</h1>
            <p className="text-muted-foreground">
              Manage subscription plans and customer subscriptions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.totalSubscriptions)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(stats.activeSubscriptions)} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly MRR</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRecurringRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.annualRecurringRevenue)} annual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average ARPU</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.averageRevenuePerUser)}</div>
                <p className="text-xs text-muted-foreground">
                  Per user monthly
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.churnRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Monthly churn
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Plan</CardTitle>
              <CardDescription>
                Monthly recurring revenue by subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.subscriptionsByPlan.map((plan) => (
                  <div key={plan.planName} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(plan.planName.toLowerCase())}
                      <span>{plan.planName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(plan.revenue)}</span>
                      <span className="text-sm text-muted-foreground">({formatNumber(plan.count)} subs)</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(plan.revenue / stats.monthlyRecurringRevenue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New vs Churned Subscriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>New Subscriptions</CardTitle>
                <CardDescription>
                  Daily new subscription signups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.newSubscriptions.slice(0, 5).map((data) => (
                    <div key={data.date} className="flex items-center justify-between">
                      <span>{new Date(data.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{data.count}</span>
                        <span className="text-sm text-green-600">{formatCurrency(data.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churned Subscriptions</CardTitle>
                <CardDescription>
                  Daily subscription cancellations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.churnedSubscriptions.slice(0, 5).map((data) => (
                    <div key={data.date} className="flex items-center justify-between">
                      <span>{new Date(data.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{data.count}</span>
                        <span className="text-sm text-red-600">{data.reason.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search subscriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="past_due">Past Due</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="plan">Plan</Label>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      {plans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subscription.customerName}</div>
                          <div className="text-sm text-muted-foreground">{subscription.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPlanIcon(subscription.planId)}
                          <span>{subscription.planName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(subscription.amount, subscription.currency)}</div>
                        <div className="text-sm text-muted-foreground capitalize">{subscription.billingCycle}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {subscription.billingCycle}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(subscription.status)}
                          <Badge className={getStatusColor(subscription.status)}>
                            {subscription.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {subscription.status === 'cancelled' ? '-' : new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {subscription.status === 'active' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggleStatus(subscription.id, 'paused')}
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                          {subscription.status === 'paused' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggleStatus(subscription.id, 'active')}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>
                Manage available subscription plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className="relative">
                    {plan.isPopular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-orange-500 text-white">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {getPlanIcon(plan.id)}
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                        <span className="text-muted-foreground">/{plan.billingCycle}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <strong>Features:</strong>
                          <ul className="mt-2 space-y-1">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center justify-between pt-4">
                          <Switch checked={plan.isActive} />
                          <span className="text-sm text-muted-foreground">
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Status</CardTitle>
                <CardDescription>
                  Current status distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.subscriptionsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatNumber(count)}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / stats.totalSubscriptions) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>
                  Subscription performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Subscriptions</span>
                    <Badge variant="secondary">{formatNumber(stats.totalSubscriptions)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Rate</span>
                    <Badge className="bg-green-100 text-green-800">
                      {((stats.activeSubscriptions / stats.totalSubscriptions) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Monthly MRR</span>
                    <Badge variant="secondary">{formatCurrency(stats.monthlyRecurringRevenue)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Churn Rate</span>
                    <Badge className="bg-red-100 text-red-800">{stats.churnRate}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}