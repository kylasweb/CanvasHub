"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Star, 
  RefreshCw, 
  Filter,
  Search,
  Zap,
  Palette,
  Layout,
  ShoppingCart,
  Briefcase,
  Users
} from 'lucide-react'

interface TemplateRecommendation {
  name: string
  category: string
  matchScore: number
  keyFeatures: string[]
  reasoning: string
  expectedImprovement: string
}

interface TemplateRecommendationsProps {
  userId: string
  onTemplateSelect?: (template: TemplateRecommendation) => void
}

export default function TemplateRecommendations({ userId, onTemplateSelect }: TemplateRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<TemplateRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    industry: '',
    projectType: 'website',
    limit: '10'
  })

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams(filters)
      const response = await fetch(`/api/v1/ai/template-recommendations?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }
      
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [filters.industry, filters.projectType])

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'business':
        return <Briefcase className="w-5 h-5" />
      case 'portfolio':
        return <Users className="w-5 h-5" />
      case 'e-commerce':
        return <ShoppingCart className="w-5 h-5" />
      case 'creative':
        return <Palette className="w-5 h-5" />
      default:
        return <Layout className="w-5 h-5" />
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 75) return 'text-blue-600 bg-blue-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 
    'Real Estate', 'Hospitality', 'Manufacturing', 'Consulting', 'Creative'
  ]

  const projectTypes = [
    { value: 'website', label: 'Website' },
    { value: 'landing-page', label: 'Landing Page' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'blog', label: 'Blog' },
    { value: 'e-commerce', label: 'E-commerce' },
    { value: 'saas', label: 'SaaS' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Template Recommendations
          </h2>
          <p className="text-gray-600">
            Personalized template suggestions based on your preferences and usage patterns
          </p>
        </div>
        <Button onClick={fetchRecommendations} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Recommendation Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Industries</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry.toLowerCase()}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type</Label>
              <Select value={filters.projectType} onValueChange={(value) => setFilters(prev => ({ ...prev, projectType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Number of Recommendations</Label>
              <Select value={filters.limit} onValueChange={(value) => setFilters(prev => ({ ...prev, limit: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchRecommendations} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((template, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {template.name}
                      </CardTitle>
                      <CardDescription>{template.category}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getMatchScoreColor(template.matchScore)}>
                    {template.matchScore}% match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Features */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Key Features
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {template.keyFeatures.slice(0, 3).map((feature, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {template.keyFeatures.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.keyFeatures.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Reasoning */}
                <div>
                  <h4 className="font-medium mb-1 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Why This Template
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {template.reasoning}
                  </p>
                </div>

                {/* Expected Improvement */}
                <div>
                  <h4 className="font-medium mb-1 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Expected Improvement
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {template.expectedImprovement}
                  </p>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full" 
                  onClick={() => onTemplateSelect?.(template)}
                >
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && recommendations.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Recommendations Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or check back later for personalized recommendations.
              </p>
              <Button onClick={fetchRecommendations}>
                Generate Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}