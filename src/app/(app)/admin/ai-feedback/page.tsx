"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Filter,
  Search,
  Download,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  FileText,
  LayoutGrid,
  Palette,
  Brain,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface AIFeedbackItem {
  id: string
  rating: number
  comment: string
  timestamp: string
  user: string
  feature: string
  logTimestamp: string
}

interface AIFeedbackResponse {
  feedback: AIFeedbackItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminAIFeedback() {
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<AIFeedbackItem[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    feature: '',
    rating: '',
    search: ''
  })
  const [selectedFeedback, setSelectedFeedback] = useState<AIFeedbackItem | null>(null)

  useEffect(() => {
    fetchFeedback()
  }, [pagination.page, filters])

  const fetchFeedback = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (filters.feature) params.append('feature', filters.feature)
      if (filters.rating) params.append('rating', filters.rating)

      const response = await fetch(`/api/v1/admin/ai/feedback?${params}`)
      if (!response.ok) throw new Error('Failed to fetch feedback')
      
      const data: AIFeedbackResponse = await response.json()
      setFeedback(data.feedback)
      setPagination(data.pagination)
    } catch (error) {
      toast.error('Failed to load feedback data')
    } finally {
      setLoading(false)
    }
  }

  const exportFeedback = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.feature) params.append('feature', filters.feature)
      if (filters.rating) params.append('rating', filters.rating)

      const response = await fetch(`/api/v1/admin/ai/feedback/export?${params}`)
      if (!response.ok) throw new Error('Failed to export feedback')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-feedback-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Feedback exported successfully')
    } catch (error) {
      toast.error('Failed to export feedback')
    }
  }

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'content_generation': return <FileText className="w-4 h-4" />
      case 'layout_suggestion': return <LayoutGrid className="w-4 h-4" />
      case 'color_palette_generation': return <Palette className="w-4 h-4" />
      case 'seo_optimization': return <Search className="w-4 h-4" />
      case 'image_enhancement': return <Brain className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  const formatFeatureName = (feature: string) => {
    return feature.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRatingBadgeVariant = (rating: number) => {
    if (rating >= 4) return 'default'
    if (rating >= 3) return 'secondary'
    return 'destructive'
  }

  const filteredFeedback = feedback.filter(item => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        item.user.toLowerCase().includes(searchLower) ||
        item.comment.toLowerCase().includes(searchLower) ||
        item.feature.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const averageRating = feedback.length > 0 
    ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length 
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: feedback.filter(item => item.rating === rating).length,
    percentage: feedback.length > 0 ? (feedback.filter(item => item.rating === rating).length / feedback.length) * 100 : 0
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Feedback Management</h1>
          <p className="text-muted-foreground">Review and analyze user feedback on AI features</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchFeedback}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportFeedback}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all AI features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              User satisfaction score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Feedback</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((feedback.filter(item => item.rating >= 4).length / feedback.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              4+ star ratings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedback.filter(item => item.rating <= 2).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Low ratings (1-2 stars)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Feature</label>
              <Select value={filters.feature} onValueChange={(value) => setFilters(prev => ({ ...prev, feature: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All features" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Features</SelectItem>
                  <SelectItem value="content_generation">Content Generation</SelectItem>
                  <SelectItem value="layout_suggestion">Layout Suggestions</SelectItem>
                  <SelectItem value="color_palette_generation">Color Palettes</SelectItem>
                  <SelectItem value="seo_optimization">SEO Optimization</SelectItem>
                  <SelectItem value="image_enhancement">Image Enhancement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <Select value={filters.rating} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search feedback..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ feature: '', rating: '', search: '' })}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
          <CardDescription>Breakdown of user ratings across all AI features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-16">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{rating}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>User Feedback</CardTitle>
          <CardDescription>Detailed feedback from users on AI features</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredFeedback.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getFeatureIcon(item.feature)}
                      <div>
                        <div className="font-medium">{formatFeatureName(item.feature)}</div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          <User className="w-3 h-3" />
                          <span>{item.user}</span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRatingBadgeVariant(item.rating)}>
                        <Star className="w-3 h-3 mr-1" />
                        {item.rating}/5
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Feedback Details</DialogTitle>
                            <DialogDescription>
                              Complete feedback information for {formatFeatureName(item.feature)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">User</label>
                                <div className="text-sm text-muted-foreground">{item.user}</div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Rating</label>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className={getRatingColor(item.rating)}>{item.rating}/5</span>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Feature</label>
                                <div className="text-sm text-muted-foreground">{formatFeatureName(item.feature)}</div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Date</label>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(item.timestamp).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Comment</label>
                              <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                                {item.comment || 'No comment provided'}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  {item.comment && (
                    <div className="text-sm text-muted-foreground">
                      {item.comment.length > 150 
                        ? `${item.comment.substring(0, 150)}...` 
                        : item.comment
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}