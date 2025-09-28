'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Users,
  FileCheck,
  FileX,
  Calendar,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  MapPin,
  Eye,
  Search
} from 'lucide-react'

interface KYCAnalytics {
  totalVerifications: number
  pendingVerifications: number
  approvedVerifications: number
  rejectedVerifications: number
  averageProcessingTime: number
  completionRate: number
  highRiskVerifications: number
  mediumRiskVerifications: number
  lowRiskVerifications: number
  verificationsByType: {
    BASIC: number
    STANDARD: number
    ENHANCED: number
    BUSINESS: number
  }
  verificationsByStatus: {
    PENDING: number
    SUBMITTED: number
    UNDER_REVIEW: number
    APPROVED: number
    REJECTED: number
    EXPIRED: number
    SUSPENDED: number
  }
  processingTrends: Array<{
    date: string
    submitted: number
    approved: number
    rejected: number
    averageTime: number
  }>
  topReviewers: Array<{
    name: string
    reviewed: number
    approved: number
    rejected: number
    averageTime: number
  }>
  geographicData: Array<{
    country: string
    verifications: number
    approved: number
    rejected: number
  }>
  documentTypes: Array<{
    type: string
    count: number
    approvalRate: number
  }>
}

const mockKYCAnalytics: KYCAnalytics = {
  totalVerifications: 3421,
  pendingVerifications: 423,
  approvedVerifications: 2654,
  rejectedVerifications: 344,
  averageProcessingTime: 2.8,
  completionRate: 87.6,
  highRiskVerifications: 156,
  mediumRiskVerifications: 892,
  lowRiskVerifications: 2373,
  verificationsByType: {
    BASIC: 1234,
    STANDARD: 1456,
    ENHANCED: 543,
    BUSINESS: 188
  },
  verificationsByStatus: {
    PENDING: 156,
    SUBMITTED: 267,
    UNDER_REVIEW: 234,
    APPROVED: 2654,
    REJECTED: 344,
    EXPIRED: 89,
    SUSPENDED: 12
  },
  processingTrends: [
    { date: '2024-01-01', submitted: 45, approved: 38, rejected: 5, averageTime: 3.2 },
    { date: '2024-01-02', submitted: 52, approved: 44, rejected: 6, averageTime: 2.9 },
    { date: '2024-01-03', submitted: 48, approved: 41, rejected: 4, averageTime: 2.7 },
    { date: '2024-01-04', submitted: 61, approved: 52, rejected: 7, averageTime: 2.8 },
    { date: '2024-01-05', submitted: 55, approved: 47, rejected: 6, averageTime: 2.6 },
    { date: '2024-01-06', submitted: 58, approved: 49, rejected: 7, averageTime: 2.5 },
    { date: '2024-01-07', submitted: 64, approved: 54, rejected: 8, averageTime: 2.4 }
  ],
  topReviewers: [
    { name: 'John Smith', reviewed: 234, approved: 198, rejected: 36, averageTime: 2.3 },
    { name: 'Sarah Johnson', reviewed: 189, approved: 167, rejected: 22, averageTime: 2.7 },
    { name: 'Mike Davis', reviewed: 156, approved: 134, rejected: 22, averageTime: 3.1 },
    { name: 'Emily Brown', reviewed: 145, approved: 128, rejected: 17, averageTime: 2.5 },
    { name: 'David Wilson', reviewed: 123, approved: 108, rejected: 15, averageTime: 2.8 }
  ],
  geographicData: [
    { country: 'United States', verifications: 1456, approved: 1234, rejected: 156 },
    { country: 'United Kingdom', verifications: 892, approved: 789, rejected: 78 },
    { country: 'Canada', verifications: 634, approved: 567, rejected: 45 },
    { country: 'Germany', verifications: 445, approved: 389, rejected: 34 },
    { country: 'Australia', verifications: 323, approved: 287, rejected: 28 }
  ],
  documentTypes: [
    { type: 'PASSPORT', count: 2341, approvalRate: 89.2 },
    { type: 'ID_CARD', count: 1876, approvalRate: 87.5 },
    { type: 'DRIVERS_LICENSE', count: 1234, approvalRate: 85.3 },
    { type: 'UTILITY_BILL', count: 987, approvalRate: 91.2 },
    { type: 'BANK_STATEMENT', count: 654, approvalRate: 88.7 }
  ]
}

export default function AdminKYCAnalyticsPage() {
  const [analytics] = useState<KYCAnalytics>(mockKYCAnalytics)
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(false)

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatPercentage = (num: number) => {
    return num.toFixed(1) + '%'
  }

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">KYC Analytics</h1>
            <p className="text-muted-foreground">
              Identity verification performance and insights
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
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reviewers">Reviewers</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics.totalVerifications)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(analytics.completionRate)} completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics.pendingVerifications)}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatNumber(analytics.approvedVerifications)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage((analytics.approvedVerifications / analytics.totalVerifications) * 100)} success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.averageProcessingTime} days</div>
                <p className="text-xs text-muted-foreground">
                  Industry average: 3.5 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Verification Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Types</CardTitle>
                <CardDescription>
                  Distribution of verification types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Basic</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(analytics.verificationsByType.BASIC / analytics.totalVerifications) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{formatNumber(analytics.verificationsByType.BASIC)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Standard</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(analytics.verificationsByType.STANDARD / analytics.totalVerifications) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{formatNumber(analytics.verificationsByType.STANDARD)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Enhanced</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(analytics.verificationsByType.ENHANCED / analytics.totalVerifications) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{formatNumber(analytics.verificationsByType.ENHANCED)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Business</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${(analytics.verificationsByType.BUSINESS / analytics.totalVerifications) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{formatNumber(analytics.verificationsByType.BUSINESS)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>
                  Risk level distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Low Risk</span>
                    </div>
                    <Badge variant="secondary">{formatNumber(analytics.lowRiskVerifications)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Medium Risk</span>
                    </div>
                    <Badge variant="secondary">{formatNumber(analytics.mediumRiskVerifications)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>High Risk</span>
                    </div>
                    <Badge variant="destructive">{formatNumber(analytics.highRiskVerifications)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Processing Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Trends</CardTitle>
              <CardDescription>
                Daily verification processing statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.processingTrends.map((trend) => (
                  <div key={trend.date} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{new Date(trend.date).toLocaleDateString()}</span>
                      <div className="flex gap-4">
                        <span className="text-blue-600">{trend.submitted} submitted</span>
                        <span className="text-green-600">{trend.approved} approved</span>
                        <span className="text-red-600">{trend.rejected} rejected</span>
                        <span className="text-purple-600">{trend.averageTime} days avg</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(trend.submitted / 80) * 100}%` }}
                        ></div>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(trend.approved / 60) * 100}%` }}
                        ></div>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(trend.rejected / 15) * 100}%` }}
                        ></div>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(trend.averageTime / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>
                  Current status of all verifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.verificationsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(status)}>
                          {status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatNumber(count)}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / analytics.totalVerifications) * 100}%` }}
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
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>
                  Verifications by country
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.geographicData.map((data) => (
                    <div key={data.country} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{data.country}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-blue-600">{formatNumber(data.verifications)}</span>
                          <span className="text-sm text-green-600">{formatNumber(data.approved)}</span>
                          <span className="text-sm text-red-600">{formatNumber(data.rejected)}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(data.verifications / 1500) * 100}%` }}
                          ></div>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(data.approved / 1300) * 100}%` }}
                          ></div>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${(data.rejected / 200) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviewers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Reviewers</CardTitle>
              <CardDescription>
                Performance metrics for verification reviewers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Total Reviewed</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Rejected</TableHead>
                    <TableHead>Approval Rate</TableHead>
                    <TableHead>Avg Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topReviewers.map((reviewer) => (
                    <TableRow key={reviewer.name}>
                      <TableCell className="font-medium">{reviewer.name}</TableCell>
                      <TableCell>{formatNumber(reviewer.reviewed)}</TableCell>
                      <TableCell>{formatNumber(reviewer.approved)}</TableCell>
                      <TableCell>{formatNumber(reviewer.rejected)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatPercentage((reviewer.approved / reviewer.reviewed) * 100)}
                        </Badge>
                      </TableCell>
                      <TableCell>{reviewer.averageTime} days</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Types Analysis</CardTitle>
              <CardDescription>
                Performance metrics by document type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.documentTypes.map((doc) => (
                  <div key={doc.type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{doc.type.replace('_', ' ')}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(doc.count)} documents
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{formatPercentage(doc.approvalRate)}</div>
                        <div className="text-sm text-muted-foreground">approval rate</div>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${doc.approvalRate}%` }}
                        ></div>
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