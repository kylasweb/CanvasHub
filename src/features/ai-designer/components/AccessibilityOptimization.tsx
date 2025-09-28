"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Eye, 
  EyeOff, 
  Keyboard, 
  Monitor, 
  Contrast, 
  Type, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Zap,
  Download,
  RefreshCw,
  FileText,
  BarChart3,
  Palette,
  Accessibility,
  Filter,
  Search
} from 'lucide-react'

interface AccessibilityIssue {
  id: string
  type: string
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string
  element: string
  recommendation: string
  wcagGuideline: string
  status: 'open' | 'in_progress' | 'resolved'
}

interface AccessibilityScore {
  overall: number
  colorContrast: number
  keyboardNavigation: number
  screenReader: number
  formAccessibility: number
  multimedia: number
}

interface ColorOptimization {
  originalColors: Record<string, string>
  optimizedColors: Record<string, string>
  contrastImprovements: Array<{
    element: string
    before: number
    after: number
    status: 'improved' | 'degraded' | 'same'
  }>
}

interface AltTextSuggestion {
  imageUrl: string
  generatedAltText: string
  confidence: number
  alternatives: string[]
  description: string
}

interface AccessibilityOptimizationProps {
  projectId: string
  websiteContent: any
  websiteStyles: any
}

export default function AccessibilityOptimization({ projectId, websiteContent, websiteStyles }: AccessibilityOptimizationProps) {
  const [loading, setLoading] = useState(false)
  const [issues, setIssues] = useState<AccessibilityIssue[]>([])
  const [scores, setScores] = useState<AccessibilityScore | null>(null)
  const [colorOptimization, setColorOptimization] = useState<ColorOptimization | null>(null)
  const [altTextSuggestions, setAltTextSuggestions] = useState<AltTextSuggestion[]>([])
  const [navigationAnalysis, setNavigationAnalysis] = useState<any>(null)
  const [screenReaderOptimization, setScreenReaderOptimization] = useState<any>(null)
  const [accessibilityReport, setAccessibilityReport] = useState<any>(null)
  
  const [selectedIssue, setSelectedIssue] = useState<AccessibilityIssue | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const analyzeAccessibility = useCallback(async () => {
    if (!projectId) return

    setLoading(true)
    try {
      const response = await fetch('/api/v1/ai/accessibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'analyze_accessibility',
          data: {
            content: websiteContent,
            styles: websiteStyles,
            html: generateHTMLStructure(websiteContent, websiteStyles)
          }
        })
      })

      if (!response.ok) throw new Error('Failed to analyze accessibility')

      const data = await response.json()
      const analysis = data.data.analysis

      // Convert AI analysis to issues
      const accessibilityIssues: AccessibilityIssue[] = analysis.issues?.map((issue: any, index: number) => ({
        id: `issue_${Date.now()}_${index}`,
        type: issue.type || 'general',
        severity: issue.severity || 'moderate',
        description: issue.description || 'Accessibility issue detected',
        element: issue.element || 'Unknown element',
        recommendation: issue.recommendation || 'Review and fix',
        wcagGuideline: issue.wcagGuideline || 'WCAG 2.1',
        status: 'open'
      })) || []

      setIssues(accessibilityIssues)
      setScores(analysis.score || null)
      toast.success('Accessibility analysis completed')
    } catch (error) {
      toast.error('Failed to analyze accessibility')
    } finally {
      setLoading(false)
    }
  }, [projectId, websiteContent, websiteStyles])

  const generateAltText = useCallback(async (imageUrl: string, description: string, context: string) => {
    if (!projectId) return

    setLoading(true)
    try {
      const response = await fetch('/api/v1/ai/accessibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'generate_alt_text',
          data: {
            imageUrl,
            imageDescription: description,
            context
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate alt text')

      const data = await response.json()
      const altTextData = data.data.altText

      const newAltTextSuggestion: AltTextSuggestion = {
        imageUrl,
        generatedAltText: altTextData.alt_text || '',
        confidence: altTextData.confidence || 0,
        alternatives: altTextData.suggestions || [],
        description: altTextData.description || ''
      }

      setAltTextSuggestions(prev => [...prev, newAltTextSuggestion])
      toast.success('Alt text generated successfully')
    } catch (error) {
      toast.error('Failed to generate alt text')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const optimizeColors = useCallback(async (currentColors: Record<string, string>) => {
    if (!projectId) return

    setLoading(true)
    try {
      const response = await fetch('/api/v1/ai/accessibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'color_contrast_optimization',
          data: {
            currentColors,
            targetContrastRatio: 4.5
          }
        })
      })

      if (!response.ok) throw new Error('Failed to optimize colors')

      const data = await response.json()
      setColorOptimization(data.data.colorOptimization)
      toast.success('Color optimization completed')
    } catch (error) {
      toast.error('Failed to optimize colors')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const analyzeKeyboardNavigation = useCallback(async (navigationStructure: any, interactiveElements: any[]) => {
    if (!projectId) return

    setLoading(true)
    try {
      const response = await fetch('/api/v1/ai/accessibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'keyboard_navigation_analysis',
          data: {
            navigationStructure,
            interactiveElements
          }
        })
      })

      if (!response.ok) throw new Error('Failed to analyze keyboard navigation')

      const data = await response.json()
      setNavigationAnalysis(data.data.navigationAnalysis)
      toast.success('Keyboard navigation analysis completed')
    } catch (error) {
      toast.error('Failed to analyze keyboard navigation')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const optimizeScreenReader = useCallback(async (domStructure: any, currentARIA: any) => {
    if (!projectId) return

    setLoading(true)
    try {
      const response = await fetch('/api/v1/ai/accessibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'screen_reader_optimization',
          data: {
            domStructure,
            currentARIA
          }
        })
      })

      if (!response.ok) throw new Error('Failed to optimize screen reader')

      const data = await response.json()
      setScreenReaderOptimization(data.data.screenReaderOptimization)
      toast.success('Screen reader optimization completed')
    } catch (error) {
      toast.error('Failed to optimize screen reader')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const generateAccessibilityReport = useCallback(async (fullAnalysis: any, previousScores: any) => {
    if (!projectId) return

    setLoading(true)
    try {
      const response = await fetch('/api/v1/ai/accessibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          action: 'accessibility_report',
          data: {
            fullAnalysis,
            previousScores
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate accessibility report')

      const data = await response.json()
      setAccessibilityReport(data.data.accessibilityReport)
      toast.success('Accessibility report generated')
    } catch (error) {
      toast.error('Failed to generate accessibility report')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const updateIssueStatus = useCallback((issueId: string, status: 'open' | 'in_progress' | 'resolved') => {
    setIssues(prev => 
      prev.map(issue => 
        issue.id === issueId ? { ...issue, status } : issue
      )
    )
    toast.success(`Issue marked as ${status}`)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'serious': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'open': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const filteredIssues = issues.filter(issue => {
    const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity
    const matchesType = filterType === 'all' || issue.type === filterType
    const matchesSearch = issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.element.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSeverity && matchesType && matchesSearch
  })

  const generateHTMLStructure = (content: any, styles: any) => {
    // Simple HTML structure generation for analysis
    return `
      <html>
        <head>
          <style>${JSON.stringify(styles)}</style>
        </head>
        <body>
          ${JSON.stringify(content)}
        </body>
      </html>
    `
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Accessibility Optimization</h2>
          <p className="text-gray-600">AI-powered accessibility analysis and optimization</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={analyzeAccessibility}
            disabled={loading}
          >
            <Accessibility className="w-4 h-4 mr-2" />
            Analyze Accessibility
          </Button>
          <Button 
            variant="outline"
            onClick={() => generateAccessibilityReport({ issues, scores }, {})}
            disabled={loading || !issues.length}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Accessibility Score Overview */}
      {scores && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Accessibility Score Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(scores.overall)}`}>
                  {scores.overall}
                </div>
                <div className="text-sm text-gray-600">Overall</div>
                <Progress value={scores.overall} className="mt-2" />
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(scores.colorContrast)}`}>
                  {scores.colorContrast}
                </div>
                <div className="text-sm text-gray-600">Color Contrast</div>
                <Progress value={scores.colorContrast} className="mt-2" />
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(scores.keyboardNavigation)}`}>
                  {scores.keyboardNavigation}
                </div>
                <div className="text-sm text-gray-600">Keyboard Nav</div>
                <Progress value={scores.keyboardNavigation} className="mt-2" />
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(scores.screenReader)}`}>
                  {scores.screenReader}
                </div>
                <div className="text-sm text-gray-600">Screen Reader</div>
                <Progress value={scores.screenReader} className="mt-2" />
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(scores.formAccessibility)}`}>
                  {scores.formAccessibility}
                </div>
                <div className="text-sm text-gray-600">Forms</div>
                <Progress value={scores.formAccessibility} className="mt-2" />
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(scores.multimedia)}`}>
                  {scores.multimedia}
                </div>
                <div className="text-sm text-gray-600">Multimedia</div>
                <Progress value={scores.multimedia} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues">Issues ({filteredIssues.length})</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search issues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <select
                    id="severity"
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="critical">Critical</option>
                    <option value="serious">Serious</option>
                    <option value="moderate">Moderate</option>
                    <option value="minor">Minor</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="color">Color</option>
                    <option value="keyboard">Keyboard</option>
                    <option value="screen_reader">Screen Reader</option>
                    <option value="form">Form</option>
                    <option value="multimedia">Multimedia</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accessibility Issues</CardTitle>
              <CardDescription>
                {filteredIssues.length} issues found ({issues.filter(i => i.status === 'resolved').length} resolved)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredIssues.map((issue) => (
                    <div key={issue.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          {issue.status === 'open' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateIssueStatus(issue.id, 'in_progress')}
                            >
                              Start Fix
                            </Button>
                          )}
                          {issue.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => updateIssueStatus(issue.id, 'resolved')}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                      <h4 className="font-medium mb-2">{issue.description}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Element:</strong> {issue.element}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>WCAG:</strong> {issue.wcagGuideline}
                      </p>
                      <p className="text-sm text-blue-600">
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Color Contrast Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => optimizeColors(websiteStyles?.colors || {})}
                  disabled={loading}
                  className="w-full mb-4"
                >
                  <Contrast className="w-4 h-4 mr-2" />
                  Optimize Colors
                </Button>
                {colorOptimization && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Contrast Improvements</h4>
                    {colorOptimization.contrastImprovements.map((improvement, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{improvement.element}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{improvement.before.toFixed(1)} → {improvement.after.toFixed(1)}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            improvement.status === 'improved' ? 'bg-green-500' : 
                            improvement.status === 'degraded' ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alt Text Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Alt Text Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      placeholder="Enter image URL..."
                      className="mb-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the image..."
                      className="mb-2"
                    />
                  </div>
                  <Button 
                    onClick={() => generateAltText('', '', 'website')}
                    disabled={loading}
                    className="w-full"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Alt Text
                  </Button>
                </div>
                {altTextSuggestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Generated Alt Text</h4>
                    {altTextSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium">{suggestion.generatedAltText}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Keyboard Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Keyboard className="w-5 h-5 mr-2" />
                  Keyboard Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => analyzeKeyboardNavigation(websiteContent, [])}
                  disabled={loading}
                  className="w-full mb-4"
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  Analyze Navigation
                </Button>
                {navigationAnalysis && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Navigation Score:</span>
                      <span className={`font-medium ${getScoreColor(navigationAnalysis.accessibility_score)}`}>
                        {navigationAnalysis.accessibility_score}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {navigationAnalysis.issues?.length || 0} issues found
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Screen Reader Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  Screen Reader Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => optimizeScreenReader(websiteContent, {})}
                  disabled={loading}
                  className="w-full mb-4"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Optimize for Screen Readers
                </Button>
                {screenReaderOptimization && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Screen Reader Score:</span>
                      <span className={`font-medium ${getScoreColor(screenReaderOptimization.accessibility_score)}`}>
                        {screenReaderOptimization.accessibility_score}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {screenReaderOptimization.issues?.length || 0} issues found
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Color Contrast Checker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="foregroundColor">Foreground Color</Label>
                    <Input id="foregroundColor" type="color" className="h-10" />
                  </div>
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <Input id="backgroundColor" type="color" className="h-10" />
                  </div>
                  <Button className="w-full">Check Contrast</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Heading Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Analyze your heading hierarchy for proper structure
                  </div>
                  <Button className="w-full">Analyze Headings</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Form Accessibility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Check forms for proper labels and accessibility
                  </div>
                  <Button className="w-full">Check Forms</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Accessibility Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              {accessibilityReport ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Executive Summary</h3>
                    <p className="text-sm text-gray-600">{accessibilityReport.executive_summary}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Critical Issues</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {accessibilityReport.critical_issues?.map((issue: string, index: number) => (
                        <li key={index}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Next Steps</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {accessibilityReport.next_steps?.map((step: string, index: number) => (
                        <li key={index}>• {step}</li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Full Report
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Generate a comprehensive accessibility report</p>
                  <Button onClick={() => generateAccessibilityReport({ issues, scores }, {})}>
                    Generate Report
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