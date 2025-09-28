"use client"

import { useState, useEffect } from 'react'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Activity,
  Settings,
  Database,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Image,
  Settings as Widget,
  Layout,
  Globe,
  Server,
  Cpu,
  HardDrive
} from 'lucide-react'
import { webDesignerService } from '../services/web-designer-service'
import { 
  WebDesignerTemplate,
  WebDesignerWidget,
  WebDesignerAsset,
  WebDesignerAnalyticsResponse,
  WebDesignerMonitoringResponse,
  WebDesignerTemplateCategory,
  WebDesignerWidgetCategory,
  WebDesignerTemplateStatus,
  WebDesignerWidgetStatus,
  WebDesignerProjectType,
  WebDesignerWidgetType
} from '../types'

export default function AdminWebDesignerManager() {
  const [analytics, setAnalytics] = useState<WebDesignerAnalyticsResponse | null>(null)
  const [monitoring, setMonitoring] = useState<WebDesignerMonitoringResponse | null>(null)
  const [templates, setTemplates] = useState<WebDesignerTemplate[]>([])
  const [widgets, setWidgets] = useState<WebDesignerWidget[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("analytics")

  // Template management
  const [selectedTemplate, setSelectedTemplate] = useState<WebDesignerTemplate | null>(null)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  const [templateForm, setTemplateForm] = useState<Partial<WebDesignerTemplate>>({})

  // Widget management
  const [selectedWidget, setSelectedWidget] = useState<WebDesignerWidget | null>(null)
  const [isEditingWidget, setIsEditingWidget] = useState(false)
  const [widgetForm, setWidgetForm] = useState<Partial<WebDesignerWidget>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [analyticsData, monitoringData, templatesData, widgetsData] = await Promise.all([
        webDesignerService.getAnalytics(),
        webDesignerService.getMonitoring(),
        webDesignerService.getTemplates({ limit: 50 }),
        webDesignerService.getWidgets({ limit: 50 })
      ])
      
      setAnalytics(analyticsData)
      setMonitoring(monitoringData)
      setTemplates(templatesData.templates)
      setWidgets(widgetsData.widgets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      toast.error('Failed to fetch admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      const newTemplate = await webDesignerService.createTemplate({
        name: templateForm.name || '',
        description: templateForm.description || '',
        category: templateForm.category || WebDesignerTemplateCategory.BUSINESS,
        type: templateForm.type || WebDesignerProjectType.LANDING_PAGE,
        thumbnail: templateForm.thumbnail,
        preview: templateForm.preview,
        content: templateForm.content || {},
        styles: templateForm.styles || {},
        isPremium: templateForm.isPremium || false,
        isFeatured: templateForm.isFeatured || false,
        tags: templateForm.tags
      })
      
      setTemplates(prev => [newTemplate, ...prev])
      setIsEditingTemplate(false)
      setTemplateForm({})
      setSelectedTemplate(null)
      toast.success('Template created successfully')
    } catch (error) {
      toast.error('Failed to create template')
    }
  }

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return
    
    try {
      const updatedTemplate = await webDesignerService.updateTemplate(selectedTemplate.id, templateForm)
      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t))
      setIsEditingTemplate(false)
      setTemplateForm({})
      setSelectedTemplate(null)
      toast.success('Template updated successfully')
    } catch (error) {
      toast.error('Failed to update template')
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      await webDesignerService.deleteTemplate(id)
      setTemplates(prev => prev.filter(t => t.id !== id))
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null)
      }
      toast.success('Template deleted successfully')
    } catch (error) {
      toast.error('Failed to delete template')
    }
  }

  const handleCreateWidget = async () => {
    try {
      const newWidget = await webDesignerService.createWidget({
        name: widgetForm.name || '',
        description: widgetForm.description || '',
        type: widgetForm.type || WebDesignerWidgetType.TEXT,
        category: widgetForm.category || WebDesignerWidgetCategory.CONTENT,
        icon: widgetForm.icon,
        config: widgetForm.config || {},
        defaultContent: widgetForm.defaultContent || {},
        defaultStyles: widgetForm.defaultStyles || {},
        isPremium: widgetForm.isPremium || false,
        tags: widgetForm.tags
      })
      
      setWidgets(prev => [newWidget, ...prev])
      setIsEditingWidget(false)
      setWidgetForm({})
      setSelectedWidget(null)
      toast.success('Widget created successfully')
    } catch (error) {
      toast.error('Failed to create widget')
    }
  }

  const handleUpdateWidget = async () => {
    if (!selectedWidget) return
    
    try {
      const updatedWidget = await webDesignerService.updateWidget(selectedWidget.id, widgetForm)
      setWidgets(prev => prev.map(w => w.id === selectedWidget.id ? updatedWidget : w))
      setIsEditingWidget(false)
      setWidgetForm({})
      setSelectedWidget(null)
      toast.success('Widget updated successfully')
    } catch (error) {
      toast.error('Failed to update widget')
    }
  }

  const handleDeleteWidget = async (id: string) => {
    try {
      await webDesignerService.deleteWidget(id)
      setWidgets(prev => prev.filter(w => w.id !== id))
      if (selectedWidget?.id === id) {
        setSelectedWidget(null)
      }
      toast.success('Widget deleted successfully')
    } catch (error) {
      toast.error('Failed to delete widget')
    }
  }

  const startEditingTemplate = (template: WebDesignerTemplate) => {
    setSelectedTemplate(template)
    setTemplateForm(template)
    setIsEditingTemplate(true)
  }

  const startCreatingTemplate = () => {
    setSelectedTemplate(null)
    setTemplateForm({
      category: WebDesignerTemplateCategory.BUSINESS,
      type: WebDesignerProjectType.LANDING_PAGE,
      content: {},
      styles: {},
      isPremium: false,
      isFeatured: false,
      status: WebDesignerTemplateStatus.ACTIVE
    })
    setIsEditingTemplate(true)
  }

  const startEditingWidget = (widget: WebDesignerWidget) => {
    setSelectedWidget(widget)
    setWidgetForm(widget)
    setIsEditingWidget(true)
  }

  const startCreatingWidget = () => {
    setSelectedWidget(null)
    setWidgetForm({
      type: WebDesignerWidgetType.TEXT,
      category: WebDesignerWidgetCategory.CONTENT,
      config: {},
      defaultContent: {},
      defaultStyles: {},
      isPremium: false,
      status: WebDesignerWidgetStatus.ACTIVE
    })
    setIsEditingWidget(true)
  }

  if (loading) {
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
          <h1 className="text-3xl font-bold">Web Designer Admin</h1>
          <p className="text-muted-foreground">Manage templates, widgets, and monitor system performance</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.publishedProjects} published
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Templates</CardTitle>
                  <Layout className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalTemplates}</div>
                  <p className="text-xs text-muted-foreground">
                    Available templates
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Widgets</CardTitle>
                  <Widget className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalWidgets}</div>
                  <p className="text-xs text-muted-foreground">
                    Available widgets
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all projects
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Templates</CardTitle>
                  <CardDescription>Most used templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {analytics.popularTemplates.map((template, index) => (
                        <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.category}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{template.usageCount} uses</Badge>
                            {template.isPremium && <Badge variant="default">Premium</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Widgets</CardTitle>
                  <CardDescription>Most used widgets</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {analytics.popularWidgets.map((widget, index) => (
                        <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{widget.name}</h4>
                            <p className="text-sm text-muted-foreground">{widget.category}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{widget.usageCount} uses</Badge>
                            {widget.isPremium && <Badge variant="default">Premium</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          {monitoring && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      monitoring.systemHealth.status === 'healthy' ? 'bg-green-500' :
                      monitoring.systemHealth.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-2xl font-bold capitalize">{monitoring.systemHealth.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Uptime: {monitoring.systemHealth.uptime}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monitoring.systemHealth.cpu}%</div>
                  <p className="text-xs text-muted-foreground">
                    Current usage
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monitoring.systemHealth.memory}%</div>
                  <p className="text-xs text-muted-foreground">
                    Current usage
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monitoring.performance.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently online
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {monitoring && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monitoring.recentActivity.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="text-sm">
                            {new Date(activity.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {activity.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {activity.userId.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="text-sm">
                            {activity.projectId && `Project: ${activity.projectId.slice(0, 8)}...`}
                            {activity.templateId && `Template: ${activity.templateId.slice(0, 8)}...`}
                            {activity.widgetId && `Widget: ${activity.widgetId.slice(0, 8)}...`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Template Management</h2>
              <p className="text-muted-foreground">Manage website templates</p>
            </div>
            <Button onClick={startCreatingTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {template.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.category}</Badge>
                        </TableCell>
                        <TableCell>{template.type}</TableCell>
                        <TableCell>
                          <Badge variant={template.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {template.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{template.usageCount}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditingTemplate(template)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Widgets Tab */}
        <TabsContent value="widgets" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Widget Management</h2>
              <p className="text-muted-foreground">Manage website widgets</p>
            </div>
            <Button onClick={startCreatingWidget}>
              <Plus className="w-4 h-4 mr-2" />
              Create Widget
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Widgets</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {widgets.map((widget) => (
                      <TableRow key={widget.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{widget.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {widget.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{widget.category}</Badge>
                        </TableCell>
                        <TableCell>{widget.type}</TableCell>
                        <TableCell>
                          <Badge variant={widget.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {widget.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{widget.usageCount}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditingWidget(widget)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteWidget(widget.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Edit Dialog */}
      <Dialog open={isEditingTemplate} onOpenChange={setIsEditingTemplate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate ? 'Update template details' : 'Create a new template'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                value={templateForm.name || ''}
                onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={templateForm.description || ''}
                onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select 
                  value={templateForm.category} 
                  onValueChange={(value) => setTemplateForm({...templateForm, category: value as WebDesignerTemplateCategory})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WebDesignerTemplateCategory.BUSINESS}>Business</SelectItem>
                    <SelectItem value={WebDesignerTemplateCategory.PORTFOLIO}>Portfolio</SelectItem>
                    <SelectItem value={WebDesignerTemplateCategory.BLOG}>Blog</SelectItem>
                    <SelectItem value={WebDesignerTemplateCategory.ECOMMERCE}>E-commerce</SelectItem>
                    <SelectItem value={WebDesignerTemplateCategory.LANDING_PAGE}>Landing Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="template-type">Type</Label>
                <Select 
                  value={templateForm.type} 
                  onValueChange={(value) => setTemplateForm({...templateForm, type: value as WebDesignerProjectType})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LANDING_PAGE">Landing Page</SelectItem>
                    <SelectItem value="PORTFOLIO">Portfolio</SelectItem>
                    <SelectItem value="BLOG">Blog</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="template-premium"
                  checked={templateForm.isPremium || false}
                  onChange={(e) => setTemplateForm({...templateForm, isPremium: e.target.checked})}
                />
                <Label htmlFor="template-premium">Premium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="template-featured"
                  checked={templateForm.isFeatured || false}
                  onChange={(e) => setTemplateForm({...templateForm, isFeatured: e.target.checked})}
                />
                <Label htmlFor="template-featured">Featured</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditingTemplate(false)}>
                Cancel
              </Button>
              <Button onClick={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}>
                {selectedTemplate ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Widget Edit Dialog */}
      <Dialog open={isEditingWidget} onOpenChange={setIsEditingWidget}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedWidget ? 'Edit Widget' : 'Create Widget'}
            </DialogTitle>
            <DialogDescription>
              {selectedWidget ? 'Update widget details' : 'Create a new widget'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="widget-name">Name</Label>
              <Input
                id="widget-name"
                value={widgetForm.name || ''}
                onChange={(e) => setWidgetForm({...widgetForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="widget-description">Description</Label>
              <Textarea
                id="widget-description"
                value={widgetForm.description || ''}
                onChange={(e) => setWidgetForm({...widgetForm, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="widget-category">Category</Label>
                <Select 
                  value={widgetForm.category} 
                  onValueChange={(value) => setWidgetForm({...widgetForm, category: value as WebDesignerWidgetCategory})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WebDesignerWidgetCategory.LAYOUT}>Layout</SelectItem>
                    <SelectItem value={WebDesignerWidgetCategory.CONTENT}>Content</SelectItem>
                    <SelectItem value={WebDesignerWidgetCategory.MEDIA}>Media</SelectItem>
                    <SelectItem value={WebDesignerWidgetCategory.FORM}>Form</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="widget-type">Type</Label>
                <Select 
                  value={widgetForm.type} 
                  onValueChange={(value) => setWidgetForm({...widgetForm, type: value as WebDesignerWidgetType})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT">Text</SelectItem>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="BUTTON">Button</SelectItem>
                    <SelectItem value="CONTAINER">Container</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="widget-premium"
                checked={widgetForm.isPremium || false}
                onChange={(e) => setWidgetForm({...widgetForm, isPremium: e.target.checked})}
              />
              <Label htmlFor="widget-premium">Premium</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditingWidget(false)}>
                Cancel
              </Button>
              <Button onClick={selectedWidget ? handleUpdateWidget : handleCreateWidget}>
                {selectedWidget ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}