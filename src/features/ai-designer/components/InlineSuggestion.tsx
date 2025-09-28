"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { 
  Lightbulb, 
  Sparkles, 
  Check, 
  X, 
  Loader2,
  Type,
  Search,
  Palette
} from 'lucide-react'
import { AIContext, InlineSuggestionProps } from '../types'
import { aiDesignerService } from '../services/ai-designer-service'

interface SuggestionData {
  content?: string
  title?: string
  metaDescription?: string
  keywords?: string[]
  palette?: {
    primary: string
    secondary: string
    accent: string
  }
}

export default function InlineSuggestion({ 
  type, 
  context, 
  currentValue, 
  onApply, 
  onDismiss,
  position = 'bottom'
}: InlineSuggestionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<SuggestionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && !suggestion && !isLoading) {
      generateSuggestion()
    }
  }, [isOpen, suggestion, isLoading])

  const generateSuggestion = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let result: SuggestionData = {}

      switch (type) {
        case 'content':
          const contentResult = await aiDesignerService.generateContent('user-id', {
            businessType: context.websiteType || 'business',
            targetAudience: 'general',
            topic: currentValue || 'website content',
            writingStyle: 'professional',
          })
          result = { content: contentResult.generatedText }
          break

        case 'seo':
          const seoResult = await aiDesignerService.getSEOSuggestions('user-id', {
            pageContent: currentValue || '',
            keywords: [],
          })
          result = {
            title: seoResult.titleSuggestion,
            metaDescription: seoResult.metaDescriptionSuggestion,
            keywords: seoResult.keywordSuggestions,
          }
          break

        case 'colors':
          const colorResult = await aiDesignerService.generateColorPalette('user-id', {
            stylePreference: 'modern',
          })
          result = { palette: colorResult.palette }
          break
      }

      setSuggestion(result)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate suggestion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = () => {
    if (suggestion) {
      onApply(suggestion)
      setIsOpen(false)
      setSuggestion(null)
      toast.success('AI suggestion applied!')
    }
  }

  const handleDismiss = () => {
    onDismiss()
    setIsOpen(false)
    setSuggestion(null)
  }

  const getIconForType = () => {
    switch (type) {
      case 'content': return <Type className="w-4 h-4" />
      case 'seo': return <Search className="w-4 h-4" />
      case 'colors': return <Palette className="w-4 h-4" />
      default: return <Lightbulb className="w-4 h-4" />
    }
  }

  const getTitleForType = () => {
    switch (type) {
      case 'content': return 'AI Content Suggestion'
      case 'seo': return 'SEO Optimization'
      case 'colors': return 'Color Palette'
      default: return 'AI Suggestion'
    }
  }

  const renderSuggestionContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm">Generating suggestion...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-4 text-sm text-red-600">
          <p>{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={generateSuggestion}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )
    }

    if (!suggestion) {
      return (
        <div className="p-4 text-sm text-muted-foreground">
          <p>No suggestion available.</p>
        </div>
      )
    }

    switch (type) {
      case 'content':
        return (
          <div className="p-4 space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Suggested Content:</label>
              <div className="p-3 bg-muted rounded-md text-sm">
                {suggestion.content}
              </div>
            </div>
          </div>
        )

      case 'seo':
        return (
          <div className="p-4 space-y-3">
            {suggestion.title && (
              <div>
                <label className="text-sm font-medium mb-1 block">Title Suggestion:</label>
                <div className="p-2 bg-muted rounded text-sm">
                  {suggestion.title}
                </div>
              </div>
            )}
            {suggestion.metaDescription && (
              <div>
                <label className="text-sm font-medium mb-1 block">Meta Description:</label>
                <div className="p-2 bg-muted rounded text-sm">
                  {suggestion.metaDescription}
                </div>
              </div>
            )}
            {suggestion.keywords && suggestion.keywords.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1 block">Keywords:</label>
                <div className="flex flex-wrap gap-1">
                  {suggestion.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'colors':
        return (
          <div className="p-4 space-y-3">
            <label className="text-sm font-medium block">Suggested Color Palette:</label>
            {suggestion.palette && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {Object.entries(suggestion.palette).map(([key, color]) => (
                    <div key={key} className="text-center">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-xs mt-1 capitalize">{key}</div>
                      <div className="text-xs text-muted-foreground">{color}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="p-4 text-sm text-muted-foreground">
            <p>Suggestion available</p>
          </div>
        )
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted"
          title={getTitleForType()}
        >
          <Sparkles className="w-3 h-3 text-blue-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80"
        side={position}
        align="start"
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2">
                {getIconForType()}
                <span className="font-medium text-sm">{getTitleForType()}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            {renderSuggestionContent()}

            {suggestion && (
              <div className="flex gap-2 p-3 border-t">
                <Button size="sm" onClick={handleApply} className="flex-1">
                  <Check className="w-3 h-3 mr-1" />
                  Apply
                </Button>
                <Button size="sm" variant="outline" onClick={handleDismiss}>
                  <X className="w-3 h-3 mr-1" />
                  Dismiss
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}