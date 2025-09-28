"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { 
  Wand2, 
  Sparkles, 
  Lightbulb, 
  Palette, 
  Layout, 
  Search, 
  Type,
  Image as ImageIcon,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { AIContext, AISuggestion, MagicWandProps, AIAssistantState } from '../types'
import { aiDesignerService } from '../services/ai-designer-service'

interface MagicWandState extends AIAssistantState {
  isPanelOpen: boolean
  selectedSuggestion: AISuggestion | null
}

export default function MagicWand({ 
  context, 
  onSuggestionAccept, 
  onSuggestionReject, 
  onOpenPanel,
  className = '' 
}: MagicWandProps) {
  const [state, setState] = useState<MagicWandState>({
    isAvailable: true,
    isLoading: false,
    error: null,
    currentContext: context,
    suggestions: [],
    recentInteractions: [],
    userQuota: {
      contentGeneration: { used: 0, limit: 50 },
      layoutSuggestions: { used: 0, limit: 25 },
      colorPalettes: { used: 0, limit: 15 },
      seoOptimizations: { used: 0, limit: 25 },
      imageEnhancements: { used: 0, limit: 10 },
    },
    isPanelOpen: false,
    selectedSuggestion: null,
  })

  useEffect(() => {
    setState(prev => ({ ...prev, currentContext: context }))
    generateContextualSuggestions()
  }, [context])

  const generateContextualSuggestions = async () => {
    if (!state.isAvailable || state.isLoading) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const suggestions: AISuggestion[] = []

      // Generate content suggestions if in text context
      if (context.currentWidget === 'text' || context.currentTask === 'editing') {
        try {
          const contentResult = await aiDesignerService.generateContent('user-id', {
            businessType: context.websiteType || 'business',
            targetAudience: 'general',
            topic: context.selectedElement?.content?.text || 'website content',
            writingStyle: 'professional',
          })
          
          suggestions.push({
            id: `content-${Date.now()}`,
            type: 'content',
            title: 'Content Enhancement',
            description: 'AI-generated content suggestions for your text',
            confidence: contentResult.confidence,
            priority: 'high',
            data: contentResult,
            context,
            timestamp: new Date(),
          })
        } catch (error) {
          console.error('Content suggestion failed:', error)
        }
      }

      // Generate color suggestions if relevant
      if (context.currentTask === 'creating' || context.pageSection === 'hero') {
        try {
          const colorResult = await aiDesignerService.generateColorPalette('user-id', {
            stylePreference: 'modern',
          })
          
          suggestions.push({
            id: `colors-${Date.now()}`,
            type: 'colors',
            title: 'Color Palette',
            description: 'Harmonious color scheme for your design',
            confidence: colorResult.confidence,
            priority: 'medium',
            data: colorResult,
            context,
            timestamp: new Date(),
          })
        } catch (error) {
          console.error('Color suggestion failed:', error)
        }
      }

      // Generate layout suggestions
      if (context.currentTask === 'creating' || context.pageSection) {
        try {
          const layoutResult = await aiDesignerService.suggestLayout('user-id', {
            contentData: context.selectedElement?.content || {},
            pageType: context.pageSection || 'content',
            preferences: { layoutStyle: 'modern' },
          })
          
          suggestions.push({
            id: `layout-${Date.now()}`,
            type: 'layout',
            title: 'Layout Optimization',
            description: 'Optimal layout structure for your content',
            confidence: layoutResult.confidence,
            priority: 'medium',
            data: layoutResult,
            context,
            timestamp: new Date(),
          })
        } catch (error) {
          console.error('Layout suggestion failed:', error)
        }
      }

      setState(prev => ({
        ...prev,
        suggestions,
        isLoading: false,
        recentInteractions: [
          ...prev.recentInteractions,
          { type: 'contextual_suggestions', timestamp: new Date(), success: true }
        ]
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate suggestions',
        recentInteractions: [
          ...prev.recentInteractions,
          { type: 'contextual_suggestions', timestamp: new Date(), success: false }
        ]
      }))
    }
  }

  const handleSuggestionAccept = (suggestion: AISuggestion) => {
    onSuggestionAccept(suggestion)
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== suggestion.id),
      selectedSuggestion: null,
    }))
    toast.success('AI suggestion applied successfully!')
  }

  const handleSuggestionReject = (suggestionId: string) => {
    onSuggestionReject(suggestionId)
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== suggestionId),
    }))
  }

  const handleQuickAction = async (actionType: string) => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      let suggestion: AISuggestion | null = null

      switch (actionType) {
        case 'improve-content':
          const contentResult = await aiDesignerService.generateContent('user-id', {
            businessType: context.websiteType || 'business',
            targetAudience: 'general',
            topic: 'website content improvement',
            writingStyle: 'professional',
          })
          suggestion = {
            id: `quick-content-${Date.now()}`,
            type: 'content',
            title: 'Content Improvement',
            description: 'Enhance your website content with AI',
            confidence: contentResult.confidence,
            priority: 'high',
            data: contentResult,
            context,
            timestamp: new Date(),
          }
          break

        case 'suggest-colors':
          const colorResult = await aiDesignerService.generateColorPalette('user-id', {
            stylePreference: 'modern',
          })
          suggestion = {
            id: `quick-colors-${Date.now()}`,
            type: 'colors',
            title: 'Color Scheme',
            description: 'Get a professional color palette',
            confidence: colorResult.confidence,
            priority: 'medium',
            data: colorResult,
            context,
            timestamp: new Date(),
          }
          break

        case 'optimize-seo':
          const seoResult = await aiDesignerService.getSEOSuggestions('user-id', {
            pageContent: context.selectedElement?.content?.text || '',
            keywords: [],
          })
          suggestion = {
            id: `quick-seo-${Date.now()}`,
            type: 'seo',
            title: 'SEO Optimization',
            description: 'Improve your search engine ranking',
            confidence: seoResult.confidence,
            priority: 'medium',
            data: seoResult,
            context,
            timestamp: new Date(),
          }
          break
      }

      if (suggestion) {
        setState(prev => ({
          ...prev,
          suggestions: [...prev.suggestions, suggestion],
          isLoading: false,
          isPanelOpen: true,
        }))
        onOpenPanel()
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate suggestion',
      }))
      toast.error('Failed to generate AI suggestion')
    }
  }

  const getIconForSuggestionType = (type: string) => {
    switch (type) {
      case 'content': return <Type className="w-4 h-4" />
      case 'colors': return <Palette className="w-4 h-4" />
      case 'layout': return <Layout className="w-4 h-4" />
      case 'seo': return <Search className="w-4 h-4" />
      case 'image': return <ImageIcon className="w-4 h-4" />
      default: return <Lightbulb className="w-4 h-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Magic Wand Button */}
      <Dialog open={state.isPanelOpen} onOpenChange={(open) => setState(prev => ({ ...prev, isPanelOpen: open }))}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="relative group"
            onClick={() => setState(prev => ({ ...prev, isPanelOpen: true }))}
            disabled={state.isLoading || !state.isAvailable}
          >
            {state.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {state.suggestions.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                {state.suggestions.length}
              </Badge>
            )}
            <span className="ml-2 hidden sm:inline">AI Assistant</span>
          </Button>
        </DialogTrigger>

        {/* AI Assistant Panel */}
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              AI Design Assistant
              <Badge variant="outline" className="ml-auto">
                {state.suggestions.length} suggestions
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Get AI-powered suggestions to enhance your website design
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('improve-content')}
                disabled={state.isLoading}
              >
                <Type className="w-4 h-4 mr-2" />
                Improve Content
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('suggest-colors')}
                disabled={state.isLoading}
              >
                <Palette className="w-4 h-4 mr-2" />
                Suggest Colors
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('optimize-seo')}
                disabled={state.isLoading}
              >
                <Search className="w-4 h-4 mr-2" />
                Optimize SEO
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateContextualSuggestions}
                disabled={state.isLoading}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh Suggestions
              </Button>
            </div>

            {/* Error Display */}
            {state.error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="w-5 h-5" />
                    <p>{state.error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Quota Display */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Your AI Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  {Object.entries(state.userQuota).map(([key, quota]) => (
                    <div key={key} className="text-center">
                      <div className="font-medium">
                        {quota.used}/{quota.limit}
                      </div>
                      <div className="text-muted-foreground text-xs capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggestions List */}
            {state.suggestions.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {state.suggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getIconForSuggestionType(suggestion.type)}
                            <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityVariant(suggestion.priority)}>
                              {suggestion.priority}
                            </Badge>
                            <div className={`text-sm ${getConfidenceColor(suggestion.confidence)}`}>
                              <Star className="w-3 h-3 inline mr-1" />
                              {Math.round(suggestion.confidence * 100)}%
                            </div>
                          </div>
                        </div>
                        <CardDescription>{suggestion.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {suggestion.timestamp.toLocaleTimeString()}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSuggestionAccept(suggestion)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Apply
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSuggestionReject(suggestion.id)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No AI suggestions available.</p>
                    <p className="text-sm">Try clicking on quick actions or editing content to get suggestions.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}