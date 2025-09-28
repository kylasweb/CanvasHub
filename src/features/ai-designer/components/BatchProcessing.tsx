"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  RefreshCw, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  FileText,
  Layout,
  Palette,
  TrendingUp,
  Image as ImageIcon,
  Download,
  Upload,
  Settings,
  AlertTriangle
} from 'lucide-react'

interface BatchOperation {
  id: string
  type: 'content_generation' | 'layout_suggestion' | 'color_palette' | 'seo_optimization' | 'image_enhancement'
  data: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
  error?: string
  processingTime?: number
  cost?: number
}

interface BatchProcessingProps {
  userId: string
}

export default function BatchProcessing({ userId }: BatchProcessingProps) {
  const [operations, setOperations] = useState<BatchOperation[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [batchResults, setBatchResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal')
  const [webhookUrl, setWebhookUrl] = useState('')

  const operationTypes = [
    { value: 'content_generation', label: 'Content Generation', icon: <FileText className="w-4 h-4" /> },
    { value: 'layout_suggestion', label: 'Layout Suggestion', icon: <Layout className="w-4 h-4" /> },
    { value: 'color_palette', label: 'Color Palette', icon: <Palette className="w-4 h-4" /> },
    { value: 'seo_optimization', label: 'SEO Optimization', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'image_enhancement', label: 'Image Enhancement', icon: <ImageIcon className="w-4 h-4" /> }
  ]

  const addOperation = (type: string, data: any) => {
    const newOperation: BatchOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: type as any,
      data,
      status: 'pending'
    }
    setOperations(prev => [...prev, newOperation])
  }

  const removeOperation = (id: string) => {
    setOperations(prev => prev.filter(op => op.id !== id))
  }

  const processBatch = async () => {
    if (operations.length === 0) {
      setError('No operations to process')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/ai/batch-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operations: operations.map(op => ({
            id: op.id,
            type: op.type,
            data: op.data
          })),
          priority,
          webhookUrl: webhookUrl || undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process batch')
      }

      const result = await response.json()
      setBatchResults(result)

      // Update operation statuses
      setOperations(prev => prev.map(op => {
        const resultOp = result.results.find((r: any) => r.id === op.id)
        if (resultOp) {
          return {
            ...op,
            status: resultOp.success ? 'completed' : 'failed',
            result: resultOp.data,
            error: resultOp.error,
            processingTime: resultOp.processingTime,
            cost: resultOp.cost
          }
        }
        return op
      }))

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsProcessing(false)
    }
  }

  const clearOperations = () => {
    setOperations([])
    setBatchResults(null)
    setError(null)
  }

  const exportResults = () => {
    if (!batchResults) return

    const dataStr = JSON.stringify(batchResults, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `batch-results-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getOperationIcon = (type: string) => {
    const opType = operationTypes.find(t => t.value === type)
    return opType?.icon || <Zap className="w-4 h-4" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'processing':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-primary" />
            AI Batch Processing
          </h2>
          <p className="text-gray-600">
            Process multiple AI operations simultaneously for maximum efficiency
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={processBatch} 
            disabled={isProcessing || operations.length === 0}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Process Batch
              </>
            )}
          </Button>
          <Button variant="outline" onClick={clearOperations}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Batch Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Batch Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Processing Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="normal">Normal Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook">Webhook URL (Optional)</Label>
              <Input
                id="webhook"
                placeholder="https://your-webhook-url.com"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Operations Queue</Label>
              <div className="p-3 border rounded-md">
                <span className="text-lg font-semibold">{operations.length}</span>
                <span className="text-sm text-gray-600 ml-2">operations pending</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Operations */}
        <Card>
          <CardHeader>
            <CardTitle>Add Operations</CardTitle>
            <CardDescription>
              Select operations to add to the batch queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                {operationTypes.map(type => (
                  <TabsTrigger key={type.value} value={type.value.split('_')[0]} className="text-xs">
                    {type.icon}
                    <span className="ml-1 hidden sm:inline">{type.label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="business-type">Business Type</Label>
                    <Input id="business-type" placeholder="e.g., Technology, Healthcare" />
                  </div>
                  <div>
                    <Label htmlFor="target-audience">Target Audience</Label>
                    <Input id="target-audience" placeholder="e.g., Young professionals, Families" />
                  </div>
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Input id="topic" placeholder="e.g., Product launch, Company overview" />
                  </div>
                  <Button 
                    onClick={() => addOperation('content_generation', {
                      businessType: (document.getElementById('business-type') as HTMLInputElement)?.value,
                      targetAudience: (document.getElementById('target-audience') as HTMLInputElement)?.value,
                      topic: (document.getElementById('topic') as HTMLInputElement)?.value
                    })}
                    className="w-full"
                  >
                    Add Content Generation
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="page-type">Page Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select page type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="landing">Landing Page</SelectItem>
                        <SelectItem value="home">Home Page</SelectItem>
                        <SelectItem value="about">About Page</SelectItem>
                        <SelectItem value="contact">Contact Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="layout-style">Layout Style</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={() => addOperation('layout_suggestion', {
                      pageType: 'landing',
                      layoutStyle: 'modern'
                    })}
                    className="w-full"
                  >
                    Add Layout Suggestion
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="color" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" placeholder="e.g., Technology, Fashion, Finance" />
                  </div>
                  <div>
                    <Label htmlFor="style-pref">Style Preference</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vibrant">Vibrant</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                        <SelectItem value="cool">Cool</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={() => addOperation('color_palette', {
                      industry: (document.getElementById('industry') as HTMLInputElement)?.value,
                      stylePreference: 'modern'
                    })}
                    className="w-full"
                  >
                    Add Color Palette
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea id="content" placeholder="Enter content to optimize..." rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                    <Input id="keywords" placeholder="e.g., web design, development, SEO" />
                  </div>
                  <Button 
                    onClick={() => addOperation('seo_optimization', {
                      content: (document.getElementById('content') as HTMLTextAreaElement)?.value,
                      keywords: (document.getElementById('keywords') as HTMLInputElement)?.value?.split(',').map(k => k.trim())
                    })}
                    className="w-full"
                  >
                    Add SEO Optimization
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input id="image-url" placeholder="https://example.com/image.jpg" />
                  </div>
                  <div>
                    <Label htmlFor="enhancement-type">Enhancement Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select enhancement type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quality_enhancement">Quality Enhancement</SelectItem>
                        <SelectItem value="color_correction">Color Correction</SelectItem>
                        <SelectItem value="background_removal">Background Removal</SelectItem>
                        <SelectItem value="upscaling">Image Upscaling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={() => addOperation('image_enhancement', {
                      imageUrl: (document.getElementById('image-url') as HTMLInputElement)?.value,
                      enhancementType: 'quality_enhancement'
                    })}
                    className="w-full"
                  >
                    Add Image Enhancement
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Operations Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Operations Queue</CardTitle>
            <CardDescription>
              Current operations in the batch queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {operations.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Operations Added</h3>
                <p className="text-gray-600 mb-4">
                  Add operations from the left panel to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {operations.map((operation) => (
                  <div key={operation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getOperationIcon(operation.type)}
                      <div>
                        <p className="font-medium">
                          {operationTypes.find(t => t.value === operation.type)?.label}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {operation.id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(operation.status)}>
                        {getStatusIcon(operation.status)}
                        <span className="ml-1 capitalize">{operation.status}</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOperation(operation.id)}
                        disabled={operation.status === 'processing'}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {batchResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Batch Processing Results</CardTitle>
                <CardDescription>
                  Batch ID: {batchResults.batchId}
                </CardDescription>
              </div>
              <Button onClick={exportResults} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{batchResults.summary.totalOperations}</div>
                <div className="text-sm text-gray-600">Total Operations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{batchResults.summary.successCount}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{batchResults.summary.failureCount}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{batchResults.summary.successRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">${batchResults.summary.totalCost.toFixed(4)}</div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Operation Details</h4>
              {batchResults.results.map((result: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getOperationIcon(result.type)}
                    <div>
                      <p className="font-medium">
                        {operationTypes.find(t => t.value === result.type)?.label}
                      </p>
                      <p className="text-sm text-gray-500">
                        {result.processingTime}ms • ${result.cost?.toFixed(4) || '0.0000'}
                      </p>
                    </div>
                  </div>
                  <Badge className={result.success ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}>
                    {result.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Processing Error</h3>
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={processBatch} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}