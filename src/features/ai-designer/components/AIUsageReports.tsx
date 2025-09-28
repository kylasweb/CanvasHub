"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target, 
  Zap, 
  Download, 
  RefreshCw,
  FileText,
  PieChart,
  LineChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Calendar,
  Filter,
  Search,
  Users,
  Lightbulb,
  Rocket,
  Shield,
  Award
} from 'lucide-react'

interface ReportSummary {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  totalCost: number
  averageProcessingTime: number
  featuresUsed: string[]
  topFeatures: [string, number][]
}

interface ComprehensiveReport {
  executive_summary: string
  usage_overview: {
    total_requests: number
    features_used: string[]
    success_rate: number
  }
  cost_analysis: {
    total_cost: number
    cost_per_request: number
    cost_trends: any[]
  }
  performance_metrics: {
    average_processing_time: number
    success_rate: number
    uptime_percentage: number
  }
  feature_breakdown: Record<string, {
    usage_count: number
    cost: number
    success_rate: number
  }>
  usage_patterns: {
    peak_times: string[]
    growth_trends: any[]
    seasonal_patterns: any[]
  }
  optimization_opportunities: Array<{
    area: string
    potential_savings: number
    difficulty: 'low' | 'medium' | 'high'
    description: string
  }>
  recommendations: string[]
  cost_optimization_strategies: string[]
  future_predictions: {
    usage_forecast: any[]
    cost_projection: any[]
    recommended_actions: string[]
  }
}

interface OptimizationAnalysis {
  optimization_opportunities: Array<{
    area: string
    current_cost: number
    potential_savings: number
    implementation_effort: 'low' | 'medium' | 'high'
    timeline: string
    description: string
  }>
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    action: string
    expected_impact: string
    timeline: string
  }>
  projected_savings: {
    monthly: number
    annually: number
    percentage: number
  }
  implementation_plan: Array<{
    phase: string
    actions: string[]
    timeline: string
    resources: string[]
  }>
  roi_analysis: {
    investment: number
    returns: number
    payback_period: string
    roi_percentage: number
  }
  risk_assessment: Array<{
    risk: string
    likelihood: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
    mitigation: string
  }>
}

interface UsageForecast {
  usage_volume: {
    predictions: Array<{
      date: string
      predicted_requests: number
      confidence_interval: [number, number]
    }>
    growth_rate: number
    seasonal_factors: any[]
  }
  cost_projections: Array<{
    period: string
    projected_cost: number
    best_case: number
    worst_case: number
  }>
  resource_requirements: {
    compute: number
    storage: number
    bandwidth: number
  }
  budget_recommendations: Array<{
    category: string
    recommended_budget: number
    justification: string
  }>
  risk_factors: Array<{
    factor: string
    probability: number
    impact: string
    mitigation: string
  }>
}

interface AIUsageReportsProps {
  userId: string
}

export default function AIUsageReports({ userId }: AIUsageReportsProps) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [comprehensiveReport, setComprehensiveReport] = useState<ComprehensiveReport | null>(null)
  const [optimizationAnalysis, setOptimizationAnalysis] = useState<OptimizationAnalysis | null>(null)
  const [usageForecast, setUsageForecast] = useState<UsageForecast | null>(null)
  
  const [selectedTimeRange, setSelectedTimeRange] = useState('30')
  const [selectedReportType, setSelectedReportType] = useState('comprehensive')
  const [customFilters, setCustomFilters] = useState({})
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/ai/reports?timeRange=${selectedTimeRange}&reportType=summary`)
      if (!response.ok) throw new Error('Failed to fetch summary')
      
      const data = await response.json()
      setSummary(data.data.summary)
    } catch (error) {
      toast.error('Failed to fetch usage summary')
    }
  }, [selectedTimeRange])

  const generateComprehensiveReport = useCallback(async () => {
    if (!userId) return

    setIsGeneratingReport(true)
    try {
      const response = await fetch('/api/v1/ai/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_comprehensive_report',
          data: {
            timeRange: parseInt(selectedTimeRange),
            includeCosts: true,
            includeRecommendations: true
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate comprehensive report')

      const data = await response.json()
      setComprehensiveReport(data.data.report)
      toast.success('Comprehensive report generated successfully')
    } catch (error) {
      toast.error('Failed to generate comprehensive report')
    } finally {
      setIsGeneratingReport(false)
    }
  }, [userId, selectedTimeRange])

  const generateOptimizationAnalysis = useCallback(async () => {
    if (!userId || !summary) return

    setIsGeneratingReport(true)
    try {
      const response = await fetch('/api/v1/ai/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cost_optimization_analysis',
          data: {
            currentUsage: summary,
            budget: 1000, // Example budget
            goals: ['reduce_costs', 'improve_efficiency', 'increase_roi']
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate optimization analysis')

      const data = await response.json()
      setOptimizationAnalysis(data.data.optimization)
      toast.success('Optimization analysis completed')
    } catch (error) {
      toast.error('Failed to generate optimization analysis')
    } finally {
      setIsGeneratingReport(false)
    }
  }, [userId, summary])

  const generateUsageForecast = useCallback(async () => {
    if (!userId || !summary) return

    setIsGeneratingReport(true)
    try {
      const response = await fetch('/api/v1/ai/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'usage_forecasting',
          data: {
            historicalData: summary,
            forecastPeriod: 90,
            growthFactors: {
              market_growth: 0.1,
              feature_adoption: 0.15,
              efficiency_improvements: 0.05
            }
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate usage forecast')

      const data = await response.json()
      setUsageForecast(data.data.forecast)
      toast.success('Usage forecast generated')
    } catch (error) {
      toast.error('Failed to generate usage forecast')
    } finally {
      setIsGeneratingReport(false)
    }
  }, [userId, summary])

  const downloadReport = useCallback((reportType: string, data: any) => {
    const reportData = {
      type: reportType,
      generatedAt: new Date().toISOString(),
      timeRange: selectedTimeRange,
      data
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-usage-report-${reportType}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Report downloaded successfully')
  }, [selectedTimeRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Usage Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive reporting and cost optimization tools</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchSummary}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(summary.totalRequests)}</div>
              <p className="text-xs text-muted-foreground">
                {selectedTimeRange} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalCost)}</div>
              <p className="text-xs text-muted-foreground">
                AI usage cost
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.totalRequests > 0 ? ((summary.successfulRequests / summary.totalRequests) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.successfulRequests} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.averageProcessingTime.toFixed(0)}ms</div>
              <p className="text-xs text-muted-foreground">
                Per request
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comprehensive">Comprehensive Report</TabsTrigger>
          <TabsTrigger value="optimization">Cost Optimization</TabsTrigger>
          <TabsTrigger value="forecasting">Usage Forecasting</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Top Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Most Used Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary?.topFeatures?.map(([feature, count], index) => (
                  <div key={feature} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        <p className="text-sm text-gray-500">{formatNumber(count)} requests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {((count / summary.totalRequests) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Comprehensive Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Generate a detailed analysis of your AI usage patterns, costs, and recommendations.
                </p>
                <Button 
                  onClick={generateComprehensiveReport}
                  disabled={isGeneratingReport}
                  className="w-full"
                >
                  {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Cost Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Analyze cost-saving opportunities and optimize your AI usage efficiency.
                </p>
                <Button 
                  onClick={generateOptimizationAnalysis}
                  disabled={isGeneratingReport || !summary}
                  className="w-full"
                >
                  {isGeneratingReport ? 'Analyzing...' : 'Optimize Costs'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Usage Forecasting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Predict future usage patterns and plan your AI resource allocation.
                </p>
                <Button 
                  onClick={generateUsageForecast}
                  disabled={isGeneratingReport || !summary}
                  className="w-full"
                >
                  {isGeneratingReport ? 'Forecasting...' : 'Forecast Usage'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comprehensive" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Comprehensive AI Usage Report</CardTitle>
                  <CardDescription>
                    Detailed analysis of your AI usage patterns and performance
                  </CardDescription>
                </div>
                <Button 
                  onClick={generateComprehensiveReport}
                  disabled={isGeneratingReport}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isGeneratingReport ? 'Generating...' : 'Regenerate'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {comprehensiveReport ? (
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {/* Executive Summary */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                      <p className="text-sm text-gray-600">{comprehensiveReport.executive_summary}</p>
                    </div>

                    {/* Usage Overview */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Usage Overview</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold">{formatNumber(comprehensiveReport.usage_overview.total_requests)}</div>
                          <div className="text-sm text-gray-600">Total Requests</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold">{comprehensiveReport.usage_overview.success_rate.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">Success Rate</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold">{comprehensiveReport.usage_overview.features_used.length}</div>
                          <div className="text-sm text-gray-600">Features Used</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold">{formatCurrency(comprehensiveReport.cost_analysis.total_cost)}</div>
                          <div className="text-sm text-gray-600">Total Cost</div>
                        </div>
                      </div>
                    </div>

                    {/* Feature Breakdown */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Feature Breakdown</h3>
                      <div className="space-y-2">
                        {Object.entries(comprehensiveReport.feature_breakdown).map(([feature, data]) => (
                          <div key={feature} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <span className="font-medium">{feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                              <span className="text-sm text-gray-500 ml-2">{formatNumber(data.usage_count)} requests</span>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">{formatCurrency(data.cost)}</span>
                              <span className="text-sm text-gray-500 ml-2">{data.success_rate.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                      <ul className="space-y-1">
                        {comprehensiveReport.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            • {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Generate a comprehensive usage report</p>
                  <Button onClick={generateComprehensiveReport}>
                    Generate Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cost Optimization Analysis</CardTitle>
                  <CardDescription>
                    Identify cost-saving opportunities and efficiency improvements
                  </CardDescription>
                </div>
                <Button 
                  onClick={generateOptimizationAnalysis}
                  disabled={isGeneratingReport || !summary}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isGeneratingReport ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {optimizationAnalysis ? (
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {/* Projected Savings */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Projected Savings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(optimizationAnalysis.projected_savings.monthly)}</div>
                          <div className="text-sm text-gray-600">Monthly Savings</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(optimizationAnalysis.projected_savings.annually)}</div>
                          <div className="text-sm text-gray-600">Annual Savings</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{optimizationAnalysis.projected_savings.percentage.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">Cost Reduction</div>
                        </div>
                      </div>
                    </div>

                    {/* Optimization Opportunities */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Optimization Opportunities</h3>
                      <div className="space-y-3">
                        {optimizationAnalysis.optimization_opportunities.map((opportunity, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium">{opportunity.area}</h4>
                              <Badge className={getDifficultyColor(opportunity.implementation_effort)}>
                                {opportunity.implementation_effort}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-600">
                                Save: {formatCurrency(opportunity.potential_savings)}
                              </span>
                              <span className="text-sm text-gray-500">
                                Timeline: {opportunity.timeline}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ROI Analysis */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">ROI Analysis</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="text-lg font-bold">{formatCurrency(optimizationAnalysis.roi_analysis.investment)}</div>
                          <div className="text-sm text-gray-600">Investment</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="text-lg font-bold">{formatCurrency(optimizationAnalysis.roi_analysis.returns)}</div>
                          <div className="text-sm text-gray-600">Expected Returns</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="text-lg font-bold">{optimizationAnalysis.roi_analysis.roi_percentage.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">ROI</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="text-lg font-bold">{optimizationAnalysis.roi_analysis.payback_period}</div>
                          <div className="text-sm text-gray-600">Payback Period</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Analyze cost optimization opportunities</p>
                  <Button onClick={generateOptimizationAnalysis} disabled={!summary}>
                    Analyze Optimization
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usage Forecasting</CardTitle>
                  <CardDescription>
                    Predict future usage patterns and plan resource allocation
                  </CardDescription>
                </div>
                <Button 
                  onClick={generateUsageForecast}
                  disabled={isGeneratingReport || !summary}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isGeneratingReport ? 'Forecasting...' : 'Forecast'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {usageForecast ? (
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {/* Usage Volume Forecast */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Usage Volume Forecast</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{usageForecast.usage_volume.growth_rate.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">Growth Rate</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {usageForecast.usage_volume.predictions[0]?.predicted_requests || 0}
                          </div>
                          <div className="text-sm text-gray-600">Predicted Requests (Next Month)</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {usageForecast.usage_volume.predictions.length}
                          </div>
                          <div className="text-sm text-gray-600">Forecast Period (Days)</div>
                        </div>
                      </div>
                    </div>

                    {/* Cost Projections */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Cost Projections</h3>
                      <div className="space-y-2">
                        {usageForecast.cost_projections.slice(0, 6).map((projection, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded">
                            <span className="font-medium">{projection.period}</span>
                            <div className="text-right">
                              <span className="font-medium">{formatCurrency(projection.projected_cost)}</span>
                              <div className="text-sm text-gray-500">
                                Best: {formatCurrency(projection.best_case)} | Worst: {formatCurrency(projection.worst_case)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resource Requirements */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Resource Requirements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-purple-50 rounded">
                          <div className="text-lg font-bold">{usageForecast.resource_requirements.compute.toFixed(1)}</div>
                          <div className="text-sm text-gray-600">Compute Units</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded">
                          <div className="text-lg font-bold">{(usageForecast.resource_requirements.storage / 1024).toFixed(1)} GB</div>
                          <div className="text-sm text-gray-600">Storage</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded">
                          <div className="text-lg font-bold">{(usageForecast.resource_requirements.bandwidth / 1024).toFixed(1)} GB</div>
                          <div className="text-sm text-gray-600">Bandwidth</div>
                        </div>
                      </div>
                    </div>

                    {/* Budget Recommendations */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Budget Recommendations</h3>
                      <div className="space-y-2">
                        {usageForecast.budget_recommendations.map((recommendation, index) => (
                          <div key={index} className="p-3 border rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{recommendation.category}</span>
                              <span className="font-bold">{formatCurrency(recommendation.recommended_budget)}</span>
                            </div>
                            <p className="text-sm text-gray-600">{recommendation.justification}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Generate usage forecasts and predictions</p>
                  <Button onClick={generateUsageForecast} disabled={!summary}>
                    Generate Forecast
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
              <CardDescription>
                Create customized reports based on your specific requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature_usage">Feature Usage Analysis</SelectItem>
                        <SelectItem value="cost_breakdown">Cost Breakdown</SelectItem>
                        <SelectItem value="performance">Performance Metrics</SelectItem>
                        <SelectItem value="user_behavior">User Behavior</SelectItem>
                        <SelectItem value="trends">Trends Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timeFrame">Time Frame</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time frame" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="metrics">Metrics to Include</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {['Usage Volume', 'Cost Analysis', 'Performance', 'Success Rate', 'Error Analysis', 'Feature Breakdown', 'Time Trends', 'User Segments'].map((metric) => (
                      <label key={metric} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{metric}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="customFilters">Custom Filters</Label>
                  <Textarea
                    id="customFilters"
                    placeholder="Enter any custom filters or requirements..."
                    className="mt-2"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button>Generate Custom Report</Button>
                  <Button variant="outline">Save as Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Download Actions */}
      <div className="flex justify-center space-x-4">
        {comprehensiveReport && (
          <Button 
            variant="outline"
            onClick={() => downloadReport('comprehensive', comprehensiveReport)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Comprehensive Report
          </Button>
        )}
        {optimizationAnalysis && (
          <Button 
            variant="outline"
            onClick={() => downloadReport('optimization', optimizationAnalysis)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Optimization Analysis
          </Button>
        )}
        {usageForecast && (
          <Button 
            variant="outline"
            onClick={() => downloadReport('forecast', usageForecast)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Usage Forecast
          </Button>
        )}
      </div>
    </div>
  )
}