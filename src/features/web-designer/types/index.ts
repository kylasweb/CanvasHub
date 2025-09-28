export interface WebDesignerProject {
  id: string
  title: string
  description?: string
  type: WebDesignerProjectType
  status: WebDesignerProjectStatus
  content: Record<string, any>
  styles: Record<string, any>
  assets?: string[]
  publishedUrl?: string
  previewUrl?: string
  templateId?: string
  tags?: string[]
  seoSettings?: WebDesignerSEOSettings
  analytics?: WebDesignerAnalyticsSettings
  views: number
  isPublic: boolean
  allowIndexing: boolean
  customDomain?: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export interface WebDesignerTemplate {
  id: string
  name: string
  description: string
  category: WebDesignerTemplateCategory
  type: WebDesignerProjectType
  thumbnail?: string
  preview?: string
  content: Record<string, any>
  styles: Record<string, any>
  isPremium: boolean
  isFeatured: boolean
  usageCount: number
  tags?: string[]
  status: WebDesignerTemplateStatus
  createdAt: Date
  updatedAt: Date
}

export interface WebDesignerWidget {
  id: string
  name: string
  description: string
  type: WebDesignerWidgetType
  category: WebDesignerWidgetCategory
  icon?: string
  config: Record<string, any>
  defaultContent: Record<string, any>
  defaultStyles: Record<string, any>
  isPremium: boolean
  usageCount: number
  tags?: string[]
  status: WebDesignerWidgetStatus
  createdAt: Date
  updatedAt: Date
}

export interface WebDesignerAsset {
  id: string
  name: string
  type: WebDesignerAssetType
  url: string
  thumbnail?: string
  size: number
  mimeType: string
  alt?: string
  tags?: string[]
  metadata?: Record<string, any>
  isPublic: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

export interface WebDesignerSEOSettings {
  title?: string
  description?: string
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonicalUrl?: string
  noIndex?: boolean
  noFollow?: boolean
}

export interface WebDesignerAnalyticsSettings {
  googleAnalyticsId?: string
  googleTagManagerId?: string
  facebookPixelId?: string
  hotjarId?: string
  customScripts?: string
  enableHeatmap?: boolean
  enableSessionRecording?: boolean
}

export interface WebDesignerCreateProjectRequest {
  title: string
  description?: string
  type: WebDesignerProjectType
  templateId?: string
  isPublic: boolean
  allowIndexing: boolean
}

export interface WebDesignerUpdateProjectRequest {
  title?: string
  description?: string
  type?: WebDesignerProjectType
  content?: Record<string, any>
  styles?: Record<string, any>
  assets?: string[]
  tags?: string[]
  seoSettings?: WebDesignerSEOSettings
  analytics?: WebDesignerAnalyticsSettings
  isPublic?: boolean
  allowIndexing?: boolean
  customDomain?: string
}

export interface WebDesignerPublishProjectRequest {
  customDomain?: string
  seoSettings?: WebDesignerSEOSettings
  analyticsSettings?: WebDesignerAnalyticsSettings
}

export interface WebDesignerCreateTemplateRequest {
  name: string
  description: string
  category: WebDesignerTemplateCategory
  type: WebDesignerProjectType
  thumbnail?: string
  preview?: string
  content: Record<string, any>
  styles: Record<string, any>
  isPremium: boolean
  isFeatured: boolean
  tags?: string[]
}

export interface WebDesignerUpdateTemplateRequest {
  name?: string
  description?: string
  category?: WebDesignerTemplateCategory
  type?: WebDesignerProjectType
  thumbnail?: string
  preview?: string
  content?: Record<string, any>
  styles?: Record<string, any>
  isPremium?: boolean
  isFeatured?: boolean
  tags?: string[]
  status?: WebDesignerTemplateStatus
}

export interface WebDesignerCreateWidgetRequest {
  name: string
  description: string
  type: WebDesignerWidgetType
  category: WebDesignerWidgetCategory
  icon?: string
  config: Record<string, any>
  defaultContent: Record<string, any>
  defaultStyles: Record<string, any>
  isPremium: boolean
  tags?: string[]
}

export interface WebDesignerUpdateWidgetRequest {
  name?: string
  description?: string
  type?: WebDesignerWidgetType
  category?: WebDesignerWidgetCategory
  icon?: string
  config?: Record<string, any>
  defaultContent?: Record<string, any>
  defaultStyles?: Record<string, any>
  isPremium?: boolean
  tags?: string[]
  status?: WebDesignerWidgetStatus
}

export interface WebDesignerUploadAssetRequest {
  file: File
  name?: string
  alt?: string
  tags?: string[]
  isPublic: boolean
}

export interface WebDesignerUpdateAssetRequest {
  name?: string
  alt?: string
  tags?: string[]
  isPublic?: boolean
}

export interface WebDesignerProjectsResponse {
  projects: WebDesignerProject[]
  total: number
  page: number
  limit: number
}

export interface WebDesignerTemplatesResponse {
  templates: WebDesignerTemplate[]
  total: number
  page: number
  limit: number
}

export interface WebDesignerWidgetsResponse {
  widgets: WebDesignerWidget[]
  total: number
  page: number
  limit: number
}

export interface WebDesignerAssetsResponse {
  assets: WebDesignerAsset[]
  total: number
  page: number
  limit: number
}

export interface WebDesignerAnalyticsResponse {
  totalProjects: number
  publishedProjects: number
  totalTemplates: number
  totalWidgets: number
  totalAssets: number
  totalViews: number
  popularTemplates: WebDesignerTemplate[]
  popularWidgets: WebDesignerWidget[]
  recentProjects: WebDesignerProject[]
  usageByType: Record<WebDesignerProjectType, number>
  usageByCategory: Record<WebDesignerTemplateCategory, number>
}

export interface WebDesignerMonitoringResponse {
  systemHealth: {
    status: 'healthy' | 'warning' | 'error'
    uptime: string
    memory: number
    cpu: number
    disk: number
  }
  performance: {
    avgLoadTime: number
    errorRate: number
    activeUsers: number
  }
  recentActivity: Array<{
    id: string
    type: 'project_created' | 'project_published' | 'template_used' | 'widget_used'
    userId: string
    projectId?: string
    templateId?: string
    widgetId?: string
    timestamp: Date
  }>
}

export enum WebDesignerProjectType {
  LANDING_PAGE = 'LANDING_PAGE',
  PORTFOLIO = 'PORTFOLIO',
  BLOG = 'BLOG',
  ECOMMERCE = 'ECOMMERCE',
  BUSINESS = 'BUSINESS',
  PERSONAL = 'PERSONAL',
  EVENT = 'EVENT',
  SALES_PAGE = 'SALES_PAGE',
  COMING_SOON = 'COMING_SOON',
  CUSTOM = 'CUSTOM'
}

export enum WebDesignerProjectStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  NEEDS_CHANGES = 'NEEDS_CHANGES',
  ARCHIVED = 'ARCHIVED'
}

export enum WebDesignerTemplateCategory {
  BUSINESS = 'BUSINESS',
  PORTFOLIO = 'PORTFOLIO',
  BLOG = 'BLOG',
  ECOMMERCE = 'ECOMMERCE',
  LANDING_PAGE = 'LANDING_PAGE',
  PERSONAL = 'PERSONAL',
  EVENT = 'EVENT',
  SALES_PAGE = 'SALES_PAGE',
  COMING_SOON = 'COMING_SOON',
  CUSTOM = 'CUSTOM'
}

export enum WebDesignerTemplateStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT'
}

export enum WebDesignerWidgetType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  BUTTON = 'BUTTON',
  CONTAINER = 'CONTAINER',
  HEADER = 'HEADER',
  FOOTER = 'FOOTER',
  NAVIGATION = 'NAVIGATION',
  FORM = 'FORM',
  GALLERY = 'GALLERY',
  VIDEO = 'VIDEO',
  MAP = 'MAP',
  SOCIAL = 'SOCIAL',
  TESTIMONIAL = 'TESTIMONIAL',
  PRICING = 'PRICING',
  FEATURE = 'FEATURE',
  TEAM = 'TEAM',
  CONTACT = 'CONTACT',
  NEWSLETTER = 'NEWSLETTER',
  CUSTOM = 'CUSTOM'
}

export enum WebDesignerWidgetCategory {
  LAYOUT = 'LAYOUT',
  CONTENT = 'CONTENT',
  MEDIA = 'MEDIA',
  FORM = 'FORM',
  NAVIGATION = 'NAVIGATION',
  SOCIAL = 'SOCIAL',
  ECOMMERCE = 'ECOMMERCE',
  CUSTOM = 'CUSTOM'
}

export enum WebDesignerWidgetStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT'
}

export enum WebDesignerAssetType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  FONT = 'FONT',
  ICON = 'ICON',
  CUSTOM = 'CUSTOM'
}

export interface WebDesignerWidgetInstance {
  id: string
  widgetId: string
  type: WebDesignerWidgetType
  content: Record<string, any>
  styles: Record<string, any>
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  zIndex: number
  parentId?: string
  children?: string[]
}

export interface WebDesignerCanvas {
  id: string
  projectId: string
  widgets: WebDesignerWidgetInstance[]
  viewport: {
    width: number
    height: number
    device: 'desktop' | 'tablet' | 'mobile'
  }
  zoom: number
  selectedWidgetId?: string
  history: Array<{
    id: string
    timestamp: Date
    action: string
    data: any
  }>
}