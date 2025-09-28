"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import TemplateRecommendations from '@/features/ai-designer/components/TemplateRecommendations'
import AIUsageAnalytics from '@/features/ai-designer/components/AIUsageAnalytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  Brain, 
  TrendingUp, 
  Target, 
  Palette, 
  Layout,
  Zap,
  Settings,
  Download,
  RefreshCw,
  Wand2,
  BarChart3,
  Lightbulb
} from 'lucide-react'

interface TemplateRecommendation {
  name: string
  category: string
  matchScore: number
  keyFeatures: string[]
  reasoning: string
  expectedImprovement: string
}

export default function WebDesignerAIPage() {
  const { user, loading } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateRecommendation | null>(null)

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
            <CardDescription>Please sign in to access AI-powered web designer</CardDescription>
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

  const handleTemplateSelect = (template: TemplateRecommendation) => {
    setSelectedTemplate(template)
    // Here you would typically create a new project from the template
    console.log('Selected template:', template)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI-Powered Web Designer</h1>
            <p className="text-gray-600">
              Create stunning websites with intelligent AI assistance and personalized recommendations
            </p>
          </div>
        </div>
      </div>

      {/* AI Capabilities Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Templates</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AI-Powered</div>
            <p className="text-xs text-muted-foreground">
              Personalized recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Design Quality</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              Professional results
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">70%</div>
            <p className="text-xs text-muted-foreground">
              Faster creation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8+</div>
            <p className="text-xs text-muted-foreground">
              AI tools available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            AI Tools
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          <TemplateRecommendations 
            userId={user.id} 
            onTemplateSelect={handleTemplateSelect}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AIUsageAnalytics userId={user.id} />
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Design Tools</CardTitle>
              <CardDescription>
                Powerful AI tools to enhance your web design workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    icon: <Brain className="w-6 h-6" />,
                    title: "Content Generation",
                    description: "Generate professional website copy and content",
                    status: "active",
                    action: "Generate Content"
                  },
                  {
                    icon: <Layout className="w-6 h-6" />,
                    title: "Layout Optimization",
                    description: "Get intelligent layout recommendations",
                    status: "active",
                    action: "Optimize Layout"
                  },
                  {
                    icon: <Palette className="w-6 h-6" />,
                    title: "Color Harmony",
                    description: "Generate perfect color schemes",
                    status: "active",
                    action: "Generate Colors"
                  },
                  {
                    icon: <TrendingUp className="w-6 h-6" />,
                    title: "SEO Enhancement",
                    description: "Improve search engine rankings",
                    status: "active",
                    action: "Enhance SEO"
                  },
                  {
                    icon: <Zap className="w-6 h-6" />,
                    title: "Image Enhancement",
                    description: "Enhance and process images with AI",
                    status: "active",
                    action: "Enhance Images"
                  },
                  {
                    icon: <RefreshCw className="w-6 h-6" />,
                    title: "Batch Processing",
                    description: "Process multiple items simultaneously",
                    status: "beta",
                    action: "Batch Process"
                  }
                ].map((tool, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {tool.icon}
                        <h3 className="font-medium">{tool.title}</h3>
                      </div>
                      <Badge 
                        variant={tool.status === 'active' ? 'default' : 'secondary'}
                      >
                        {tool.status === 'active' ? 'Active' : 'Beta'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                    <Button className="w-full" size="sm">
                      {tool.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Preferences</CardTitle>
                <CardDescription>
                  Customize your AI experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Design Style Preference</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Modern</option>
                    <option>Classic</option>
                    <option>Minimal</option>
                    <option>Creative</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color Preference</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Vibrant</option>
                    <option>Minimal</option>
                    <option>Corporate</option>
                    <option>Warm</option>
                    <option>Cool</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content Tone</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Friendly</option>
                    <option>Formal</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Limits</CardTitle>
                <CardDescription>
                  Manage your AI usage and costs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly AI Budget</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded-md" 
                    placeholder="100"
                    defaultValue="100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost Alerts</label>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="alerts" className="rounded" defaultChecked />
                    <label htmlFor="alerts" className="text-sm">
                      Enable cost alerts
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto-optimization</label>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-optimize" className="rounded" defaultChecked />
                    <label htmlFor="auto-optimize" className="text-sm">
                      Enable auto-optimization
                    </label>
                  </div>
                </div>
                <Button className="w-full">Save Preferences</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Template Info */}
      {selectedTemplate && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Selected Template</CardTitle>
            <CardDescription>
              You've selected: {selectedTemplate.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">{selectedTemplate.reasoning}</p>
                <Badge variant="outline">
                  {selectedTemplate.matchScore}% match
                </Badge>
              </div>
              <div className="space-x-2">
                <Button variant="outline">Preview</Button>
                <Button>Create Project</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}