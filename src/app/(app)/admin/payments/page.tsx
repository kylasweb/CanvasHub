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
import { Progress } from '@/components/ui/progress'
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Search,
  Filter,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw,
  Eye,
  FileText,
  Banknote,
  Smartphone,
  Globe
} from 'lucide-react'

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed'
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto'
  customerId: string
  customerName: string
  customerEmail: string
  description: string
  invoiceId?: string
  subscriptionId?: string
  createdAt: string
  processedAt?: string
  failureReason?: string
  refundAmount?: number
  metadata: Record<string, any>
}

interface PaymentStats {
  totalPayments: number
  totalRevenue: number
  successfulPayments: number
  failedPayments: number
  pendingPayments: number
  refundedPayments: number
  averagePaymentAmount: number
  revenueByMethod: {
    credit_card: number
    debit_card: number
    paypal: number
    bank_transfer: number
    crypto: number
  }
  monthlyRevenue: Array<{
    month: string
    revenue: number
    payments: number
  }>
  topCustomers: Array<{
    name: string
    email: string
    totalSpent: number
    paymentCount: number
  }>
}

const mockPayments: Payment[] = [
  {
    id: '1',
    amount: 99.99,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'credit_card',
    customerId: 'cust_1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    description: 'Monthly subscription - Pro Plan',
    invoiceId: 'inv_1',
    subscriptionId: 'sub_1',
    createdAt: '2024-01-15T10:30:00Z',
    processedAt: '2024-01-15T10:31:00Z',
    metadata: { plan: 'pro', billing_cycle: 'monthly' }
  },
  {
    id: '2',
    amount: 299.99,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'paypal',
    customerId: 'cust_2',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    description: 'Annual subscription - Business Plan',
    invoiceId: 'inv_2',
    subscriptionId: 'sub_2',
    createdAt: '2024-01-14T14:20:00Z',
    processedAt: '2024-01-14T14:22:00Z',
    metadata: { plan: 'business', billing_cycle: 'annual' }
  },
  {
    id: '3',
    amount: 49.99,
    currency: 'USD',
    status: 'failed',
    paymentMethod: 'credit_card',
    customerId: 'cust_3',
    customerName: 'Mike Johnson',
    customerEmail: 'mike@example.com',
    description: 'Monthly subscription - Basic Plan',
    invoiceId: 'inv_3',
    subscriptionId: 'sub_3',
    createdAt: '2024-01-13T09:15:00Z',
    failureReason: 'Insufficient funds',
    metadata: { plan: 'basic', billing_cycle: 'monthly' }
  },
  {
    id: '4',
    amount: 199.99,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'bank_transfer',
    customerId: 'cust_4',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah@example.com',
    description: 'Quarterly subscription - Pro Plan',
    invoiceId: 'inv_4',
    subscriptionId: 'sub_4',
    createdAt: '2024-01-12T16:45:00Z',
    metadata: { plan: 'pro', billing_cycle: 'quarterly' }
  },
  {
    id: '5',
    amount: 99.99,
    currency: 'USD',
    status: 'refunded',
    paymentMethod: 'credit_card',
    customerId: 'cust_5',
    customerName: 'Tom Brown',
    customerEmail: 'tom@example.com',
    description: 'Monthly subscription - Pro Plan',
    invoiceId: 'inv_5',
    subscriptionId: 'sub_5',
    createdAt: '2024-01-10T11:30:00Z',
    processedAt: '2024-01-10T11:31:00Z',
    refundAmount: 99.99,
    metadata: { plan: 'pro', billing_cycle: 'monthly', refund_reason: 'customer_request' }
  }
]

const mockStats: PaymentStats = {
  totalPayments: 15420,
  totalRevenue: 2847500,
  successfulPayments: 14234,
  failedPayments: 876,
  pendingPayments: 310,
  refundedPayments: 156,
  averagePaymentAmount: 89.99,
  revenueByMethod: {
    credit_card: 1450000,
    debit_card: 450000,
    paypal: 650000,
    bank_transfer: 250000,
    crypto: 37500
  },
  monthlyRevenue: [
    { month: '2024-01', revenue: 284750, payments: 3120 },
    { month: '2023-12', revenue: 265400, payments: 2980 },
    { month: '2023-11', revenue: 245600, payments: 2850 },
    { month: '2023-10', revenue: 234800, payments: 2760 },
    { month: '2023-09', revenue: 223400, payments: 2680 },
    { month: '2023-08', revenue: 215600, payments: 2590 }
  ],
  topCustomers: [
    { name: 'John Doe', email: 'john@example.com', totalSpent: 3599.64, paymentCount: 36 },
    { name: 'Jane Smith', email: 'jane@example.com', totalSpent: 2999.88, paymentCount: 10 },
    { name: 'Mike Johnson', email: 'mike@example.com', totalSpent: 2399.76, paymentCount: 24 },
    { name: 'Sarah Wilson', email: 'sarah@example.com', totalSpent: 1999.80, paymentCount: 10 },
    { name: 'Tom Brown', email: 'tom@example.com', totalSpent: 1799.82, paymentCount: 18 }
  ]
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [stats] = useState<PaymentStats>(mockStats)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(false)

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === '' || 
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'refunded':
        return 'bg-blue-100 text-blue-800'
      case 'disputed':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />
      case 'debit_card':
        return <CreditCard className="w-4 h-4" />
      case 'paypal':
        return <Globe className="w-4 h-4" />
      case 'bank_transfer':
        return <Banknote className="w-4 h-4" />
      case 'crypto':
        return <Smartphone className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const successRate = (stats.successfulPayments / stats.totalPayments) * 100

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Payments Management</h1>
            <p className="text-muted-foreground">
              Track and manage all payment transactions
            </p>
          </div>
          <div className="flex items-center gap-4">
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
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(stats.totalPayments)} payments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.successfulPayments} successful
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatNumber(stats.failedPayments)}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Payment</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.averagePaymentAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  Per transaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Payment Method</CardTitle>
              <CardDescription>
                Breakdown of revenue by payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.revenueByMethod).map(([method, revenue]) => (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(method)}
                      <span className="capitalize">{method.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(revenue)}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(revenue / stats.totalRevenue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>
                Revenue and payment volume over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.monthlyRevenue.map((data) => (
                  <div key={data.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{new Date(data.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                      <div className="flex gap-4">
                        <span className="text-green-600">{formatCurrency(data.revenue)}</span>
                        <span className="text-blue-600">{formatNumber(data.payments)} payments</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(data.revenue / 300000) * 100}%` }}
                        ></div>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(data.payments / 3500) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
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
                      placeholder="Search payments..."
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
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="method">Payment Method</Label>
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.customerName}</div>
                          <div className="text-sm text-muted-foreground">{payment.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(payment.amount, payment.currency)}</div>
                        {payment.refundAmount && (
                          <div className="text-sm text-red-600">
                            Refunded: {formatCurrency(payment.refundAmount, payment.currency)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(payment.paymentMethod)}
                          <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(payment.createdAt).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {payment.description}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Status Distribution</CardTitle>
                <CardDescription>
                  Current status of all payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(stats.successfulPayments)}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(stats.successfulPayments / stats.totalPayments) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>Failed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(stats.failedPayments)}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(stats.failedPayments / stats.totalPayments) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(stats.pendingPayments)}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ width: `${(stats.pendingPayments / stats.totalPayments) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-blue-500" />
                      <span>Refunded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(stats.refundedPayments)}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(stats.refundedPayments / stats.totalPayments) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Transactions</span>
                    <Badge variant="secondary">{formatNumber(stats.totalPayments)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Success Rate</span>
                    <Badge className="bg-green-100 text-green-800">{successRate.toFixed(1)}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Payment Amount</span>
                    <Badge variant="secondary">{formatCurrency(stats.averagePaymentAmount)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Failure Rate</span>
                    <Badge className="bg-red-100 text-red-800">{((stats.failedPayments / stats.totalPayments) * 100).toFixed(1)}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>
                Highest spending customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(customer.totalSpent)}</div>
                        <div className="text-sm text-muted-foreground">total spent</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{customer.paymentCount}</div>
                        <div className="text-sm text-muted-foreground">payments</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}