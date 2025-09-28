'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Image as ImageIcon, Zap, Eye, Users, Target, TrendingUp, RefreshCw, Upload, Download } from 'lucide-react'

interface AdvancedImageEnhancementRequest {
  imageUrl: string
  enhancementType: 'background_removal' | 'quality_enhancement' | 'color_correction' | 'style_transfer' | 'noise_reduction' | 'sharpening' | 'upscaling'
  style?: string
  intensity?: number
  advancedOptions?: {
    preserveDetails: boolean
    faceDetection: boolean
    colorGrading: boolean
    batchProcessing: boolean
  }
}

interface AdvancedImageEnhancementResponse {
  processedImageUrl: string
  enhancementDetails: {
    type: string
    changes: string[]
    qualityImprovement: number
    processingTechniques: string[]
    metadata: {
      originalSize: { width: number; height: number }
      processedSize: { width: number; height: number }
      format: string
      fileSize: { original: number; processed: number }
      colorProfile: string
    }
    faceDetectionResults?: {
      facesDetected: number
      confidence: number
      boundingBoxes: Array<{ x: number; y: number; width: number; height: number }>
    }
  }
  confidence: number
  processingTime: number
  recommendations: string[]
  batchResults?: Array<{
    imageUrl: string
    processedImageUrl: string
    success: boolean
    error?: string
  }>
}

export default function AdvancedImageEnhancement() {
  const [request, setRequest] = useState<AdvancedImageEnhancementRequest>({
    imageUrl: '',
    enhancementType: 'quality_enhancement',
    intensity: 0.8,
    advancedOptions: {
      preserveDetails: true,
      faceDetection: false,
      colorGrading: false,
      batchProcessing: false
    }
  })

  const [response, setResponse] = useState<AdvancedImageEnhancementResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const enhancementTypes = [
    { value: 'background_removal', label: 'Background Removal', description: 'Remove background and isolate subject' },
    { value: 'quality_enhancement', label: 'Quality Enhancement', description: 'Improve overall image quality and resolution' },
    { value: 'color_correction', label: 'Color Correction', description: 'Adjust colors and white balance' },
    { value: 'style_transfer', label: 'Style Transfer', description: 'Apply artistic styles to images' },
    { value: 'noise_reduction', label: 'Noise Reduction', description: 'Reduce grain and digital noise' },
    { value: 'sharpening', label: 'Sharpening', description: 'Enhance edges and details' },
    { value: 'upscaling', label: 'Upscaling', description: 'Increase image resolution while maintaining quality' }
  ]

  const styleOptions = [
    'Photorealistic', 'Artistic', 'Vintage', 'Modern', 'Minimalist', 'Dramatic', 'Natural'
  ]

  const enhanceImage = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/v1/ai/advanced-image-enhancement', {
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
        throw new Error('Failed to enhance image')
      }

      const data = await response.json()
      setResponse(data)
    } catch (error) {
      console.error('Error enhancing image:', error)
      alert('Failed to enhance image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Image Enhancement</h1>
        <p className="text-muted-foreground">
          AI-powered image processing with advanced enhancement techniques and optimization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Enhancement Configuration
            </CardTitle>
            <CardDescription>
              Configure your image enhancement settings and processing options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Image URL</label>
              <Input
                value={request.imageUrl}
                onChange={(e) => setRequest(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Enhancement Type</label>
              <Select
                value={request.enhancementType}
                onValueChange={(value) => setRequest(prev => ({ ...prev, enhancementType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {enhancementTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {request.enhancementType === 'style_transfer' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Artistic Style</label>
                <Select
                  value={request.style || ''}
                  onValueChange={(value) => setRequest(prev => ({ ...prev, style: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select artistic style" />
                  </SelectTrigger>
                  <SelectContent>
                    {styleOptions.map(style => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">
                Intensity: {Math.round((request.intensity || 0.8) * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={request.intensity || 0.8}
                onChange={(e) => setRequest(prev => ({ ...prev, intensity: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Advanced Options</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="preserve-details" className="text-sm">Preserve Details</Label>
                  <Switch
                    id="preserve-details"
                    checked={request.advancedOptions?.preserveDetails}
                    onCheckedChange={(checked) => setRequest(prev => ({
                      ...prev,
                      advancedOptions: { ...prev.advancedOptions!, preserveDetails: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="face-detection" className="text-sm">Face Detection</Label>
                  <Switch
                    id="face-detection"
                    checked={request.advancedOptions?.faceDetection}
                    onCheckedChange={(checked) => setRequest(prev => ({
                      ...prev,
                      advancedOptions: { ...prev.advancedOptions!, faceDetection: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="color-grading" className="text-sm">Color Grading</Label>
                  <Switch
                    id="color-grading"
                    checked={request.advancedOptions?.colorGrading}
                    onCheckedChange={(checked) => setRequest(prev => ({
                      ...prev,
                      advancedOptions: { ...prev.advancedOptions!, colorGrading: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="batch-processing" className="text-sm">Batch Processing</Label>
                  <Switch
                    id="batch-processing"
                    checked={request.advancedOptions?.batchProcessing}
                    onCheckedChange={(checked) => setRequest(prev => ({
                      ...prev,
                      advancedOptions: { ...prev.advancedOptions!, batchProcessing: checked }
                    }))}
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={enhanceImage} 
              disabled={loading || !request.imageUrl}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing Image...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Enhance Image
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
              Enhancement Results
            </CardTitle>
            <CardDescription>
              AI-processed image with detailed analysis and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  <TabsTrigger value="techniques">Techniques</TabsTrigger>
                  <TabsTrigger value="recommendations">Tips</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getQualityColor(response.enhancementDetails.qualityImprovement)}`}>
                        {Math.round(response.enhancementDetails.qualityImprovement * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Quality Improvement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{response.processingTime}ms</div>
                      <div className="text-sm text-muted-foreground">Processing Time</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Enhancement Type</h4>
                    <Badge variant="outline">{response.enhancementDetails.type}</Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Changes Applied</h4>
                    <div className="space-y-1">
                      {response.enhancementDetails.changes.map((change, index) => (
                        <div key={index} className="text-sm text-muted-foreground">• {change}</div>
                      ))}
                    </div>
                  </div>

                  {response.enhancementDetails.faceDetectionResults && (
                    <div>
                      <h4 className="font-medium mb-2">Face Detection</h4>
                      <div className="text-sm text-muted-foreground">
                        {response.enhancementDetails.faceDetectionResults.facesDetected} faces detected
                        ({Math.round(response.enhancementDetails.faceDetectionResults.confidence * 100)}% confidence)
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Image Dimensions</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Original</div>
                        <div>{response.enhancementDetails.metadata.originalSize.width} × {response.enhancementDetails.metadata.originalSize.height}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Processed</div>
                        <div>{response.enhancementDetails.metadata.processedSize.width} × {response.enhancementDetails.metadata.processedSize.height}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">File Size</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Original</div>
                        <div>{formatFileSize(response.enhancementDetails.metadata.fileSize.original)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Processed</div>
                        <div>{formatFileSize(response.enhancementDetails.metadata.fileSize.processed)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Format & Color Profile</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Format</div>
                        <div>{response.enhancementDetails.metadata.format}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Color Profile</div>
                        <div>{response.enhancementDetails.metadata.colorProfile}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="techniques" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Processing Techniques</h4>
                    <div className="flex flex-wrap gap-2">
                      {response.enhancementDetails.processingTechniques.map((technique, index) => (
                        <Badge key={index} variant="secondary">{technique}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Quality Metrics</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Overall Quality</span>
                          <span className={`text-sm font-medium ${getQualityColor(response.enhancementDetails.qualityImprovement)}`}>
                            {Math.round(response.enhancementDetails.qualityImprovement * 100)}%
                          </span>
                        </div>
                        <Progress value={response.enhancementDetails.qualityImprovement * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Processing Confidence</span>
                          <span className={`text-sm font-medium ${getQualityColor(response.confidence)}`}>
                            {Math.round(response.confidence * 100)}%
                          </span>
                        </div>
                        <Progress value={response.confidence * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">AI Recommendations</h4>
                    <div className="space-y-2">
                      {response.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <div className="text-sm text-muted-foreground">{recommendation}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {response.batchResults && (
                    <div>
                      <h4 className="font-medium mb-2">Batch Processing Results</h4>
                      <div className="space-y-2">
                        {response.batchResults.map((result, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="text-sm">
                              <div className="font-medium">Image {index + 1}</div>
                              <div className="text-muted-foreground">{result.imageUrl}</div>
                            </div>
                            <Badge variant={result.success ? "default" : "destructive"}>
                              {result.success ? "Success" : "Failed"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Enter an image URL and configure enhancement settings to see AI-powered processing results
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}