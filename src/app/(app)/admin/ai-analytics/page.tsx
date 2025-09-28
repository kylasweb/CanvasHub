"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  Clock, 
  DollarSign, 
  Star,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Target,
  Brain,
  Palette,
  Search,
  FileText,
  LayoutGrid
} from 'lucide-react'
import { toast } from 'sonner'

interface AIUsageStats {
  totalUsage: number
  usageByFeature: Array<{
    feature: string
    count: number
    cost: number
    avgProcessingTime: number
  }>
  usageByUser: Array<{
    userId: string
    userEmail: string
    usageCount: number
    totalCost: number
    lastUsed: string
  }>
  dailyUsage: Array<{
    date: string
    count: number
    cost: number
  }>
  monthlyTrends: Array<{
    month: string
    count: number
    cost: number
    growth: number
  }>
}

interface AIFeedbackStats {
  totalFeedback: number
  averageRating: number
  feedbackByFeature: Array<{
    feature: string
    rating: number
    positiveCount: number
    negativeCount: number
    commonIssues: string[]
  }>
  recentFeedback: Array<{
    id: string
    feature: string
    rating: number
    comment: string
    timestamp: string
    userEmail: string
  }>
}

interface AIPerformanceMetrics {
  averageResponseTime: number
  successRate: number
  errorRate: number
  costPerRequest: number
  uptime: number
  modelPerformance: Array<{
    model: string
    accuracy: number
    speed: number
    cost: number
  }>
}

export default function AdminAIAnalytics() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [selectedFeature, setSelectedFeature] = useState('all')
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null)
  const [feedbackStats, setFeedbackStats] = useState<AIFeedbackStats | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<AIPerformanceMetrics | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange, selectedFeature])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/admin/ai/analytics?dateRange=${dateRange}&feature=${selectedFeature}`)
      if (!response.ok) throw new Error('Failed to fetch analytics data')
      
      const data = await response.json()
      setUsageStats(data.usage)
      setFeedbackStats(data.feedback)
      setPerformanceMetrics(data.performance)
    } catch (error) {
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      const response = await fetch(`/api/v1/admin/ai/analytics/export?dateRange=${dateRange}&feature=${selectedFeature}`)
      if (!response.ok) throw new Error('Failed to export report')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Report exported successfully')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'content_generation': return <FileText className="w-4 h-4" />
      case 'layout_suggestion': return <LayoutGrid className="w-4 h-4" />
      case 'color_palette_generation': return <Palette className="w-4 h-4" />
      case 'seo_optimization': return <Search className="w-4 h-4" />
      case 'image_enhancement': return <Brain className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  const formatFeatureName = (feature: string) => {
    return feature.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor AI feature usage, performance, and user feedback</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchAnalyticsData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="feature">Feature</Label>
              <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Features</SelectItem>
                  <SelectItem value="content_generation">Content Generation</SelectItem>
                  <SelectItem value="layout_suggestion">Layout Suggestions</SelectItem>
                  <SelectItem value="color_palette_generation">Color Palettes</SelectItem>
                  <SelectItem value="seo_optimization">SEO Optimization</SelectItem>
                  <SelectItem value="image_enhancement">Image Enhancement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AI Usage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.totalUsage.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackStats?.averageRating.toFixed(1) || '0.0'}/5</div>
            <p className="text-xs text-muted-foreground">
              Based on {feedbackStats?.totalFeedback || 0} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(performanceMetrics?.successRate || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Avg response time: {(performanceMetrics?.averageResponseTime || 0).toFixed(0)}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(usageStats?.usageByFeature.reduce((sum, f) => sum + f.cost, 0) || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cost per request: ${(performanceMetrics?.costPerRequest || 0).toFixed(4)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Feature</CardTitle>
                <CardDescription>Breakdown of AI feature usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageStats?.usageByFeature.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getFeatureIcon(feature.feature)}
                        <span className="font-medium">{formatFeatureName(feature.feature)}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{feature.count.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          ${feature.cost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Users</CardTitle>
                <CardDescription>Users with highest AI feature usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageStats?.usageByUser.slice(0, 10).map((user, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{user.userEmail}</div>
                        <div className="text-sm text-muted-foreground">
                          Last used: {new Date(user.lastUsed).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{user.usageCount}</div>
                        <div className="text-sm text-muted-foreground">
                          ${user.totalCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Feature</CardTitle>
                <CardDescription>User satisfaction ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbackStats?.feedbackByFeature.map((feature, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getFeatureIcon(feature.feature)}
                          <span className="font-medium">{formatFeatureName(feature.feature)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold">{feature.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-3 h-3 text-green-500" />
                          <span>{feature.positiveCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsDown className="w-3 h-3 text-red-500" />
                          <span>{feature.negativeCount}</span>
                        </div>
                      </div>
                      {feature.commonIssues.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Common issues: {feature.commonIssues.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
                <CardDescription>Latest user feedback and comments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {feedbackStats?.recentFeedback.map((feedback, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getFeatureIcon(feedback.feature)}
                          <span className="text-sm font-medium">{feedback.userEmail}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < feedback.rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{feedback.comment}</p>
                      <div className="text-xs text-muted-foreground">
                        {new Date(feedback.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>AI system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Average Response Time</span>
                    <span className="font-semibold">{(performanceMetrics?.averageResponseTime || 0).toFixed(0)}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Success Rate</span>
                    <Badge variant={(performanceMetrics?.successRate || 0) > 95 ? 'default' : 'destructive'}>
                      {(performanceMetrics?.successRate || 0).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Error Rate</span>
                    <Badge variant={(performanceMetrics?.errorRate || 0) < 5 ? 'default' : 'destructive'}>
                      {(performanceMetrics?.errorRate || 0).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>System Uptime</span>
                    <Badge variant="default">{(performanceMetrics?.uptime || 0).toFixed(1)}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cost per Request</span>
                    <span className="font-semibold">${(performanceMetrics?.costPerRequest || 0).toFixed(4)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>AI model performance comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics?.modelPerformance.map((model, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{model.model}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{(model.accuracy * 100).toFixed(0)}% acc</Badge>
                          <Badge variant="outline">{model.speed}ms</Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Cost: ${model.cost.toFixed(4)} per request
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Usage and cost trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats?.monthlyTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{trend.month}</div>
                      <div className="text-sm text-muted-foreground">
                        {trend.growth > 0 ? '+' : ''}{trend.growth.toFixed(1)}% growth
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{trend.count.toLocaleString()} requests</div>
                      <div className="text-sm text-muted-foreground">
                        ${trend.cost.toFixed(2)}
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