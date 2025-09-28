'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts'
import { BarChart3, TrendingUp, Brain, AlertTriangle, RefreshCw, Target, Clock, Zap } from 'lucide-react'

interface AdvancedAnalyticsRequest {
  timeRange: {
    start: Date
    end: Date
  }
  metrics: string[]
  dimensions: string[]
  filters?: Record<string, any>
  predictiveOptions?: {
    forecastDays: number
    confidenceInterval: number
    includeSeasonality: boolean
    includeTrends: boolean
  }
  comparisonOptions?: {
    compareWithPrevious: boolean
    compareWithBenchmark: boolean
    benchmarkData?: any
  }
}

interface AdvancedAnalyticsResponse {
  summary: {
    totalRecords: number
    dateRange: string
    metricsCalculated: string[]
    processingTime: number
  }
  data: Array<{
    timestamp: Date
    dimensions: Record<string, any>
    metrics: Record<string, number>
  }>
  insights: {
    keyFindings: string[]
    trends: Array<{
      metric: string
      direction: 'increasing' | 'decreasing' | 'stable'
      magnitude: number
      significance: number
    }>
    anomalies: Array<{
      metric: string
      timestamp: Date
      value: number
      expectedValue: number
      deviation: number
    }>
    correlations: Array<{
      metric1: string
      metric2: string
      correlation: number
      significance: number
    }>
  }
  predictions: {
    forecast: Array<{
      timestamp: Date
      predicted: number
      confidence: {
        lower: number
        upper: number
      }
    }>
    trendAnalysis: {
      overallTrend: 'positive' | 'negative' | 'neutral'
      trendStrength: number
      seasonality: boolean
      keyDrivers: string[]
    }
    recommendations: string[]
  }
  benchmarks?: {
    industry: Record<string, number>
    competitor: Record<string, number>
    historical: Record<string, number>
  }
}

export default function AdvancedAnalyticsDashboard() {
  const [request, setRequest] = useState<AdvancedAnalyticsRequest>({
    timeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    },
    metrics: ['page_views', 'unique_visitors', 'conversion_rate'],
    dimensions: ['device_type', 'traffic_source'],
    predictiveOptions: {
      forecastDays: 7,
      confidenceInterval: 0.1,
      includeSeasonality: true,
      includeTrends: true
    },
    comparisonOptions: {
      compareWithPrevious: true,
      compareWithBenchmark: true
    }
  })

  const [response, setResponse] = useState<AdvancedAnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [realTimeData, setRealTimeData] = useState<any>(null)

  const availableMetrics = [
    'page_views', 'unique_visitors', 'conversion_rate', 'bounce_rate', 
    'avg_session_duration', 'revenue', 'cart_additions', 'checkout_initiated'
  ]

  const availableDimensions = [
    'device_type', 'traffic_source', 'geographic_location', 'user_segment', 'time_of_day'
  ]

  const generateAnalytics = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/v1/analytics/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user',
          ...request
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate advanced analytics')
      }

      const data = await response.json()
      setResponse(data)
    } catch (error) {
      console.error('Error generating analytics:', error)
      alert('Failed to generate advanced analytics. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchRealTimeData = async () => {
    try {
      const response = await fetch('/api/v1/analytics/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user',
          metrics: ['page_views', 'unique_visitors', 'conversion_rate', 'active_users'],
          timeWindow: 5, // 5 minutes
          aggregation: 'average',
          alerts: {
            thresholds: {
              page_views: { upper: 200, lower: 50 },
              conversion_rate: { upper: 0.05, lower: 0.01 },
              active_users: { upper: 300, lower: 100 }
            },
            notifications: true
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch real-time data')
      }

      const data = await response.json()
      setRealTimeData(data)
    } catch (error) {
      console.error('Error fetching real-time data:', error)
    }
  }

  useEffect(() => {
    fetchRealTimeData()
    const interval = setInterval(fetchRealTimeData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'increasing': return 'text-green-600'
      case 'decreasing': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return '↗️'
      case 'decreasing': return '↘️'
      default: return '→'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatChartData = (data: any[]) => {
    return data.map(item => ({
      date: item.timestamp.toLocaleDateString(),
      ...item.metrics
    }))
  }

  const formatForecastData = (forecast: any[]) => {
    return forecast.map(item => ({
      date: item.timestamp.toLocaleDateString(),
      predicted: item.predicted.page_views || 0,
      lower: item.confidence.lower.page_views || 0,
      upper: item.confidence.upper.page_views || 0
    }))
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Predictive insights, trend analysis, and real-time monitoring with AI-powered analytics
        </p>
      </div>

      {/* Real-time Metrics */}
      {realTimeData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{realTimeData.summary.activeUsers}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Page Views</p>
                  <p className="text-2xl font-bold">{realTimeData.summary.pageViews}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{(realTimeData.summary.conversionRate * 100).toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alerts</p>
                  <p className="text-2xl font-bold">{realTimeData.alerts.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Configuration Panel */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Analytics Configuration
              </CardTitle>
              <CardDescription>
                Configure analytics parameters and AI options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={request.timeRange.start.toISOString().split('T')[0]}
                    onChange={(e) => setRequest(prev => ({
                      ...prev,
                      timeRange: { ...prev.timeRange, start: new Date(e.target.value) }
                    }))}
                  />
                  <Input
                    type="date"
                    value={request.timeRange.end.toISOString().split('T')[0]}
                    onChange={(e) => setRequest(prev => ({
                      ...prev,
                      timeRange: { ...prev.timeRange, end: new Date(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Metrics</label>
                <div className="space-y-2">
                  {availableMetrics.map(metric => (
                    <label key={metric} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={request.metrics.includes(metric)}
                        onChange={(e) => {
                          const metrics = e.target.checked 
                            ? [...request.metrics, metric]
                            : request.metrics.filter(m => m !== metric)
                          setRequest(prev => ({ ...prev, metrics }))
                        }}
                      />
                      <span className="text-sm">{metric.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Dimensions</label>
                <div className="space-y-2">
                  {availableDimensions.map(dimension => (
                    <label key={dimension} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={request.dimensions.includes(dimension)}
                        onChange={(e) => {
                          const dimensions = e.target.checked 
                            ? [...request.dimensions, dimension]
                            : request.dimensions.filter(d => d !== dimension)
                          setRequest(prev => ({ ...prev, dimensions }))
                        }}
                      />
                      <span className="text-sm">{dimension.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Predictive Options</label>
                <div className="space-y-2">
                  <div>
                    <Input
                      type="number"
                      value={request.predictiveOptions?.forecastDays || 7}
                      onChange={(e) => setRequest(prev => ({
                        ...prev,
                        predictiveOptions: { ...prev.predictiveOptions!, forecastDays: parseInt(e.target.value) || 7 }
                      }))}
                      placeholder="Forecast days"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-seasonality" className="text-sm">Include Seasonality</Label>
                    <Switch
                      id="include-seasonality"
                      checked={request.predictiveOptions?.includeSeasonality}
                      onCheckedChange={(checked) => setRequest(prev => ({
                        ...prev,
                        predictiveOptions: { ...prev.predictiveOptions!, includeSeasonality: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-trends" className="text-sm">Include Trends</Label>
                    <Switch
                      id="include-trends"
                      checked={request.predictiveOptions?.includeTrends}
                      onCheckedChange={(checked) => setRequest(prev => ({
                        ...prev,
                        predictiveOptions: { ...prev.predictiveOptions!, includeTrends: checked }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Comparison Options</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compare-previous" className="text-sm">Compare with Previous</Label>
                    <Switch
                      id="compare-previous"
                      checked={request.comparisonOptions?.compareWithPrevious}
                      onCheckedChange={(checked) => setRequest(prev => ({
                        ...prev,
                        comparisonOptions: { ...prev.comparisonOptions!, compareWithPrevious: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compare-benchmark" className="text-sm">Compare with Benchmark</Label>
                    <Switch
                      id="compare-benchmark"
                      checked={request.comparisonOptions?.compareWithBenchmark}
                      onCheckedChange={(checked) => setRequest(prev => ({
                        ...prev,
                        comparisonOptions: { ...prev.comparisonOptions!, compareWithBenchmark: checked }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={generateAnalytics} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Analytics
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics Results
              </CardTitle>
              <CardDescription>
                Advanced insights, predictions, and trend analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {response ? (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="predictions">Predictions</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{response.summary.totalRecords}</div>
                        <div className="text-sm text-muted-foreground">Data Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{response.summary.processingTime}ms</div>
                        <div className="text-sm text-muted-foreground">Processing Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{response.insights.trends.length}</div>
                        <div className="text-sm text-muted-foreground">Trends Detected</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{response.insights.anomalies.length}</div>
                        <div className="text-sm text-muted-foreground">Anomalies Found</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Key Metrics Over Time</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={formatChartData(response.data)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {request.metrics.map((metric, index) => (
                              <Line 
                                key={metric}
                                type="monotone" 
                                dataKey={metric} 
                                stroke={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'][index % 5]}
                                strokeWidth={2}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="trends" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Trend Analysis</h4>
                      <div className="space-y-3">
                        {response.insights.trends.map((trend, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium">{trend.metric.replace(/_/g, ' ')}</div>
                              <div className={`text-sm ${getTrendColor(trend.direction)}`}>
                                {getTrendIcon(trend.direction)} {trend.direction} ({Math.round(trend.magnitude * 100)}%)
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Significance</div>
                              <Progress value={trend.significance * 100} className="w-20 h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {response.insights.correlations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Correlations</h4>
                        <div className="space-y-2">
                          {response.insights.correlations.map((correlation, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div className="text-sm">
                                {correlation.metric1.replace(/_/g, ' ')} ↔ {correlation.metric2.replace(/_/g, ' ')}
                              </div>
                              <div className="text-sm font-medium">
                                {Math.round(correlation.correlation * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="predictions" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Trend Analysis</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Overall Trend</div>
                          <div className={`text-lg font-bold ${getTrendColor(response.predictions.trendAnalysis.overallTrend)}`}>
                            {response.predictions.trendAnalysis.overallTrend}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Trend Strength</div>
                          <div className="text-lg font-bold">
                            {Math.round(response.predictions.trendAnalysis.trendStrength * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Forecast</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={formatForecastData(response.predictions.forecast)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="predicted" stroke="#8884d8" strokeWidth={2} />
                            <Line type="monotone" dataKey="lower" stroke="#82ca9d" strokeDasharray="5 5" />
                            <Line type="monotone" dataKey="upper" stroke="#82ca9d" strokeDasharray="5 5" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">AI Recommendations</h4>
                      <div className="space-y-2">
                        {response.predictions.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start space-x-2 p-2 border rounded">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <div className="text-sm">{recommendation}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Key Findings</h4>
                      <div className="space-y-2">
                        {response.insights.keyFindings.map((finding, index) => (
                          <div key={index} className="flex items-start space-x-2 p-2 border rounded">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <div className="text-sm">{finding}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {response.insights.anomalies.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Anomalies Detected</h4>
                        <div className="space-y-2">
                          {response.insights.anomalies.map((anomaly, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded border-red-200">
                              <div>
                                <div className="font-medium">{anomaly.metric.replace(/_/g, ' ')}</div>
                                <div className="text-sm text-muted-foreground">
                                  {anomaly.timestamp.toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-red-600">
                                  {Math.round(anomaly.deviation * 100)}% deviation
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Expected: {Math.round(anomaly.expectedValue)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="benchmarks" className="space-y-4">
                    {response.benchmarks ? (
                      <div>
                        <h4 className="font-medium mb-2">Benchmark Comparison</h4>
                        <div className="space-y-4">
                          {Object.entries(response.benchmarks.industry).map(([metric, value]) => (
                            <div key={metric} className="p-3 border rounded">
                              <div className="font-medium mb-2">{metric.replace(/_/g, ' ')}</div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">Current</div>
                                  <div className="font-medium">
                                    {Math.round((response.data[response.data.length - 1]?.metrics[metric] || 0))}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Industry</div>
                                  <div className="font-medium">{Math.round(value as number)}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Performance</div>
                                  <div className={`font-medium ${
                                    (response.data[response.data.length - 1]?.metrics[metric] || 0) > (value as number) 
                                      ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {((response.data[response.data.length - 1]?.metrics[metric] || 0) > (value as number) ? 'Above' : 'Below')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Enable benchmark comparison to see industry and competitor benchmarks
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Configure analytics settings and click "Generate Analytics" to see advanced insights and predictions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}