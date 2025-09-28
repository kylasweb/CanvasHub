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
  Users, 
  Target, 
  Zap, 
  RefreshCw, 
  Play, 
  Pause, 
  Square,
  Eye,
  EyeOff,
  Split,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  Filter,
  Search,
  Settings,
  Download,
  Share,
  Plus,
  Edit,
  Trash2,
  Copy,
  BarChart,
  PieChart,
  LineChart,
  Lightbulb
} from 'lucide-react'

interface TestVariation {
  id: string
  name: string
  description: string
  design: any
  hypothesis: string
  implementation: string
  expectedImprovement: number
  confidence: number
  status: 'draft' | 'active' | 'paused' | 'completed'
}

interface TestResult {
  variationId: string
  impressions: number
  conversions: number
  conversionRate: number
  confidence: number
  improvement: number
  statisticalSignificance: boolean
  userEngagement: {
    timeOnPage: number
    bounceRate: number
    clickThroughRate: number
  }
  segmentPerformance: Record<string, any>
}

interface TestInsight {
  id: string
  type: 'user_behavior' | 'design_preference' | 'conversion_driver' | 'strategic'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  recommendation: string
  evidence: string[]
}

interface SegmentAnalysis {
  segment: string
  size: number
  performance: Record<string, number>
  insights: string[]
  recommendations: string[]
}

interface AITestingProps {
  projectId: string
  websiteContent: any
  websiteStyles: any
}

export default function AITesting({ projectId, websiteContent, websiteStyles }: AITestingProps) {
  const [loading, setLoading] = useState(false)
  const [tests, setTests] = useState<any[]>([])
  const [variations, setVariations] = useState<TestVariation[]>([])
  const [results, setResults] = useState<TestResult[]>([])
  const [insights, setInsights] = useState<TestInsight[]>([])
  const [segmentAnalysis, setSegmentAnalysis] = useState<SegmentAnalysis[]>([])
  const [predictions, setPredictions] = useState<any>(null)
  
  const [selectedTest, setSelectedTest] = useState<any>(null)
  const [selectedElement, setSelectedElement] = useState('')
  const [testGoals, setTestGoals] = useState<string[]>(['increase_conversion'])
  const [targetAudience, setTargetAudience] = useState('general')
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false)
  const [isAnalyzingResults, setIsAnalyzingResults] = useState(false)

  const generateVariations = useCallback(async () => {
    if (!projectId || !selectedElement) return

    setIsGeneratingVariations(true)
    try {
      const response = await fetch('/api/v1/ai/ab-testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'generate_variations',
          data: {
            element: selectedElement,
            currentDesign: {
              content: websiteContent,
              styles: websiteStyles
            },
            targetAudience,
            goals: testGoals
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate variations')

      const data = await response.json()
      const variationsData = data.data.variations

      const newVariations: TestVariation[] = variationsData.variations?.map((variation: any, index: number) => ({
        id: `variation_${Date.now()}_${index}`,
        name: variation.name || `Variation ${index + 1}`,
        description: variation.description || '',
        design: variation.design || {},
        hypothesis: variationsData.hypotheses?.[index] || '',
        implementation: variationsData.implementation_details?.[index] || '',
        expectedImprovement: variation.expected_improvement || 0,
        confidence: variation.confidence || 0.5,
        status: 'draft'
      })) || []

      setVariations(newVariations)
      toast.success(`${newVariations.length} variations generated`)
    } catch (error) {
      toast.error('Failed to generate variations')
    } finally {
      setIsGeneratingVariations(false)
    }
  }, [projectId, selectedElement, websiteContent, websiteStyles, targetAudience, testGoals])

  const analyzeResults = useCallback(async (testData: any) => {
    if (!projectId) return

    setIsAnalyzingResults(true)
    try {
      const response = await fetch('/api/v1/ai/ab-testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'analyze_results',
          data: {
            testData,
            metrics: {
              conversionRate: true,
              userEngagement: true,
              bounceRate: true,
              timeOnPage: true
            },
            userBehavior: {},
            conversionData: {}
          }
        })
      })

      if (!response.ok) throw new Error('Failed to analyze results')

      const data = await response.json()
      const analysis = data.data.analysis

      // Convert analysis to results
      const testResults: TestResult[] = analysis.variation_results?.map((result: any) => ({
        variationId: result.variation_id,
        impressions: result.impressions || 0,
        conversions: result.conversions || 0,
        conversionRate: result.conversion_rate || 0,
        confidence: result.confidence || 0,
        improvement: result.improvement || 0,
        statisticalSignificance: result.statistical_significance || false,
        userEngagement: result.user_engagement || {},
        segmentPerformance: result.segment_performance || {}
      })) || []

      setResults(testResults)
      toast.success('Results analyzed successfully')
    } catch (error) {
      toast.error('Failed to analyze results')
    } finally {
      setIsAnalyzingResults(false)
    }
  }, [projectId])

  const predictOutcomes = useCallback(async (variationsData: TestVariation[]) => {
    if (!projectId) return

    setLoading(true)
    try {
      const response = await fetch('/api/v1/ai/ab-testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'predict_outcomes',
          data: {
            variations: variationsData,
            historicalData: {},
            marketConditions: {}
          }
        })
      })

      if (!response.ok) throw new Error('Failed to predict outcomes')

      const data = await response.json()
      setPredictions(data.data.predictions)
      toast.success('Outcome predictions generated')
    } catch (error) {
      toast.error('Failed to predict outcomes')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const generateInsights = useCallback(async (resultsData: TestResult[]) => {
    if (!projectId) return

    setLoading(true)
    try {
      const response = await fetch('/api/v1/ai/ab-testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'generate_insights',
          data: {
            results: resultsData,
            context: {
              project: projectId,
              element: selectedElement
            },
            businessObjectives: testGoals
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate insights')

      const data = await response.json()
      const insightsData = data.data.insights

      const newInsights: TestInsight[] = insightsData.insights?.map((insight: any, index: number) => ({
        id: `insight_${Date.now()}_${index}`,
        type: insight.type || 'user_behavior',
        title: insight.title || 'Insight',
        description: insight.description || '',
        impact: insight.impact || 'medium',
        confidence: insight.confidence || 0.5,
        recommendation: insight.recommendation || '',
        evidence: insight.evidence || []
      })) || []

      setInsights(newInsights)
      toast.success('Insights generated successfully')
    } catch (error) {
      toast.error('Failed to generate insights')
    } finally {
      setLoading(false)
    }
  }, [projectId, selectedElement, testGoals])

  const analyzeSegments = useCallback(async (resultsData: TestResult[]) => {
    if (!projectId) return

    setLoading(true)
    try {
      const response = await fetch('/api/v1/ai/ab-testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'segment_analysis',
          data: {
            testResults: resultsData,
            userSegments: ['desktop', 'mobile', 'tablet', 'new_users', 'returning_users'],
            segmentData: {}
          }
        })
      })

      if (!response.ok) throw new Error('Failed to analyze segments')

      const data = await response.json()
      const segmentData = data.data.segmentAnalysis

      const newSegmentAnalysis: SegmentAnalysis[] = segmentData.segments?.map((segment: any) => ({
        segment: segment.name,
        size: segment.size || 0,
        performance: segment.performance || {},
        insights: segment.insights || [],
        recommendations: segment.recommendations || []
      })) || []

      setSegmentAnalysis(newSegmentAnalysis)
      toast.success('Segment analysis completed')
    } catch (error) {
      toast.error('Failed to analyze segments')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const startTest = useCallback((variationId: string) => {
    setVariations(prev => 
      prev.map(v => v.id === variationId ? { ...v, status: 'active' } : v)
    )
    toast.success('Test started')
  }, [])

  const pauseTest = useCallback((variationId: string) => {
    setVariations(prev => 
      prev.map(v => v.id === variationId ? { ...v, status: 'paused' } : v)
    )
    toast.success('Test paused')
  }, [])

  const stopTest = useCallback((variationId: string) => {
    setVariations(prev => 
      prev.map(v => v.id === variationId ? { ...v, status: 'completed' } : v)
    )
    toast.success('Test stopped')
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI-Powered A/B Testing</h2>
          <p className="text-gray-600">Create, manage, and analyze intelligent A/B tests</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="element">Element to Test</Label>
              <Select value={selectedElement} onValueChange={setSelectedElement}>
                <SelectTrigger>
                  <SelectValue placeholder="Select element" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="headline">Headline</SelectItem>
                  <SelectItem value="cta_button">CTA Button</SelectItem>
                  <SelectItem value="hero_image">Hero Image</SelectItem>
                  <SelectItem value="color_scheme">Color Scheme</SelectItem>
                  <SelectItem value="layout">Layout</SelectItem>
                  <SelectItem value="form">Form Design</SelectItem>
                  <SelectItem value="navigation">Navigation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="audience">Target Audience</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Audience</SelectItem>
                  <SelectItem value="new_visitors">New Visitors</SelectItem>
                  <SelectItem value="returning_visitors">Returning Visitors</SelectItem>
                  <SelectItem value="mobile_users">Mobile Users</SelectItem>
                  <SelectItem value="desktop_users">Desktop Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="goals">Test Goals</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select goals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase_conversion">Increase Conversion</SelectItem>
                  <SelectItem value="improve_engagement">Improve Engagement</SelectItem>
                  <SelectItem value="reduce_bounce">Reduce Bounce Rate</SelectItem>
                  <SelectItem value="increase_time_on_page">Increase Time on Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button 
              onClick={generateVariations}
              disabled={isGeneratingVariations || !selectedElement}
              className="w-full"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isGeneratingVariations ? 'Generating Variations...' : 'Generate AI Variations'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="variations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="variations">Variations ({variations.length})</TabsTrigger>
          <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights ({insights.length})</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="variations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {variations.map((variation) => (
              <Card key={variation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{variation.name}</CardTitle>
                      <CardDescription>{variation.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(variation.status)}>
                      {variation.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Hypothesis</Label>
                      <p className="text-sm text-gray-600">{variation.hypothesis}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Expected Improvement</Label>
                        <p className="text-lg font-bold text-green-600">
                          {formatPercentage(variation.expectedImprovement)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Confidence</Label>
                        <p className="text-lg font-bold text-blue-600">
                          {formatPercentage(variation.confidence)}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {variation.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={() => startTest(variation.id)}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start Test
                        </Button>
                      )}
                      {variation.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => pauseTest(variation.id)}
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                      )}
                      {variation.status === 'paused' && (
                        <Button 
                          size="sm" 
                          onClick={() => startTest(variation.id)}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Resume
                        </Button>
                      )}
                      {(variation.status === 'active' || variation.status === 'paused') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => stopTest(variation.id)}
                        >
                          <Square className="w-3 h-3 mr-1" />
                          Stop
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => predictOutcomes([variation])}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Predict
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {variations.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Split className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No variations created yet</p>
                <Button onClick={generateVariations} disabled={!selectedElement}>
                  Generate First Variations
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test Results</CardTitle>
                  <CardDescription>
                    Performance metrics and statistical analysis
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => analyzeResults({})}
                  disabled={isAnalyzingResults || variations.length === 0}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {isAnalyzingResults ? 'Analyzing...' : 'Analyze Results'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {results.length > 0 ? (
                <div className="space-y-4">
                  {/* Results Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.reduce((sum, r) => sum + r.impressions, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Impressions</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPercentage(results.reduce((sum, r) => sum + r.conversionRate, 0) / results.length)}
                      </div>
                      <div className="text-sm text-gray-600">Avg Conversion Rate</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {results.filter(r => r.statisticalSignificance).length}
                      </div>
                      <div className="text-sm text-gray-600">Significant Results</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.max(...results.map(r => r.improvement)) > 0 ? '+' + formatPercentage(Math.max(...results.map(r => r.improvement))) : '0%'}
                      </div>
                      <div className="text-sm text-gray-600">Best Improvement</div>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div className="space-y-3">
                    {results.map((result) => {
                      const variation = variations.find(v => v.id === result.variationId)
                      return (
                        <div key={result.variationId} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">{variation?.name || 'Unknown Variation'}</h3>
                            <div className="flex items-center space-x-2">
                              {result.statisticalSignificance && (
                                <Badge className="bg-green-100 text-green-800">
                                  Significant
                                </Badge>
                              )}
                              {result.improvement > 0 && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  +{formatPercentage(result.improvement)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm text-gray-600">Impressions</div>
                              <div className="font-medium">{result.impressions.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Conversions</div>
                              <div className="font-medium">{result.conversions.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Conversion Rate</div>
                              <div className="font-medium">{formatPercentage(result.conversionRate)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Confidence</div>
                              <div className="font-medium">{formatPercentage(result.confidence)}</div>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t">
                            <div className="text-sm text-gray-600">User Engagement</div>
                            <div className="grid grid-cols-3 gap-4 mt-1">
                              <div>
                                <span className="text-xs">Time on Page:</span>
                                <span className="ml-1 font-medium">{result.userEngagement.timeOnPage}s</span>
                              </div>
                              <div>
                                <span className="text-xs">Bounce Rate:</span>
                                <span className="ml-1 font-medium">{formatPercentage(result.userEngagement.bounceRate)}</span>
                              </div>
                              <div>
                                <span className="text-xs">CTR:</span>
                                <span className="ml-1 font-medium">{formatPercentage(result.userEngagement.clickThroughRate)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No test results available</p>
                  <Button onClick={() => analyzeResults({})} disabled={variations.length === 0}>
                    Analyze Test Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI-Generated Insights</CardTitle>
                  <CardDescription>
                    Actionable insights from your test results
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => generateInsights(results)}
                  disabled={loading || results.length === 0}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Generate Insights
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                          <Badge variant="outline">
                            {insight.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          Confidence: {formatPercentage(insight.confidence)}
                        </div>
                      </div>
                      
                      <h3 className="font-medium mb-2">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      
                      <div className="bg-blue-50 p-3 rounded mb-3">
                        <h4 className="font-medium text-sm mb-1">Recommendation</h4>
                        <p className="text-sm text-blue-800">{insight.recommendation}</p>
                      </div>
                      
                      {insight.evidence.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Evidence</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {insight.evidence.map((evidence, index) => (
                              <li key={index}>• {evidence}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Generate insights from your test results</p>
                  <Button onClick={() => generateInsights(results)} disabled={results.length === 0}>
                    Generate Insights
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Segment Analysis</CardTitle>
                  <CardDescription>
                    Performance breakdown by user segments
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => analyzeSegments(results)}
                  disabled={loading || results.length === 0}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Analyze Segments
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {segmentAnalysis.length > 0 ? (
                <div className="space-y-4">
                  {segmentAnalysis.map((segment) => (
                    <div key={segment.segment} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{segment.segment.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                        <Badge variant="outline">
                          {segment.size.toLocaleString()} users
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        {Object.entries(segment.performance).map(([metric, value]) => (
                          <div key={metric}>
                            <div className="text-sm text-gray-600">{metric.replace('_', ' ')}</div>
                            <div className="font-medium">
                              {typeof value === 'number' ? formatPercentage(value) : value}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {segment.insights.length > 0 && (
                        <div className="mb-3">
                          <h4 className="font-medium text-sm mb-1">Insights</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {segment.insights.map((insight, index) => (
                              <li key={index}>• {insight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {segment.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Recommendations</h4>
                          <ul className="text-sm text-blue-600 space-y-1">
                            {segment.recommendations.map((recommendation, index) => (
                              <li key={index}>• {recommendation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Analyze performance by user segments</p>
                  <Button onClick={() => analyzeSegments(results)} disabled={results.length === 0}>
                    Analyze Segments
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Outcome Predictions</CardTitle>
              <CardDescription>
                AI-powered predictions for test performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictions ? (
                <div className="space-y-6">
                  {/* Predicted Performance */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Predicted Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatPercentage(predictions.expected_conversion_rate || 0)}
                        </div>
                        <div className="text-sm text-gray-600">Expected Conversion Rate</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPercentage(predictions.confidence_level || 0)}
                        </div>
                        <div className="text-sm text-gray-600">Confidence Level</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {predictions.success_probability ? formatPercentage(predictions.success_probability) : '0%'}
                        </div>
                        <div className="text-sm text-gray-600">Success Probability</div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  {predictions.risk_assessment && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Risk Assessment</h3>
                      <div className="space-y-2">
                        {predictions.risk_assessment.map((risk: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <span className="font-medium">{risk.risk}</span>
                              <div className="text-sm text-gray-500">{risk.mitigation}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                {risk.likelihood}
                              </Badge>
                              <Badge variant="outline">
                                {risk.impact}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {predictions.recommendations && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                      <div className="space-y-2">
                        {predictions.recommendations.map((recommendation: string, index: number) => (
                          <div key={index} className="p-3 bg-blue-50 rounded">
                            <p className="text-sm text-blue-800">• {recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Generate predictions for your test variations</p>
                  <Button onClick={() => predictOutcomes(variations)} disabled={variations.length === 0}>
                    Generate Predictions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}