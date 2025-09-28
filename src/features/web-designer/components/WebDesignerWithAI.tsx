"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Download, 
  Copy, 
  Settings, 
  Palette, 
  Layout, 
  Code, 
  Image as ImageIcon, 
  FileText, 
  Globe, 
  BarChart3,
  Sparkles,
  Save,
  Send as Publish,
  Eye as Preview,
  Search,
  Filter,
  Grid,
  List,
  Upload,
  FolderOpen,
  Layout as Widgets,
  FileText as Template,
  X,
  Move,
  Layers,
  Type,
  Square,
  Circle,
  Triangle,
  Smartphone,
  Tablet,
  Monitor,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize
} from 'lucide-react'
import { useWebDesignerProjects } from '../hooks/useWebDesignerProjects'
import { useWebDesignerTemplates } from '../hooks/useWebDesignerTemplates'
import { useWebDesignerWidgets } from '../hooks/useWebDesignerWidgets'
import { useWebDesignerAssets } from '../hooks/useWebDesignerAssets'
import { useAIAssistant } from '../../ai-designer/hooks/useAIAssistant'
import MagicWand from '../../ai-designer/components/MagicWand'
import InlineSuggestion from '../../ai-designer/components/InlineSuggestion'
import { 
  WebDesignerProject, 
  WebDesignerTemplate, 
  WebDesignerWidget, 
  WebDesignerAsset,
  WebDesignerProjectType,
  WebDesignerProjectStatus,
  WebDesignerTemplateCategory,
  WebDesignerWidgetType,
  WebDesignerWidgetCategory,
  WebDesignerAssetType
} from '../types'

interface WidgetInstance {
  id: string
  widgetId: string
  type: WebDesignerWidgetType
  content: Record<string, any>
  styles: Record<string, any>
  position: { x: number; y: number; width: number; height: number }
  zIndex: number
}

export default function WebDesignerWithAI() {
  const { projects, loading: projectsLoading, createProject, updateProject, deleteProject, publishProject } = useWebDesignerProjects()
  const { templates, loading: templatesLoading } = useWebDesignerTemplates()
  const { widgets, loading: widgetsLoading } = useWebDesignerWidgets()
  const { assets, loading: assetsLoading, uploadAsset } = useWebDesignerAssets()
  
  const [selectedProject, setSelectedProject] = useState<WebDesignerProject | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<WebDesignerTemplate | null>(null)
  const [selectedWidget, setSelectedWidget] = useState<WebDesignerWidget | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<WebDesignerAsset | null>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState("projects")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  const [formData, setFormData] = useState<Partial<WebDesignerProject>>({})
  const [canvasWidgets, setCanvasWidgets] = useState<WidgetInstance[]>([])
  const [selectedWidgetInstance, setSelectedWidgetInstance] = useState<WidgetInstance | null>(null)
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [zoom, setZoom] = useState(100)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  // AI Assistant Integration
  const {
    state: aiState,
    updateContext,
    generateSuggestions,
    generateContentSuggestion,
    generateColorPalette,
    generateSEOSuggestions,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestions,
    dismissError
  } = useAIAssistant({
    websiteType: (selectedProject?.type?.toLowerCase() as 'blog' | 'portfolio' | 'ecommerce' | 'business' | 'personal') || 'business',
    currentTask: isEditing ? 'editing' : 'creating'
  })

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0])
    }
  }, [projects, selectedProject])

  // Update AI context when selection changes
  useEffect(() => {
    updateContext({
      currentWidget: selectedWidgetInstance?.type as any,
      pageSection: 'content',
      selectedElement: selectedWidgetInstance ? {
        type: selectedWidgetInstance.type,
        content: selectedWidgetInstance.content,
        styles: selectedWidgetInstance.styles
      } : undefined
    })
  }, [selectedWidgetInstance, updateContext])

  const handleCreateProject = async () => {
    try {
      const newProject = await createProject({
        title: formData.title || "New Project",
        description: formData.description,
        type: formData.type || WebDesignerProjectType.LANDING_PAGE,
        isPublic: false,
        allowIndexing: true
      })
      setSelectedProject(newProject)
      setIsEditing(false)
      setFormData({})
      toast.success("Project created successfully")
    } catch (error) {
      toast.error("Failed to create project")
    }
  }

  const handleUpdateProject = async () => {
    if (!selectedProject) return
    
    try {
      const updatedProject = await updateProject(selectedProject.id, formData)
      setSelectedProject(updatedProject)
      setIsEditing(false)
      setFormData({})
      toast.success("Project updated successfully")
    } catch (error) {
      toast.error("Failed to update project")
    }
  }

  const handleDeleteProject = async () => {
    if (!selectedProject) return
    
    try {
      await deleteProject(selectedProject.id)
      setSelectedProject(projects.length > 1 ? projects.find(p => p.id !== selectedProject.id) || null : null)
      toast.success("Project deleted successfully")
    } catch (error) {
      toast.error("Failed to delete project")
    }
  }

  const handlePublishProject = async () => {
    if (!selectedProject) return
    
    try {
      const publishedProject = await publishProject(selectedProject.id, {
        customDomain: formData.customDomain,
        seoSettings: formData.seoSettings,
        analyticsSettings: formData.analytics
      })
      setSelectedProject(publishedProject)
      toast.success("Project published successfully")
    } catch (error) {
      toast.error("Failed to publish project")
    }
  }

  const startEditing = () => {
    if (selectedProject) {
      setFormData(selectedProject)
      setIsEditing(true)
      updateContext({ currentTask: 'editing' })
    }
  }

  const startCreating = () => {
    setFormData({
      type: WebDesignerProjectType.LANDING_PAGE,
      status: WebDesignerProjectStatus.DRAFT,
      content: {},
      styles: {},
      isPublic: false,
      allowIndexing: true
    })
    setIsEditing(true)
    setSelectedProject(null)
    updateContext({ currentTask: 'creating' })
  }

  const createFromTemplate = (template: WebDesignerTemplate) => {
    setFormData({
      title: `${template.name} Copy`,
      description: template.description,
      type: template.type,
      content: template.content,
      styles: template.styles,
      templateId: template.id,
      isPublic: false,
      allowIndexing: true
    })
    setIsEditing(true)
    setSelectedProject(null)
    updateContext({ currentTask: 'creating' })
  }

  const addWidgetToCanvas = (widget: WebDesignerWidget) => {
    const newWidget: WidgetInstance = {
      id: `widget_${Date.now()}`,
      widgetId: widget.id,
      type: widget.type,
      content: { ...widget.defaultContent },
      styles: { ...widget.defaultStyles },
      position: { x: 50, y: 50, width: 200, height: 100 },
      zIndex: canvasWidgets.length + 1
    }
    setCanvasWidgets([...canvasWidgets, newWidget])
    setSelectedWidgetInstance(newWidget)
    updateContext({ currentWidget: widget.type as any })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await uploadAsset({
        file,
        name: file.name,
        isPublic: false
      })
      toast.success("Asset uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload asset")
    }
  }

  // AI Suggestion Handlers
  const handleAISuggestionAccept = (suggestion: any) => {
    acceptSuggestion(suggestion.id)
    
    switch (suggestion.type) {
      case 'content':
        if (selectedWidgetInstance) {
          const updatedWidgets = canvasWidgets.map(widget => 
            widget.id === selectedWidgetInstance.id
              ? { ...widget, content: { ...widget.content, text: suggestion.data.generatedText } }
              : widget
          )
          setCanvasWidgets(updatedWidgets)
          setSelectedWidgetInstance(updatedWidgets.find(w => w.id === selectedWidgetInstance.id) || null)
        }
        break
        
      case 'colors':
        // Apply color palette to project
        if (suggestion.data.palette) {
          setFormData(prev => ({
            ...prev,
            styles: {
              ...prev.styles,
              colorPalette: suggestion.data.palette
            }
          }))
        }
        break
        
      case 'seo':
        // Apply SEO suggestions
        setFormData(prev => ({
          ...prev,
          seoSettings: {
            ...prev.seoSettings,
            title: suggestion.data.titleSuggestion,
            description: suggestion.data.metaDescriptionSuggestion,
            keywords: suggestion.data.keywordSuggestions
          }
        }))
        break
        
      case 'layout':
        // Apply layout suggestions
        if (suggestion.data.suggestedLayout) {
          // Transform layout suggestions to widget instances
          const newWidgets = suggestion.data.suggestedLayout.sections.map((section: any, index: number) => ({
            id: `ai_widget_${index}`,
            widgetId: section.type,
            type: section.type,
            content: section.content,
            styles: section.styles,
            position: section.position,
            zIndex: index + 1
          }))
          setCanvasWidgets(newWidgets)
        }
        break
    }
    
    toast.success('AI suggestion applied successfully!')
  }

  const handleAISuggestionReject = (suggestionId: string) => {
    rejectSuggestion(suggestionId)
  }

  const handleOpenAIPanel = () => {
    generateSuggestions()
  }

  const getViewportDimensions = () => {
    switch (viewport) {
      case 'mobile': return { width: 375, height: 667 }
      case 'tablet': return { width: 768, height: 1024 }
      default: return { width: 1200, height: 800 }
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || project.type === filterType
    return matchesSearch && matchesType
  })

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || template.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const filteredWidgets = widgets.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || widget.category === filterCategory
    return matchesSearch && matchesCategory
  })

  if (projectsLoading || templatesLoading || widgetsLoading || assetsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Visual Web Designer</h1>
          <p className="text-muted-foreground">Create beautiful websites with drag-and-drop simplicity</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={startCreating}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
          
          {/* AI Assistant Magic Wand */}
          <MagicWand
            context={aiState.currentContext}
            onSuggestionAccept={handleAISuggestionAccept}
            onSuggestionReject={handleAISuggestionReject}
            onOpenPanel={handleOpenAIPanel}
          />
        </div>
      </div>

      {/* AI Error Display */}
      {aiState.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-800">
                <span>{aiState.error}</span>
              </div>
              <Button size="sm" variant="outline" onClick={dismissError}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Left Sidebar - Projects/Templates/Widgets */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={activeTab === "projects" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("projects")}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                My Projects
              </Button>
              <Button
                variant={activeTab === "templates" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("templates")}
              >
                <Template className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button
                variant={activeTab === "widgets" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("widgets")}
              >
                <Widgets className="w-4 h-4 mr-2" />
                Widgets
              </Button>
              <Button
                variant={activeTab === "assets" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("assets")}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Assets
              </Button>
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {activeTab === "projects" && (
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value={WebDesignerProjectType.LANDING_PAGE}>Landing Page</SelectItem>
                    <SelectItem value={WebDesignerProjectType.PORTFOLIO}>Portfolio</SelectItem>
                    <SelectItem value={WebDesignerProjectType.BLOG}>Blog</SelectItem>
                    <SelectItem value={WebDesignerProjectType.BUSINESS}>Business</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              {(activeTab === "templates" || activeTab === "widgets") && (
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {activeTab === "templates" && (
                      <>
                        <SelectItem value={WebDesignerTemplateCategory.BUSINESS}>Business</SelectItem>
                        <SelectItem value={WebDesignerTemplateCategory.PORTFOLIO}>Portfolio</SelectItem>
                        <SelectItem value={WebDesignerTemplateCategory.BLOG}>Blog</SelectItem>
                      </>
                    )}
                    {activeTab === "widgets" && (
                      <>
                        <SelectItem value={WebDesignerWidgetCategory.LAYOUT}>Layout</SelectItem>
                        <SelectItem value={WebDesignerWidgetCategory.CONTENT}>Content</SelectItem>
                        <SelectItem value={WebDesignerWidgetCategory.MEDIA}>Media</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Content List */}
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize">{activeTab}</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {activeTab === "projects" && (
                  <div className="space-y-2">
                    {filteredProjects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No projects found</p>
                    ) : (
                      filteredProjects.map((project) => (
                        <div
                          key={project.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedProject?.id === project.id
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => setSelectedProject(project)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">
                                {project.title}
                              </h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {project.type}
                              </p>
                            </div>
                            <Badge variant={project.status === "PUBLISHED" ? "default" : "secondary"}>
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "templates" && (
                  <div className="space-y-2">
                    {filteredTemplates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No templates found</p>
                    ) : (
                      filteredTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => createFromTemplate(template)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{template.name}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {template.category}
                              </p>
                            </div>
                            <div className="flex space-x-1">
                              {template.isPremium && <Badge variant="default">Premium</Badge>}
                              {template.isFeatured && <Badge variant="secondary">Featured</Badge>}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "widgets" && (
                  <div className="space-y-2">
                    {filteredWidgets.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No widgets found</p>
                    ) : (
                      filteredWidgets.map((widget) => (
                        <div
                          key={widget.id}
                          className="p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => addWidgetToCanvas(widget)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{widget.name}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {widget.category}
                              </p>
                            </div>
                            {widget.isPremium && <Badge variant="default">Premium</Badge>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "assets" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <Label htmlFor="asset-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors">
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload assets</p>
                        </div>
                      </Label>
                      <Input
                        id="asset-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,video/*,.pdf,.doc,.docx"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {assets.slice(0, 8).map((asset) => (
                        <div
                          key={asset.id}
                          className="p-2 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => setSelectedAsset(asset)}
                        >
                          <div className="aspect-square bg-muted rounded mb-1 flex items-center justify-center">
                            {asset.type === WebDesignerAssetType.IMAGE ? (
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            ) : (
                              <FileText className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-xs font-medium truncate">{asset.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Canvas Area */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedProject ? selectedProject.title : "Canvas"}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={viewport === "desktop" ? "default" : "ghost"}
                    onClick={() => setViewport("desktop")}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewport === "tablet" ? "default" : "ghost"}
                    onClick={() => setViewport("tablet")}
                  >
                    <Tablet className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewport === "mobile" ? "default" : "ghost"}
                    onClick={() => setViewport("mobile")}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button size="sm" variant="ghost" onClick={() => setZoom(Math.max(25, zoom - 25))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">{zoom}%</span>
                  <Button size="sm" variant="ghost" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button size="sm" variant="ghost" onClick={() => setIsPreviewMode(!isPreviewMode)}>
                    {isPreviewMode ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-full">
              <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg overflow-hidden">
                <div
                  className="bg-white shadow-lg transition-all duration-200"
                  style={{
                    width: `${getViewportDimensions().width * zoom / 100}px`,
                    height: `${getViewportDimensions().height * zoom / 100}px`,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center'
                  }}
                >
                  {canvasWidgets.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <Layout className="w-12 h-12 mx-auto mb-4" />
                        <p>Drag widgets from the sidebar to start building</p>
                        <p className="text-sm">or select a template to begin</p>
                        <div className="mt-4">
                          <Button size="sm" onClick={generateSuggestions}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Get AI Suggestions
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      {canvasWidgets.map((widget) => (
                        <div
                          key={widget.id}
                          className={`absolute border-2 ${
                            selectedWidgetInstance?.id === widget.id
                              ? 'border-primary bg-primary/5'
                              : 'border-transparent hover:border-muted-foreground/50'
                          } cursor-move transition-colors`}
                          style={{
                            left: widget.position.x,
                            top: widget.position.y,
                            width: widget.position.width,
                            height: widget.position.height,
                            zIndex: widget.zIndex,
                            ...widget.styles
                          }}
                          onClick={() => setSelectedWidgetInstance(widget)}
                        >
                          <div className="p-2 h-full flex items-center justify-center relative">
                            {/* Inline AI Suggestion Button */}
                            <div className="absolute -top-2 -right-2">
                              <InlineSuggestion
                                type="content"
                                context={aiState.currentContext}
                                currentValue={widget.content?.text}
                                onApply={(data) => {
                                  const updatedWidgets = canvasWidgets.map(w => 
                                    w.id === widget.id
                                      ? { ...w, content: { ...w.content, text: data.content } }
                                      : w
                                  )
                                  setCanvasWidgets(updatedWidgets)
                                  setSelectedWidgetInstance(updatedWidgets.find(w => w.id === widget.id) || null)
                                }}
                                onDismiss={() => {}}
                              />
                            </div>
                            
                            {widget.type === WebDesignerWidgetType.TEXT && (
                              <div className="text-center">
                                <Type className="w-6 h-6 mx-auto mb-1" />
                                <p className="text-xs">Text Widget</p>
                                {widget.content?.text && (
                                  <p className="text-xs mt-1 truncate">{widget.content.text}</p>
                                )}
                              </div>
                            )}
                            {widget.type === WebDesignerWidgetType.IMAGE && (
                              <div className="text-center">
                                <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                                <p className="text-xs">Image Widget</p>
                              </div>
                            )}
                            {widget.type === WebDesignerWidgetType.BUTTON && (
                              <div className="text-center">
                                <Square className="w-6 h-6 mx-auto mb-1" />
                                <p className="text-xs">Button Widget</p>
                              </div>
                            )}
                            {widget.type === WebDesignerWidgetType.CONTAINER && (
                              <div className="text-center">
                                <div className="w-6 h-6 border-2 border-dashed border-muted-foreground mx-auto mb-1" />
                                <p className="text-xs">Container</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="lg:col-span-1 space-y-4">
          {selectedProject && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="project-title">Title</Label>
                  <Input
                    id="project-title"
                    value={selectedProject.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    value={selectedProject.description || ""}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={startEditing}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePublishProject}
                    className="flex-1"
                  >
                    <Publish className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteProject}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </Button>
              </CardContent>
            </Card>
          )}

          {selectedWidgetInstance && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Widget Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Widget Type</Label>
                  <p className="text-sm text-muted-foreground">{selectedWidgetInstance.type}</p>
                </div>
                <div>
                  <Label htmlFor="widget-content">Content</Label>
                  <Textarea
                    id="widget-content"
                    value={selectedWidgetInstance.content?.text || ''}
                    onChange={(e) => {
                      const updatedWidgets = canvasWidgets.map(widget => 
                        widget.id === selectedWidgetInstance.id
                          ? { ...widget, content: { ...widget.content, text: e.target.value } }
                          : widget
                      )
                      setCanvasWidgets(updatedWidgets)
                      setSelectedWidgetInstance(updatedWidgets.find(w => w.id === selectedWidgetInstance.id) || null)
                    }}
                    rows={3}
                    placeholder="Enter widget content..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="widget-width">Width</Label>
                    <Input
                      id="widget-width"
                      type="number"
                      value={selectedWidgetInstance.position.width}
                      onChange={(e) => {
                        const updated = canvasWidgets.map(w => 
                          w.id === selectedWidgetInstance.id 
                            ? { ...w, position: { ...w.position, width: parseInt(e.target.value) } }
                            : w
                        )
                        setCanvasWidgets(updated)
                        setSelectedWidgetInstance(updated.find(w => w.id === selectedWidgetInstance.id) || null)
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="widget-height">Height</Label>
                    <Input
                      id="widget-height"
                      type="number"
                      value={selectedWidgetInstance.position.height}
                      onChange={(e) => {
                        const updated = canvasWidgets.map(w => 
                          w.id === selectedWidgetInstance.id 
                            ? { ...w, position: { ...w.position, height: parseInt(e.target.value) } }
                            : w
                        )
                        setCanvasWidgets(updated)
                        setSelectedWidgetInstance(updated.find(w => w.id === selectedWidgetInstance.id) || null)
                      }}
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setCanvasWidgets(canvasWidgets.filter(w => w.id !== selectedWidgetInstance.id))
                    setSelectedWidgetInstance(null)
                  }}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Widget
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="ghost" className="w-full justify-start">
                <Save className="w-4 h-4 mr-2" />
                Save Project
              </Button>
              <Button size="sm" variant="ghost" className="w-full justify-start">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate Project
              </Button>
              <Button size="sm" variant="ghost" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export HTML
              </Button>
              <Button size="sm" variant="ghost" className="w-full justify-start">
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview in New Tab
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}