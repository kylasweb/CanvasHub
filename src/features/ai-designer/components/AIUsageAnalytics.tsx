"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Zap, 
  Activity,
  Calendar,
  Target,
  Users,
  RefreshCw
} from 'lucide-react'

interface AIUsageAnalytics {
  totalRequests: number
  totalCost: number
  averageProcessingTime: number
  totalProcessingTime: number
  featureBreakdown: Record<string, {
    count: number
    cost: number
    avgProcessingTime: number
    totalProcessingTime: number
  }>
  dailyUsage: Record<string, {
    requests: number
    cost: number
    processingTime: number
  }>
  recentActivities: Array<{
    id: string
    feature: string
    cost: number
    processingTime: number
    timestamp: string
    success: boolean
  }>
}

interface AIUsageAnalyticsProps {
  userId: string
}

export default function AIUsageAnalytics({ userId }: AIUsageAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AIUsageAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedFeature, setSelectedFeature] = useState('all')

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        period: selectedPeriod,
        feature: selectedFeature
      })
      
      const response = await fetch(`/api/v1/ai/analytics?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod, selectedFeature])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'content_generation':
        return <Target className="w-4 h-4" />
      case 'layout_suggestion':
      case 'advanced_layout_suggestion':
        return <BarChart3 className="w-4 h-4" />
      case 'color_palette_generation':
        return <RefreshCw className="w-4 h-4" />
      case 'seo_optimization':
        return <TrendingUp className="w-4 h-4" />
      case 'advanced_image_enhancement':
        return <Zap className="w-4 h-4" />
      case 'batch_processing':
        return <Activity className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'content_generation':
        return 'Content Generation'
      case 'layout_suggestion':
        return 'Layout Suggestion'
      case 'advanced_layout_suggestion':
        return 'Advanced Layout'
      case 'color_palette_generation':
        return 'Color Palette'
      case 'seo_optimization':
        return 'SEO Optimization'
      case 'advanced_image_enhancement':
        return 'Image Enhancement'
      case 'batch_processing':
        return 'Batch Processing'
      default:
        return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchAnalytics} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">AI Usage Analytics</h2>
          <p className="text-gray-600">Track your AI interactions and optimize your workflow</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
          <Select value={selectedFeature} onValueChange={setSelectedFeature}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Features</SelectItem>
              {Object.keys(analytics.featureBreakdown).map(feature => (
                <SelectItem key={feature} value={feature}>
                  {getFeatureName(feature)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {selectedPeriod} period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              AI usage cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(analytics.averageProcessingTime)}</div>
            <p className="text-xs text-muted-foreground">
              Per request
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features Used</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(analytics.featureBreakdown).length}</div>
            <p className="text-xs text-muted-foreground">
              AI features
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features">Feature Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Usage Trends</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Breakdown</CardTitle>
              <CardDescription>
                Detailed breakdown of AI feature usage and costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.featureBreakdown)
                  .sort(([,a], [,b]) => b.count - a.count)
                  .map(([feature, data]) => (
                    <div key={feature} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getFeatureIcon(feature)}
                        <div>
                          <p className="font-medium">{getFeatureName(feature)}</p>
                          <p className="text-sm text-gray-500">
                            {data.count} requests • {formatTime(data.avgProcessingTime)} avg
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(data.cost)}</p>
                        <p className="text-sm text-gray-500">
                          {formatTime(data.totalProcessingTime)} total
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Usage Trends</CardTitle>
              <CardDescription>
                Your AI usage patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(analytics.dailyUsage)
                  .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                  .slice(0, 14)
                  .map(([date, data]) => (
                    <div key={date} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{formatDate(date)}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">{data.requests} requests</span>
                        <span className="text-sm">{formatCurrency(data.cost)}</span>
                        <Badge variant="outline">
                          {formatTime(data.processingTime)}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your most recent AI interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getFeatureIcon(activity.feature)}
                      <div>
                        <p className="font-medium">{getFeatureName(activity.feature)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={activity.success ? "default" : "destructive"}>
                        {activity.success ? "Success" : "Failed"}
                      </Badge>
                      <span className="text-sm">{formatCurrency(activity.cost)}</span>
                      <span className="text-sm text-gray-500">
                        {formatTime(activity.processingTime)}
                      </span>
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