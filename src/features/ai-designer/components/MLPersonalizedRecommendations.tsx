'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Brain, Target, Users, TrendingUp, RefreshCw, Lightbulb, BarChart3, GitBranch } from 'lucide-react'

interface MLPersonalizedSuggestionRequest {
  currentPage: string
  userHistory: boolean
  businessGoals: string[]
  userPreferences?: {
    writingStyle?: string
    colorScheme?: string
    industryExpertise?: string[]
  }
  mlOptions?: {
    behavioralAnalysis: boolean
    predictiveModeling: boolean
    collaborativeFiltering: boolean
    contentBasedFiltering: boolean
  }
  contextData?: {
    sessionDuration?: number
    pagesVisited?: string[]
    interactionsCount?: number
    deviceType?: string
    timeOfDay?: string
  }
}

interface MLPersonalizedSuggestionResponse {
  suggestions: Array<{
    type: string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    confidence: number
    reasoning: string
    expectedImpact: {
      conversion: number
      engagement: number
      satisfaction: number
    }
    implementationComplexity: 'low' | 'medium' | 'high'
    category: 'content' | 'design' | 'functionality' | 'performance' | 'accessibility'
    tags: string[]
  }>
  reasoning: string
  processingTime: number
  mlInsights: {
    behavioralPatterns: Array<{
      pattern: string
      frequency: number
      significance: number
    }>
    predictiveScores: {
      conversionProbability: number
      engagementProbability: number
      retentionProbability: number
    }
    userSegments: string[]
    recommendationAccuracy: number
  }
  aBTestingSuggestions?: Array<{
    variantA: string
    variantB: string
    hypothesis: string
    successMetrics: string[]
  }>
}

export default function MLPersonalizedRecommendations() {
  const [request, setRequest] = useState<MLPersonalizedSuggestionRequest>({
    currentPage: 'homepage',
    userHistory: true,
    businessGoals: ['increase_conversion', 'improve_engagement'],
    userPreferences: {
      writingStyle: 'professional',
      colorScheme: 'modern',
      industryExpertise: ['technology', 'design']
    },
    mlOptions: {
      behavioralAnalysis: true,
      predictiveModeling: true,
      collaborativeFiltering: true,
      contentBasedFiltering: true
    },
    contextData: {
      sessionDuration: 450,
      pagesVisited: ['homepage', 'products', 'about'],
      interactionsCount: 12,
      deviceType: 'desktop',
      timeOfDay: 'afternoon'
    }
  })

  const [response, setResponse] = useState<MLPersonalizedSuggestionResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const pageTypes = [
    'homepage', 'product', 'service', 'about', 'contact', 'blog', 'portfolio', 'pricing', 'checkout'
  ]

  const businessGoals = [
    'increase_conversion', 'improve_engagement', 'boost_retention', 'enhance_user_experience', 
    'reduce_bounce_rate', 'increase_page_views', 'improve_mobile_experience', 'optimize_performance'
  ]

  const writingStyles = [
    'formal', 'casual', 'professional', 'friendly', 'technical', 'conversational'
  ]

  const colorSchemes = [
    'modern', 'classic', 'minimal', 'creative', 'corporate', 'vibrant', 'pastel'
  ]

  const industryExpertise = [
    'technology', 'healthcare', 'finance', 'retail', 'education', 'real estate', 
    'hospitality', 'manufacturing', 'consulting', 'media'
  ]

  const deviceTypes = [
    'desktop', 'mobile', 'tablet', 'smart_tv', 'wearable'
  ]

  const timeOfDayOptions = [
    'morning', 'afternoon', 'evening', 'night'
  ]

  const generateRecommendations = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/v1/ai/ml-recommendations', {
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
        throw new Error('Failed to generate ML recommendations')
      }

      const data = await response.json()
      setResponse(data)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      alert('Failed to generate ML recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content': return '📝'
      case 'design': return '🎨'
      case 'functionality': return '⚙️'
      case 'performance': return '🚀'
      case 'accessibility': return '♿'
      default: return '💡'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ML-Powered Personalized Recommendations</h1>
        <p className="text-muted-foreground">
          Advanced machine learning system for personalized suggestions with behavioral analysis and predictive modeling
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                ML Configuration
              </CardTitle>
              <CardDescription>
                Configure ML algorithms and user context
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              <div>
                <label className="text-sm font-medium mb-2 block">Current Page</label>
                <Select
                  value={request.currentPage}
                  onValueChange={(value) => setRequest(prev => ({ ...prev, currentPage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Business Goals</label>
                <div className="space-y-2">
                  {businessGoals.map(goal => (
                    <label key={goal} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={request.businessGoals.includes(goal)}
                        onChange={(e) => {
                          const goals = e.target.checked 
                            ? [...request.businessGoals, goal]
                            : request.businessGoals.filter(g => g !== goal)
                          setRequest(prev => ({ ...prev, businessGoals: goals }))
                        }}
                      />
                      <span className="text-sm">{goal.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">User Preferences</label>
                <div className="space-y-3">
                  <div>
                    <Select
                      value={request.userPreferences?.writingStyle || ''}
                      onValueChange={(value) => setRequest(prev => ({
                        ...prev,
                        userPreferences: { ...prev.userPreferences!, writingStyle: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Writing style" />
                      </SelectTrigger>
                      <SelectContent>
                        {writingStyles.map(style => (
                          <SelectItem key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Select
                      value={request.userPreferences?.colorScheme || ''}
                      onValueChange={(value) => setRequest(prev => ({
                        ...prev,
                        userPreferences: { ...prev.userPreferences!, colorScheme: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Color scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorSchemes.map(scheme => (
                          <SelectItem key={scheme} value={scheme}>
                            {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">ML Options</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="behavioral-analysis" className="text-sm">Behavioral Analysis</Label>
                    <Switch
                      id="behavioral-analysis"
                      checked={request.mlOptions?.behavioralAnalysis}
                      onCheckedChange={(checked) => setRequest(prev => ({
                        ...prev,
                        mlOptions: { ...prev.mlOptions!, behavioralAnalysis: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="predictive-modeling" className="text-sm">Predictive Modeling</Label>
                    <Switch
                      id="predictive-modeling"
                      checked={request.mlOptions?.predictiveModeling}
                      onCheckedChange={(checked) => setRequest(prev => ({
                        ...prev,
                        mlOptions: { ...prev.mlOptions!, predictiveModeling: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="collaborative-filtering" className="text-sm">Collaborative Filtering</Label>
                    <Switch
                      id="collaborative-filtering"
                      checked={request.mlOptions?.collaborativeFiltering}
                      onCheckedChange={(checked) => setRequest(prev => ({
                        ...prev,
                        mlOptions: { ...prev.mlOptions!, collaborativeFiltering: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content-based-filtering" className="text-sm">Content-Based Filtering</Label>
                    <Switch
                      id="content-based-filtering"
                      checked={request.mlOptions?.contentBasedFiltering}
                      onCheckedChange={(checked) => setRequest(prev => ({
                        ...prev,
                        mlOptions: { ...prev.mlOptions!, contentBasedFiltering: checked }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Context Data</label>
                <div className="space-y-3">
                  <div>
                    <Input
                      type="number"
                      value={request.contextData?.sessionDuration || ''}
                      onChange={(e) => setRequest(prev => ({
                        ...prev,
                        contextData: { ...prev.contextData!, sessionDuration: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="Session duration (seconds)"
                    />
                  </div>
                  
                  <div>
                    <Select
                      value={request.contextData?.deviceType || ''}
                      onValueChange={(value) => setRequest(prev => ({
                        ...prev,
                        contextData: { ...prev.contextData!, deviceType: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Device type" />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceTypes.map(device => (
                          <SelectItem key={device} value={device}>
                            {device.charAt(0).toUpperCase() + device.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={request.contextData?.timeOfDay || ''}
                      onValueChange={(value) => setRequest(prev => ({
                        ...prev,
                        contextData: { ...prev.contextData!, timeOfDay: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Time of day" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOfDayOptions.map(time => (
                          <SelectItem key={time} value={time}>
                            {time.charAt(0).toUpperCase() + time.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                onClick={generateRecommendations} 
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
                    Generate Recommendations
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                ML Insights & Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered personalized suggestions with behavioral analysis and predictive modeling
              </CardDescription>
            </CardHeader>
            <CardContent>
              {response ? (
                <Tabs defaultValue="recommendations" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    <TabsTrigger value="insights">ML Insights</TabsTrigger>
                    <TabsTrigger value="predictions">Predictions</TabsTrigger>
                    <TabsTrigger value="testing">A/B Testing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="recommendations" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {response.suggestions.map((suggestion, index) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getCategoryIcon(suggestion.category)}</span>
                                <h4 className="font-medium">{suggestion.title}</h4>
                              </div>
                              <div className="flex space-x-2">
                                <Badge className={getPriorityColor(suggestion.priority)}>
                                  {suggestion.priority}
                                </Badge>
                                <Badge variant="outline">
                                  {suggestion.confidence.toFixed(0)}% confidence
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {suggestion.description}
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div>
                                <div className="text-xs text-muted-foreground">Conversion Impact</div>
                                <div className={`text-sm font-medium ${getScoreColor(suggestion.expectedImpact.conversion)}`}>
                                  {(suggestion.expectedImpact.conversion * 100).toFixed(0)}%
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Engagement Impact</div>
                                <div className={`text-sm font-medium ${getScoreColor(suggestion.expectedImpact.engagement)}`}>
                                  {(suggestion.expectedImpact.engagement * 100).toFixed(0)}%
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Complexity</div>
                                <div className={`text-sm font-medium ${getComplexityColor(suggestion.implementationComplexity)}`}>
                                  {suggestion.implementationComplexity}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {suggestion.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Behavioral Patterns</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {response.mlInsights.behavioralPatterns.map((pattern, index) => (
                              <div key={index}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{pattern.pattern}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(pattern.frequency * 100)}% freq
                                  </span>
                                </div>
                                <Progress value={pattern.significance * 100} className="h-2" />
                                <div className="text-xs text-muted-foreground">
                                  Significance: {Math.round(pattern.significance * 100)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">User Segments</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {response.mlInsights.userSegments.map((segment, index) => (
                              <Badge key={index} variant="outline">
                                {segment}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Model Accuracy</span>
                              <span className={`text-sm font-medium ${getScoreColor(response.mlInsights.recommendationAccuracy)}`}>
                                {Math.round(response.mlInsights.recommendationAccuracy * 100)}%
                              </span>
                            </div>
                            <Progress value={response.mlInsights.recommendationAccuracy * 100} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="predictions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Predictive Scores</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(response.mlInsights.predictiveScores.conversionProbability)}`}>
                              {Math.round(response.mlInsights.predictiveScores.conversionProbability * 100)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Conversion Probability</div>
                            <Progress value={response.mlInsights.predictiveScores.conversionProbability * 100} className="h-2 mt-2" />
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(response.mlInsights.predictiveScores.engagementProbability)}`}>
                              {Math.round(response.mlInsights.predictiveScores.engagementProbability * 100)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Engagement Probability</div>
                            <Progress value={response.mlInsights.predictiveScores.engagementProbability * 100} className="h-2 mt-2" />
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(response.mlInsights.predictiveScores.retentionProbability)}`}>
                              {Math.round(response.mlInsights.predictiveScores.retentionProbability * 100)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Retention Probability</div>
                            <Progress value={response.mlInsights.predictiveScores.retentionProbability * 100} className="h-2 mt-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="testing" className="space-y-4">
                    {response.aBTestingSuggestions ? (
                      <div className="space-y-4">
                        {response.aBTestingSuggestions.map((test, index) => (
                          <Card key={index}>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <GitBranch className="h-5 w-5" />
                                A/B Test #{index + 1}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <h5 className="font-medium text-sm mb-2">Variant A</h5>
                                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                    {test.variantA}
                                  </div>
                                </div>
                                <div>
                                  <h5 className="font-medium text-sm mb-2">Variant B</h5>
                                  <div className="p-3 bg-green-50 rounded border border-green-200">
                                    {test.variantB}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm mb-2">Hypothesis</h5>
                                <p className="text-sm text-muted-foreground">{test.hypothesis}</p>
                              </div>
                              <div className="mt-3">
                                <h5 className="font-medium text-sm mb-2">Success Metrics</h5>
                                <div className="flex flex-wrap gap-1">
                                  {test.successMetrics.map((metric, metricIndex) => (
                                    <Badge key={metricIndex} variant="secondary" className="text-xs">
                                      {metric.replace(/_/g, ' ')}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Enable predictive modeling to generate A/B testing suggestions
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Configure ML settings and click "Generate Recommendations" to see AI-powered personalized suggestions
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