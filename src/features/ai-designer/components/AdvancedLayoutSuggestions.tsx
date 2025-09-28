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
import { Layout, Zap, Eye, Users, Target, TrendingUp, RefreshCw } from 'lucide-react'

interface AdvancedLayoutRequest {
  contentData: Record<string, any>
  pageType: string
  industryType?: string
  preferences?: {
    layoutStyle: 'modern' | 'classic' | 'minimal' | 'creative'
    colorScheme?: string[]
  }
  advancedOptions?: {
    contentPriority: 'conversion' | 'engagement' | 'information' | 'branding'
    userFlowOptimization: boolean
    accessibilityCompliance: boolean
    performanceOptimization: boolean
  }
}

interface AdvancedLayoutResponse {
  suggestedLayout: {
    sections: Array<{
      type: string
      position: { x: number; y: number; width: number; height: number }
      content: Record<string, any>
      styles: Record<string, any>
      priority: 'high' | 'medium' | 'low'
      interactions: Array<{
        type: 'click' | 'hover' | 'scroll' | 'form'
        trigger: string
        action: string
      }>
    }>
    overallStructure: string
    gridSystem: {
      columns: number
      gap: number
      breakpoints: Record<string, any>
    }
    contentHierarchy: Array<{
      level: number
      element: string
      purpose: string
    }>
    userFlow: Array<{
      step: number
      element: string
      action: string
      expectedOutcome: string
    }>
  }
  reasoning: string
  confidence: number
  processingTime: number
  optimizationMetrics: {
    conversionPotential: number
    engagementScore: number
    accessibilityScore: number
    performanceScore: number
  }
}

export default function AdvancedLayoutSuggestions() {
  const [request, setRequest] = useState<AdvancedLayoutRequest>({
    contentData: {},
    pageType: 'homepage',
    industryType: '',
    preferences: {
      layoutStyle: 'modern',
      colorScheme: []
    },
    advancedOptions: {
      contentPriority: 'conversion',
      userFlowOptimization: true,
      accessibilityCompliance: true,
      performanceOptimization: true
    }
  })

  const [response, setResponse] = useState<AdvancedLayoutResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [contentJson, setContentJson] = useState('{}')

  const pageTypes = [
    'homepage', 'product', 'service', 'about', 'contact', 'blog', 'portfolio', 'pricing'
  ]

  const industryTypes = [
    'tech', 'healthcare', 'finance', 'retail', 'education', 'real estate', 'hospitality', 'manufacturing'
  ]

  const layoutStyles = [
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'creative', label: 'Creative' }
  ]

  const contentPriorities = [
    { value: 'conversion', label: 'Conversion Focused' },
    { value: 'engagement', label: 'Engagement Focused' },
    { value: 'information', label: 'Information Focused' },
    { value: 'branding', label: 'Branding Focused' }
  ]

  const generateLayout = async () => {
    try {
      setLoading(true)
      
      // Parse content data from JSON input
      let contentData = {}
      try {
        contentData = JSON.parse(contentJson)
      } catch (error) {
        alert('Invalid JSON in content data. Please check your syntax.')
        return
      }

      const response = await fetch('/api/v1/ai/advanced-layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user',
          ...request,
          contentData
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate layout suggestions')
      }

      const data = await response.json()
      setResponse(data)
    } catch (error) {
      console.error('Error generating layout:', error)
      alert('Failed to generate layout suggestions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Layout Suggestions</h1>
        <p className="text-muted-foreground">
          AI-powered layout optimization with content hierarchy, user flow analysis, and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Layout Configuration
            </CardTitle>
            <CardDescription>
              Configure your layout requirements and content structure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Page Type</label>
              <Select
                value={request.pageType}
                onValueChange={(value) => setRequest(prev => ({ ...prev, pageType: value }))}
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
              <label className="text-sm font-medium mb-2 block">Industry Type</label>
              <Select
                value={request.industryType || ''}
                onValueChange={(value) => setRequest(prev => ({ ...prev, industryType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industryTypes.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry.charAt(0).toUpperCase() + industry.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Layout Style</label>
              <Select
                value={request.preferences?.layoutStyle || 'modern'}
                onValueChange={(value) => setRequest(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences!, layoutStyle: value as any }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {layoutStyles.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Content Priority</label>
              <Select
                value={request.advancedOptions?.contentPriority || 'conversion'}
                onValueChange={(value) => setRequest(prev => ({
                  ...prev,
                  advancedOptions: { ...prev.advancedOptions!, contentPriority: value as any }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentPriorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Content Data (JSON)</label>
              <Textarea
                value={contentJson}
                onChange={(e) => setContentJson(e.target.value)}
                placeholder={`{\n  "hero": {\n    "title": "Welcome to Our Platform",\n    "subtitle": "Discover amazing features"\n  },\n  "features": [\n    "Feature 1",\n    "Feature 2"\n  ]\n}`}
                className="min-h-[120px] font-mono text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Advanced Options</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={request.advancedOptions?.userFlowOptimization}
                    onChange={(e) => setRequest(prev => ({
                      ...prev,
                      advancedOptions: { ...prev.advancedOptions!, userFlowOptimization: e.target.checked }
                    }))}
                  />
                  <span className="text-sm">User Flow Optimization</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={request.advancedOptions?.accessibilityCompliance}
                    onChange={(e) => setRequest(prev => ({
                      ...prev,
                      advancedOptions: { ...prev.advancedOptions!, accessibilityCompliance: e.target.checked }
                    }))}
                  />
                  <span className="text-sm">Accessibility Compliance</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={request.advancedOptions?.performanceOptimization}
                    onChange={(e) => setRequest(prev => ({
                      ...prev,
                      advancedOptions: { ...prev.advancedOptions!, performanceOptimization: e.target.checked }
                    }))}
                  />
                  <span className="text-sm">Performance Optimization</span>
                </label>
              </div>
            </div>

            <Button 
              onClick={generateLayout} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Layout...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Advanced Layout
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Layout Analysis
            </CardTitle>
            <CardDescription>
              AI-generated layout suggestions with optimization metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="flow">User Flow</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(response.confidence * 100)}%</div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{response.processingTime}ms</div>
                      <div className="text-sm text-muted-foreground">Processing Time</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Overall Structure</h4>
                    <p className="text-sm text-muted-foreground">{response.suggestedLayout.overallStructure}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Grid System</h4>
                    <div className="text-sm text-muted-foreground">
                      {response.suggestedLayout.gridSystem.columns} columns, {response.suggestedLayout.gridSystem.gap}px gap
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">AI Reasoning</h4>
                    <p className="text-sm text-muted-foreground">{response.reasoning}</p>
                  </div>
                </TabsContent>

                <TabsContent value="sections" className="space-y-4">
                  <div className="space-y-3">
                    {response.suggestedLayout.sections.map((section, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{section.type}</h4>
                          <Badge className={getPriorityColor(section.priority)}>
                            {section.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Position: {section.position.x}x{section.position.y}, Size: {section.position.width}x{section.position.height}
                        </div>
                        {section.interactions.length > 0 && (
                          <div>
                            <h5 className="text-xs font-medium mb-1">Interactions:</h5>
                            <div className="text-xs text-muted-foreground">
                              {section.interactions.map((interaction, i) => (
                                <div key={i}>{interaction.type}: {interaction.action}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Conversion Potential</span>
                        <span className={`text-sm font-medium ${getScoreColor(response.optimizationMetrics.conversionPotential)}`}>
                          {response.optimizationMetrics.conversionPotential}%
                        </span>
                      </div>
                      <Progress value={response.optimizationMetrics.conversionPotential} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Engagement Score</span>
                        <span className={`text-sm font-medium ${getScoreColor(response.optimizationMetrics.engagementScore)}`}>
                          {response.optimizationMetrics.engagementScore}%
                        </span>
                      </div>
                      <Progress value={response.optimizationMetrics.engagementScore} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Accessibility Score</span>
                        <span className={`text-sm font-medium ${getScoreColor(response.optimizationMetrics.accessibilityScore)}`}>
                          {response.optimizationMetrics.accessibilityScore}%
                        </span>
                      </div>
                      <Progress value={response.optimizationMetrics.accessibilityScore} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Performance Score</span>
                        <span className={`text-sm font-medium ${getScoreColor(response.optimizationMetrics.performanceScore)}`}>
                          {response.optimizationMetrics.performanceScore}%
                        </span>
                      </div>
                      <Progress value={response.optimizationMetrics.performanceScore} className="h-2" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="flow" className="space-y-4">
                  <div className="space-y-3">
                    {response.suggestedLayout.userFlow.map((flow, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{flow.step}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{flow.element}</div>
                          <div className="text-sm text-muted-foreground">{flow.action}</div>
                          <div className="text-xs text-muted-foreground">{flow.expectedOutcome}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Configure your layout settings and click "Generate Advanced Layout" to see AI-powered suggestions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}