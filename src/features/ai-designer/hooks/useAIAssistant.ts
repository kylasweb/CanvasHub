import { useState, useEffect, useCallback } from 'react'
import { AIContext, AIAssistantState, UserAIPreferences, AISuggestion } from '../types'
import { aiDesignerService } from '../services/ai-designer-service'

export function useAIAssistant(initialContext: AIContext = {}) {
  const [state, setState] = useState<AIAssistantState>({
    isAvailable: true,
    isLoading: false,
    error: null,
    currentContext: initialContext,
    suggestions: [],
    recentInteractions: [],
    userQuota: {
      contentGeneration: { used: 0, limit: 50 },
      layoutSuggestions: { used: 0, limit: 25 },
      colorPalettes: { used: 0, limit: 15 },
      seoOptimizations: { used: 0, limit: 25 },
      imageEnhancements: { used: 0, limit: 10 },
    },
  })

  const [userPreferences, setUserPreferences] = useState<UserAIPreferences | null>(null)

  // Update context when it changes
  const updateContext = useCallback((newContext: Partial<AIContext>) => {
    setState(prev => ({
      ...prev,
      currentContext: { ...prev.currentContext, ...newContext }
    }))
  }, [])

  // Generate contextual suggestions based on current context
  const generateSuggestions = useCallback(async () => {
    if (!state.isAvailable || state.isLoading) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const suggestions: AISuggestion[] = []

      // Generate content suggestions for text widgets
      if (state.currentContext.currentWidget === 'text' || state.currentContext.currentTask === 'editing') {
        try {
          const result = await aiDesignerService.generateContent('user-id', {
            businessType: state.currentContext.websiteType || 'business',
            targetAudience: 'general',
            topic: state.currentContext.selectedElement?.content?.text || 'website content',
            writingStyle: (userPreferences?.preferredWritingStyle as 'formal' | 'casual' | 'professional' | 'friendly') || 'professional',
          })

          suggestions.push({
            id: `content-${Date.now()}`,
            type: 'content',
            title: 'Content Enhancement',
            description: 'AI-generated content suggestions',
            confidence: result.confidence,
            priority: 'high',
            data: result,
            context: state.currentContext,
            timestamp: new Date(),
          })
        } catch (error) {
          console.error('Content suggestion failed:', error)
        }
      }

      // Generate color suggestions
      if (state.currentContext.currentTask === 'creating' || state.currentContext.pageSection === 'hero') {
        try {
          const result = await aiDesignerService.generateColorPalette('user-id', {
            stylePreference: (userPreferences?.preferredColorScheme as 'modern' | 'minimal' | 'vibrant' | 'corporate' | 'earthy' | 'pastel') || 'modern',
          })

          suggestions.push({
            id: `colors-${Date.now()}`,
            type: 'colors',
            title: 'Color Palette',
            description: 'Harmonious color scheme',
            confidence: result.confidence,
            priority: 'medium',
            data: result,
            context: state.currentContext,
            timestamp: new Date(),
          })
        } catch (error) {
          console.error('Color suggestion failed:', error)
        }
      }

      // Generate layout suggestions
      if (state.currentContext.pageSection) {
        try {
          const result = await aiDesignerService.suggestLayout('user-id', {
            contentData: state.currentContext.selectedElement?.content || {},
            pageType: state.currentContext.pageSection || 'content',
            preferences: { layoutStyle: 'modern' },
          })

          suggestions.push({
            id: `layout-${Date.now()}`,
            type: 'layout',
            title: 'Layout Optimization',
            description: 'Optimal layout structure',
            confidence: result.confidence,
            priority: 'medium',
            data: result,
            context: state.currentContext,
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
  }, [state.currentContext, state.isAvailable, state.isLoading, userPreferences])

  // Generate content suggestion
  const generateContentSuggestion = useCallback(async (
    businessType: string,
    targetAudience: string,
    topic: string,
    writingStyle?: string
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await aiDesignerService.generateContent('user-id', {
        businessType,
        targetAudience,
        topic,
        writingStyle: writingStyle as any || 'professional',
      })

      const suggestion = {
        id: `manual-content-${Date.now()}`,
        type: 'content' as const,
        title: 'Content Generation',
        description: 'AI-generated content',
        confidence: result.confidence,
        priority: 'high' as const,
        data: result,
        context: state.currentContext,
        timestamp: new Date(),
      }

      setState(prev => ({
        ...prev,
        suggestions: [...prev.suggestions, suggestion],
        isLoading: false,
        recentInteractions: [
          ...prev.recentInteractions,
          { type: 'content_generation', timestamp: new Date(), success: true }
        ]
      }))

      return suggestion
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate content',
        recentInteractions: [
          ...prev.recentInteractions,
          { type: 'content_generation', timestamp: new Date(), success: false }
        ]
      }))
      throw error
    }
  }, [state.currentContext])

  // Generate color palette
  const generateColorPalette = useCallback(async (preferences?: {
    brandColors?: string[]
    stylePreference?: string
    baseColor?: string
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await aiDesignerService.generateColorPalette('user-id', {
        ...preferences,
        stylePreference: (preferences?.stylePreference || userPreferences?.preferredColorScheme) as any,
      })

      const suggestion = {
        id: `manual-colors-${Date.now()}`,
        type: 'colors' as const,
        title: 'Color Palette',
        description: 'AI-generated color scheme',
        confidence: result.confidence,
        priority: 'medium' as const,
        data: result,
        context: state.currentContext,
        timestamp: new Date(),
      }

      setState(prev => ({
        ...prev,
        suggestions: [...prev.suggestions, suggestion],
        isLoading: false,
        recentInteractions: [
          ...prev.recentInteractions,
          { type: 'color_palette_generation', timestamp: new Date(), success: true }
        ]
      }))

      return suggestion
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate color palette',
        recentInteractions: [
          ...prev.recentInteractions,
          { type: 'color_palette_generation', timestamp: new Date(), success: false }
        ]
      }))
      throw error
    }
  }, [state.currentContext, userPreferences])

  // Generate SEO suggestions
  const generateSEOSuggestions = useCallback(async (
    pageContent: string,
    keywords?: string[],
    options?: {
      targetAudience?: string
      industry?: string
      competitorAnalysis?: boolean
    }
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await aiDesignerService.getSEOSuggestions('user-id', {
        pageContent,
        keywords,
        ...options,
      })

      const suggestion = {
        id: `manual-seo-${Date.now()}`,
        type: 'seo' as const,
        title: 'SEO Optimization',
        description: 'AI-powered SEO suggestions',
        confidence: result.confidence,
        priority: 'medium' as const,
        data: result,
        context: state.currentContext,
        timestamp: new Date(),
      }

      setState(prev => ({
        ...prev,
        suggestions: [...prev.suggestions, suggestion],
        isLoading: false,
        recentInteractions: [
          ...prev.recentInteractions,
          { type: 'seo_optimization', timestamp: new Date(), success: true }
        ]
      }))

      return suggestion
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate SEO suggestions',
        recentInteractions: [
          ...prev.recentInteractions,
          { type: 'seo_optimization', timestamp: new Date(), success: false }
        ]
      }))
      throw error
    }
  }, [state.currentContext])

  // Accept a suggestion
  const acceptSuggestion = useCallback((suggestionId: string) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== suggestionId),
    }))
  }, [])

  // Reject a suggestion
  const rejectSuggestion = useCallback((suggestionId: string) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== suggestionId),
    }))
  }, [])

  // Clear all suggestions
  const clearSuggestions = useCallback(() => {
    setState(prev => ({ ...prev, suggestions: [] }))
  }, [])

  // Dismiss error
  const dismissError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Auto-generate suggestions when context changes significantly
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.currentContext.currentWidget || state.currentContext.currentTask === 'editing') {
        generateSuggestions()
      }
    }, 1000) // Debounce to avoid too many calls

    return () => clearTimeout(timeoutId)
  }, [state.currentContext, generateSuggestions])

  return {
    // State
    state,
    userPreferences,

    // Actions
    updateContext,
    generateSuggestions,
    generateContentSuggestion,
    generateColorPalette,
    generateSEOSuggestions,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestions,
    dismissError,

    // Derived state
    hasSuggestions: state.suggestions.length > 0,
    isLoading: state.isLoading,
    error: state.error,
    availableQuotas: Object.fromEntries(
      Object.entries(state.userQuota).map(([key, quota]) => [
        key,
        quota.limit - quota.used
      ])
    ),
  }
}