'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Layout, 
  Code, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Copy,
  Search,
  Filter,
  Star,
  Grid,
  List,
  Palette,
  Smartphone,
  Monitor,
  Tablet,
  Settings,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  thumbnail: string
  preview: string
  downloads: number
  views: number
  rating: number
  isPremium: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  author: string
  framework: string
  responsive: boolean
  features: string[]
  fileSize: number
}

interface TemplateStats {
  totalTemplates: number
  premiumTemplates: number
  totalDownloads: number
  totalViews: number
  popularCategories: Array<{
    category: string
    count: number
  }>
  topFrameworks: Array<{
    framework: string
    count: number
  }>
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Modern Business',
    description: 'Clean and professional business website template',
    category: 'Business',
    tags: ['professional', 'corporate', 'clean'],
    thumbnail: '/templates/modern-business-thumb.jpg',
    preview: '/templates/modern-business-preview.jpg',
    downloads: 1542,
    views: 8934,
    rating: 4.8,
    isPremium: true,
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:20:00Z',
    author: 'John Doe',
    framework: 'React',
    responsive: true,
    features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Contact Form'],
    fileSize: 2048000
  },
  {
    id: '2',
    name: 'Creative Portfolio',
    description: 'Stunning portfolio template for creatives',
    category: 'Portfolio',
    tags: ['creative', 'portfolio', 'modern'],
    thumbnail: '/templates/creative-portfolio-thumb.jpg',
    preview: '/templates/creative-portfolio-preview.jpg',
    downloads: 987,
    views: 5432,
    rating: 4.6,
    isPremium: false,
    isActive: true,
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:30:00Z',
    author: 'Jane Smith',
    framework: 'Vue.js',
    responsive: true,
    features: ['Gallery', 'Blog', 'Contact', 'Animations'],
    fileSize: 1536000
  },
  {
    id: '3',
    name: 'E-commerce Store',
    description: 'Complete e-commerce solution template',
    category: 'E-commerce',
    tags: ['shop', 'store', 'commerce'],
    thumbnail: '/templates/ecommerce-store-thumb.jpg',
    preview: '/templates/ecommerce-store-preview.jpg',
    downloads: 2341,
    views: 12456,
    rating: 4.9,
    isPremium: true,
    isActive: true,
    createdAt: '2024-01-05T14:20:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
    author: 'Mike Johnson',
    framework: 'Next.js',
    responsive: true,
    features: ['Shopping Cart', 'Payment Gateway', 'Inventory', 'Admin Panel'],
    fileSize: 3072000
  },
  {
    id: '4',
    name: 'Blog Magazine',
    description: 'Modern blog and magazine template',
    category: 'Blog',
    tags: ['blog', 'magazine', 'content'],
    thumbnail: '/templates/blog-magazine-thumb.jpg',
    preview: '/templates/blog-magazine-preview.jpg',
    downloads: 756,
    views: 3876,
    rating: 4.4,
    isPremium: false,
    isActive: true,
    createdAt: '2024-01-08T11:45:00Z',
    updatedAt: '2024-01-19T09:20:00Z',
    author: 'Sarah Wilson',
    framework: 'React',
    responsive: true,
    features: ['Article System', 'Categories', 'Comments', 'SEO'],
    fileSize: 1024000
  },
  {
    id: '5',
    name: 'Landing Page',
    description: 'High-converting landing page template',
    category: 'Marketing',
    tags: ['landing', 'marketing', 'conversion'],
    thumbnail: '/templates/landing-page-thumb.jpg',
    preview: '/templates/landing-page-preview.jpg',
    downloads: 1123,
    views: 6543,
    rating: 4.7,
    isPremium: true,
    isActive: true,
    createdAt: '2024-01-12T13:30:00Z',
    updatedAt: '2024-01-21T15:10:00Z',
    author: 'Tom Brown',
    framework: 'HTML/CSS',
    responsive: true,
    features: ['Call to Action', 'Lead Capture', 'Analytics', 'A/B Testing'],
    fileSize: 512000
  }
]

const mockStats: TemplateStats = {
  totalTemplates: 47,
  premiumTemplates: 18,
  totalDownloads: 15678,
  totalViews: 89456,
  popularCategories: [
    { category: 'Business', count: 12 },
    { category: 'Portfolio', count: 8 },
    { category: 'E-commerce', count: 7 },
    { category: 'Blog', count: 6 },
    { category: 'Marketing', count: 5 }
  ],
  topFrameworks: [
    { framework: 'React', count: 18 },
    { framework: 'Vue.js', count: 12 },
    { framework: 'Next.js', count: 8 },
    { framework: 'HTML/CSS', count: 6 },
    { framework: 'Angular', count: 3 }
  ]
}

export default function AdminWebDesignsTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [stats] = useState<TemplateStats>(mockStats)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [frameworkFilter, setFrameworkFilter] = useState('all')
  const [premiumFilter, setPremiumFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    const matchesFramework = frameworkFilter === 'all' || template.framework === frameworkFilter
    const matchesPremium = premiumFilter === 'all' || 
      (premiumFilter === 'premium' && template.isPremium) ||
      (premiumFilter === 'free' && !template.isPremium)
    
    return matchesSearch && matchesCategory && matchesFramework && matchesPremium
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const handleCreateTemplate = () => {
    // Placeholder for create template logic
    setIsCreateDialogOpen(false)
    toast.success('Template creation started!')
  }

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId))
    toast.success('Template deleted successfully!')
  }

  const handleToggleStatus = (templateId: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId
        ? { ...template, isActive: !template.isActive }
        : template
    ))
    toast.success('Template status updated!')
  }

  const categories = Array.from(new Set(templates.map(template => template.category)))
  const frameworks = Array.from(new Set(templates.map(template => template.framework)))

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Web Design Templates</h1>
            <p className="text-muted-foreground">
              Manage and organize web design templates
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                  <DialogDescription>
                    Add a new web design template to the library
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input id="templateName" placeholder="Enter template name" />
                    </div>
                    <div>
                      <Label htmlFor="templateCategory">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="templateDescription">Description</Label>
                    <Textarea id="templateDescription" placeholder="Enter template description" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateFramework">Framework</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select framework" />
                        </SelectTrigger>
                        <SelectContent>
                          {frameworks.map(framework => (
                            <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="templateTags">Tags (comma-separated)</Label>
                      <Input id="templateTags" placeholder="tag1, tag2, tag3" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTemplate}>
                      Create Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                <Layout className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTemplates}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.premiumTemplates} premium
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.totalDownloads)}</div>
                <p className="text-xs text-muted-foreground">
                  Across all templates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.totalViews)}</div>
                <p className="text-xs text-muted-foreground">
                  Template views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templates.filter(t => t.isActive).length}</div>
                <p className="text-xs text-muted-foreground">
                  Currently available
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="framework">Framework</Label>
                  <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Frameworks</SelectItem>
                      {frameworks.map(framework => (
                        <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="premium">Price</Label>
                  <Select value={premiumFilter} onValueChange={setPremiumFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Templates</SelectItem>
                      <SelectItem value="premium">Premium Only</SelectItem>
                      <SelectItem value="free">Free Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <Layout className="w-16 h-16 text-gray-400" />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.category}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getRatingStars(template.rating)}
                          <span className="text-sm text-muted-foreground">({template.rating})</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>{formatNumber(template.downloads)} downloads</span>
                          <span>{formatNumber(template.views)} views</span>
                        </div>
                        {template.isPremium && (
                          <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Code className="w-3 h-3" />
                          <span>{template.framework}</span>
                          {template.responsive && (
                            <>
                              <Smartphone className="w-3 h-3" />
                              <span>Responsive</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={template.isActive}
                            onCheckedChange={() => handleToggleStatus(template.id)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {template.author}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.category}</Badge>
                        </TableCell>
                        <TableCell>{template.framework}</TableCell>
                        <TableCell>{formatNumber(template.downloads)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getRatingStars(template.rating)}
                            <span className="text-sm">({template.rating})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={template.isActive}
                              onCheckedChange={() => handleToggleStatus(template.id)}
                            />
                            <span className="text-sm">{template.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Categories</CardTitle>
                <CardDescription>
                  Most used template categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.popularCategories.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <span>{category.category}</span>
                      <Badge variant="outline">{category.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Frameworks</CardTitle>
                <CardDescription>
                  Most popular development frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topFrameworks.map((framework) => (
                    <div key={framework.framework} className="flex items-center justify-between">
                      <span>{framework.framework}</span>
                      <Badge variant="outline">{framework.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Template Performance</CardTitle>
              <CardDescription>
                Top performing templates by downloads and views
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates
                  .sort((a, b) => b.downloads - a.downloads)
                  .slice(0, 5)
                  .map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <Layout className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-medium">{formatNumber(template.downloads)}</div>
                          <div className="text-sm text-muted-foreground">downloads</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatNumber(template.views)}</div>
                          <div className="text-sm text-muted-foreground">views</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getRatingStars(template.rating)}
                          <span className="text-sm">({template.rating})</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}