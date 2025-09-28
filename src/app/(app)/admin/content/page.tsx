'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Globe,
  Calendar,
  Users,
  TrendingUp,
  MessageSquare,
  Image,
  Video,
  File,
  Grid,
  List,
  Settings,
  ExternalLink,
  Copy,
  Share2,
  Star
} from 'lucide-react'
import { toast } from 'sonner'

interface ContentPage {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  type: 'page' | 'post' | 'landing' | 'article'
  status: 'published' | 'draft' | 'archived'
  author: string
  category: string
  tags: string[]
  featuredImage?: string
  seoTitle?: string
  seoDescription?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  views: number
  isFeatured: boolean
  allowComments: boolean
  template: string
}

interface ContentStats {
  totalPages: number
  publishedPages: number
  draftPages: number
  totalViews: number
  topCategories: Array<{
    category: string
    count: number
  }>
  recentActivity: Array<{
    action: string
    page: string
    author: string
    timestamp: string
  }>
}

const mockContentPages: ContentPage[] = [
  {
    id: '1',
    title: 'About Us',
    slug: 'about-us',
    content: '<p>We are a leading company in web design and development...</p>',
    excerpt: 'Learn about our company, mission, and values',
    type: 'page',
    status: 'published',
    author: 'John Doe',
    category: 'Company',
    tags: ['about', 'company', 'mission'],
    featuredImage: '/images/about-us.jpg',
    seoTitle: 'About Us - Our Company Story',
    seoDescription: 'Learn about our company history, mission, and the team behind our success.',
    publishedAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-20T14:20:00Z',
    views: 15420,
    isFeatured: false,
    allowComments: false,
    template: 'default'
  },
  {
    id: '2',
    title: 'Services',
    slug: 'services',
    content: '<p>We offer a comprehensive range of web design and development services...</p>',
    excerpt: 'Discover our comprehensive range of professional services',
    type: 'page',
    status: 'published',
    author: 'Jane Smith',
    category: 'Services',
    tags: ['services', 'web design', 'development'],
    featuredImage: '/images/services.jpg',
    seoTitle: 'Our Services - Professional Web Design & Development',
    seoDescription: 'Explore our comprehensive web design, development, and digital marketing services.',
    publishedAt: '2024-01-12T14:20:00Z',
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    views: 12345,
    isFeatured: true,
    allowComments: false,
    template: 'services'
  },
  {
    id: '3',
    title: 'Blog: The Future of Web Design',
    slug: 'blog-future-web-design',
    content: '<p>Web design is constantly evolving with new technologies and trends...</p>',
    excerpt: 'Exploring the latest trends and technologies shaping the future of web design',
    type: 'post',
    status: 'published',
    author: 'Mike Johnson',
    category: 'Blog',
    tags: ['web design', 'trends', 'technology', 'future'],
    featuredImage: '/images/blog-future-web-design.jpg',
    seoTitle: 'The Future of Web Design - Trends and Technologies',
    seoDescription: 'Discover the latest trends and technologies that are shaping the future of web design.',
    publishedAt: '2024-01-18T09:15:00Z',
    createdAt: '2024-01-15T13:30:00Z',
    updatedAt: '2024-01-22T11:20:00Z',
    views: 8765,
    isFeatured: true,
    allowComments: true,
    template: 'blog-post'
  },
  {
    id: '4',
    title: 'Contact Us',
    slug: 'contact-us',
    content: '<p>Get in touch with our team for any inquiries or support...</p>',
    excerpt: 'Reach out to us for inquiries, support, or collaboration opportunities',
    type: 'page',
    status: 'published',
    author: 'Sarah Wilson',
    category: 'Contact',
    tags: ['contact', 'support', 'inquiry'],
    featuredImage: '/images/contact-us.jpg',
    seoTitle: 'Contact Us - Get in Touch',
    seoDescription: 'Contact our team for inquiries, support, or collaboration opportunities.',
    publishedAt: '2024-01-10T16:45:00Z',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-19T09:30:00Z',
    views: 6543,
    isFeatured: false,
    allowComments: false,
    template: 'contact'
  },
  {
    id: '5',
    title: 'Pricing Plans',
    slug: 'pricing-plans',
    content: '<p>Choose the perfect plan for your business needs...</p>',
    excerpt: 'Flexible pricing plans designed for businesses of all sizes',
    type: 'landing',
    status: 'draft',
    author: 'Tom Brown',
    category: 'Pricing',
    tags: ['pricing', 'plans', 'business'],
    featuredImage: '/images/pricing-plans.jpg',
    seoTitle: 'Pricing Plans - Choose Your Perfect Plan',
    seoDescription: 'Explore our flexible pricing plans designed for businesses of all sizes.',
    createdAt: '2024-01-20T11:30:00Z',
    updatedAt: '2024-01-25T14:10:00Z',
    views: 0,
    isFeatured: false,
    allowComments: false,
    template: 'pricing'
  }
]

const mockStats: ContentStats = {
  totalPages: 47,
  publishedPages: 38,
  draftPages: 9,
  totalViews: 156789,
  topCategories: [
    { category: 'Company', count: 8 },
    { category: 'Services', count: 6 },
    { category: 'Blog', count: 12 },
    { category: 'Contact', count: 3 },
    { category: 'Pricing', count: 2 }
  ],
  recentActivity: [
    { action: 'published', page: 'Services', author: 'Jane Smith', timestamp: '2024-01-20T14:20:00Z' },
    { action: 'updated', page: 'About Us', author: 'John Doe', timestamp: '2024-01-20T14:20:00Z' },
    { action: 'created', page: 'Pricing Plans', author: 'Tom Brown', timestamp: '2024-01-20T11:30:00Z' },
    { action: 'published', page: 'Blog: The Future of Web Design', author: 'Mike Johnson', timestamp: '2024-01-18T09:15:00Z' },
    { action: 'updated', page: 'Contact Us', author: 'Sarah Wilson', timestamp: '2024-01-19T09:30:00Z' }
  ]
}

export default function AdminContentPage() {
  const [contentPages, setContentPages] = useState<ContentPage[]>(mockContentPages)
  const [stats] = useState<ContentStats>(mockStats)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null)

  const filteredPages = contentPages.filter(page => {
    const matchesSearch = searchTerm === '' || 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = typeFilter === 'all' || page.type === typeFilter
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || page.category === categoryFilter
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory
  })

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
        return <FileText className="w-4 h-4" />
      case 'post':
        return <MessageSquare className="w-4 h-4" />
      case 'landing':
        return <Globe className="w-4 h-4" />
      case 'article':
        return <File className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const handleCreatePage = () => {
    // Placeholder for create page logic
    setIsCreateDialogOpen(false)
    toast.success('Page creation started!')
  }

  const handleDeletePage = (pageId: string) => {
    setContentPages(prev => prev.filter(page => page.id !== pageId))
    toast.success('Page deleted successfully!')
  }

  const handleToggleStatus = (pageId: string) => {
    setContentPages(prev => prev.map(page =>
      page.id === pageId
        ? { 
            ...page, 
            status: page.status === 'published' ? 'draft' : 'published',
            publishedAt: page.status === 'draft' ? new Date().toISOString() : page.publishedAt
          }
        : page
    ))
    toast.success('Page status updated!')
  }

  const handleToggleFeatured = (pageId: string) => {
    setContentPages(prev => prev.map(page =>
      page.id === pageId
        ? { ...page, isFeatured: !page.isFeatured }
        : page
    ))
    toast.success('Page featured status updated!')
  }

  const categories = Array.from(new Set(contentPages.map(page => page.category)))

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Content Management</h1>
            <p className="text-muted-foreground">
              Manage landing pages, blog posts, and content pages
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
                  Create Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Content</DialogTitle>
                  <DialogDescription>
                    Add a new page, blog post, or landing page
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pageTitle">Title</Label>
                      <Input id="pageTitle" placeholder="Enter page title" />
                    </div>
                    <div>
                      <Label htmlFor="pageType">Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="page">Page</SelectItem>
                          <SelectItem value="post">Blog Post</SelectItem>
                          <SelectItem value="landing">Landing Page</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pageExcerpt">Excerpt</Label>
                    <Textarea id="pageExcerpt" placeholder="Enter page excerpt" rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pageCategory">Category</Label>
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
                    <div>
                      <Label htmlFor="pageTags">Tags (comma-separated)</Label>
                      <Input id="pageTags" placeholder="tag1, tag2, tag3" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePage}>
                      Create Content
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPages}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.publishedPages} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft Pages</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.draftPages}</div>
                <p className="text-xs text-muted-foreground">
                  Need review
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
                  Across all content
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Featured Content</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contentPages.filter(p => p.isFeatured).length}</div>
                <p className="text-xs text-muted-foreground">
                  Highlighted pages
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
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="page">Pages</SelectItem>
                      <SelectItem value="post">Blog Posts</SelectItem>
                      <SelectItem value="landing">Landing Pages</SelectItem>
                      <SelectItem value="article">Articles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
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
              </div>
            </CardContent>
          </Card>

          {/* Content List */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(page.type)}
                            <span className="font-medium">{page.title}</span>
                            {page.isFeatured && (
                              <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {page.excerpt}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {page.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{page.category}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(page.status)}>
                          {page.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatNumber(page.views)}</TableCell>
                      <TableCell>{page.author}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(page.id)}>
                            {page.status === 'published' ? '📝' : '📖'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleFeatured(page.id)}>
                            {page.isFeatured ? '⭐' : '☆'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePage(page.id)}>
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
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>
                  Most used content categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topCategories.map((category) => (
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
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest content management actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{activity.page}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.action} by {activity.author}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>
                Top performing content by views
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentPages
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 5)
                  .map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          {getTypeIcon(page.type)}
                        </div>
                        <div>
                          <div className="font-medium">{page.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {page.category} • {page.author}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-medium">{formatNumber(page.views)}</div>
                          <div className="text-sm text-muted-foreground">views</div>
                        </div>
                        <Badge className={getStatusColor(page.status)}>
                          {page.status}
                        </Badge>
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