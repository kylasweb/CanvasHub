"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AIUsageAnalytics from '@/features/ai-designer/components/AIUsageAnalytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target, 
  DollarSign, 
  Clock,
  BarChart3,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react'

export default function AIAnalyticsPage() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access AI analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Analytics Dashboard</h1>
        <p className="text-gray-600">
          Track your AI usage, optimize costs, and gain insights into your creative workflow
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Features</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Available features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">70%</div>
            <p className="text-xs text-muted-foreground">
              Time saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              User satisfaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.5K</div>
            <p className="text-xs text-muted-foreground">
              Monthly savings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Available AI Features</CardTitle>
          <CardDescription>
            Explore the AI-powered features available to enhance your creative workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <Target className="w-6 h-6" />,
                title: "Content Generation",
                description: "Create professional website copy and content",
                status: "active"
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Layout Suggestions",
                description: "Get intelligent layout recommendations",
                status: "active"
              },
              {
                icon: <RefreshCw className="w-6 h-6" />,
                title: "Color Palettes",
                description: "Generate harmonious color schemes",
                status: "active"
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "SEO Optimization",
                description: "Improve search engine rankings",
                status: "active"
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Image Enhancement",
                description: "Enhance and process images with AI",
                status: "active"
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Batch Processing",
                description: "Process multiple items simultaneously",
                status: "active"
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "ML Recommendations",
                description: "Get personalized suggestions",
                status: "beta"
              },
              {
                icon: <Settings className="w-6 h-6" />,
                title: "Accessibility Tools",
                description: "Ensure your designs are accessible",
                status: "coming_soon"
              }
            ].map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {feature.icon}
                    <h3 className="font-medium">{feature.title}</h3>
                  </div>
                  <Badge 
                    variant={
                      feature.status === 'active' ? 'default' :
                      feature.status === 'beta' ? 'secondary' : 'outline'
                    }
                  >
                    {feature.status === 'active' ? 'Active' :
                     feature.status === 'beta' ? 'Beta' : 'Coming Soon'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Analytics */}
      <AIUsageAnalytics userId={user.id} />

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>AI Settings</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </Button>
      </div>
    </div>
  )
}