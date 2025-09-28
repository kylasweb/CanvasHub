export interface AIContext {
  currentWidget?: 'text' | 'image' | 'button' | 'container' | 'header' | 'footer'
  pageSection?: 'header' | 'hero' | 'content' | 'footer' | 'sidebar'
  userSkillLevel?: 'beginner' | 'intermediate' | 'advanced'
  websiteType?: 'business' | 'portfolio' | 'ecommerce' | 'blog' | 'personal'
  currentTask?: 'creating' | 'editing' | 'optimizing'
  selectedElement?: {
    type: string
    content: any
    styles: any
  }
}

export interface AISuggestion {
  id: string
  type: 'content' | 'layout' | 'colors' | 'seo' | 'image'
  title: string
  description: string
  confidence: number
  priority: 'high' | 'medium' | 'low'
  data: any
  context: AIContext
  timestamp: Date
}

export interface AIAssistantState {
  isAvailable: boolean
  isLoading: boolean
  error: string | null
  currentContext: AIContext
  suggestions: AISuggestion[]
  recentInteractions: Array<{
    type: string
    timestamp: Date
    success: boolean
  }>
  userQuota: {
    contentGeneration: { used: number; limit: number }
    layoutSuggestions: { used: number; limit: number }
    colorPalettes: { used: number; limit: number }
    seoOptimizations: { used: number; limit: number }
    imageEnhancements: { used: number; limit: number }
  }
}

export interface MagicWandProps {
  context: AIContext
  onSuggestionAccept: (suggestion: AISuggestion) => void
  onSuggestionReject: (suggestionId: string) => void
  onOpenPanel: () => void
  className?: string
}

export interface InlineSuggestionProps {
  type: 'content' | 'seo' | 'colors'
  context: AIContext
  currentValue?: string
  onApply: (suggestion: any) => void
  onDismiss: () => void
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export interface AIPanelProps {
  isOpen: boolean
  onClose: () => void
  context: AIContext
  onSuggestionApply: (suggestion: AISuggestion) => void
}

export type AIWritingStyle = 'formal' | 'casual' | 'professional' | 'friendly' | 'technical' | 'creative'
export type AIColorScheme = 'vibrant' | 'minimal' | 'corporate' | 'modern' | 'earthy' | 'pastel' | 'monochrome'
export type AILayoutStyle = 'modern' | 'classic' | 'minimal' | 'creative'

export interface UserAIPreferences {
  id?: string
  userId: string
  preferredWritingStyle?: AIWritingStyle
  preferredColorScheme?: AIColorScheme
  industryExpertise?: string[]
  avoidedSuggestions?: string[]
  learningData?: {
    acceptedSuggestions: number
    rejectedSuggestions: number
    commonContexts: string[]
    preferredFeatures: string[]
  }
}

export interface AIAnalytics {
  totalUsage: number
  usageByFeature: Array<{
    feature: string
    count: number
  }>
  averageRatings: Array<{
    feature: string
    averageRating: number
  }>
  recentActivity: Array<{
    id: string
    feature: string
    user: string
    timestamp: Date
    processingTime: number
    cost: number
  }>
  topUsers: Array<{
    userId: string
    usageCount: number
    totalCost: number
  }>
}