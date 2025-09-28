"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Power, 
  Users, 
  DollarSign, 
  Zap, 
  Shield,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Globe,
  Database,
  Key,
  FileText,
  LayoutGrid,
  Palette,
  Brain,
  Search
} from 'lucide-react'
import { toast } from 'sonner'

interface AIFeatureSettings {
  id: string
  name: string
  description: string
  enabled: boolean
  userRoles: string[]
  pricingTier: string
  maxRequestsPerDay: number
  costPerRequest: number
  advancedSettings: {
    model: string
    temperature: number
    maxTokens: number
    timeout: number
  }
}

interface AIGlobalSettings {
  aiEnabled: boolean
  defaultModel: string
  apiRateLimit: number
  costMonitoring: boolean
  userQuotas: {
    contentGeneration: number
    layoutSuggestions: number
    colorPalettes: number
    seoOptimizations: number
    imageEnhancements: number
  }
  advancedFeatures: {
    batchProcessing: boolean
    realTimeSuggestions: boolean
    personalization: boolean
    multilingual: boolean
  }
}

export default function AdminAISettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [globalSettings, setGlobalSettings] = useState<AIGlobalSettings>({
    aiEnabled: true,
    defaultModel: 'gpt-4',
    apiRateLimit: 1000,
    costMonitoring: true,
    userQuotas: {
      contentGeneration: 50,
      layoutSuggestions: 25,
      colorPalettes: 15,
      seoOptimizations: 25,
      imageEnhancements: 10
    },
    advancedFeatures: {
      batchProcessing: true,
      realTimeSuggestions: true,
      personalization: true,
      multilingual: false
    }
  })
  
  const [featureSettings, setFeatureSettings] = useState<AIFeatureSettings[]>([
    {
      id: 'content_generation',
      name: 'Content Generation',
      description: 'AI-powered content creation for websites',
      enabled: true,
      userRoles: ['USER', 'PREMIUM', 'ADMIN'],
      pricingTier: 'STARTER',
      maxRequestsPerDay: 50,
      costPerRequest: 0.001,
      advancedSettings: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 500,
        timeout: 30
      }
    },
    {
      id: 'layout_suggestion',
      name: 'Layout Suggestions',
      description: 'Intelligent layout recommendations',
      enabled: true,
      userRoles: ['USER', 'PREMIUM', 'ADMIN'],
      pricingTier: 'STARTER',
      maxRequestsPerDay: 25,
      costPerRequest: 0.003,
      advancedSettings: {
        model: 'gpt-4',
        temperature: 0.6,
        maxTokens: 2000,
        timeout: 45
      }
    },
    {
      id: 'color_palette_generation',
      name: 'Color Palette Generation',
      description: 'AI-generated color schemes',
      enabled: true,
      userRoles: ['USER', 'PREMIUM', 'ADMIN'],
      pricingTier: 'STARTER',
      maxRequestsPerDay: 15,
      costPerRequest: 0.001,
      advancedSettings: {
        model: 'gpt-4',
        temperature: 0.8,
        maxTokens: 500,
        timeout: 20
      }
    },
    {
      id: 'seo_optimization',
      name: 'SEO Optimization',
      description: 'Search engine optimization suggestions',
      enabled: true,
      userRoles: ['USER', 'PREMIUM', 'ADMIN'],
      pricingTier: 'STARTER',
      maxRequestsPerDay: 25,
      costPerRequest: 0.001,
      advancedSettings: {
        model: 'gpt-4',
        temperature: 0.5,
        maxTokens: 600,
        timeout: 25
      }
    },
    {
      id: 'image_enhancement',
      name: 'Image Enhancement',
      description: 'AI-powered image processing and enhancement',
      enabled: true,
      userRoles: ['PREMIUM', 'ADMIN'],
      pricingTier: 'PREMIUM',
      maxRequestsPerDay: 10,
      costPerRequest: 0.008,
      advancedSettings: {
        model: 'dall-e-3',
        temperature: 0.7,
        maxTokens: 1000,
        timeout: 60
      }
    }
  ])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use the default settings
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // In a real implementation, this would save to an API
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const toggleFeature = (featureId: string, enabled: boolean) => {
    setFeatureSettings(prev => 
      prev.map(feature => 
        feature.id === featureId ? { ...feature, enabled } : feature
      )
    )
  }

  const updateGlobalSetting = (key: keyof AIGlobalSettings, value: any) => {
    setGlobalSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateUserQuota = (feature: keyof AIGlobalSettings['userQuotas'], value: number) => {
    setGlobalSettings(prev => ({
      ...prev,
      userQuotas: { ...prev.userQuotas, [feature]: value }
    }))
  }

  const updateAdvancedFeature = (feature: keyof AIGlobalSettings['advancedFeatures'], value: boolean) => {
    setGlobalSettings(prev => ({
      ...prev,
      advancedFeatures: { ...prev.advancedFeatures, [feature]: value }
    }))
  }

  const getFeatureIcon = (featureId: string) => {
    switch (featureId) {
      case 'content_generation': return <FileText className="w-5 h-5" />
      case 'layout_suggestion': return <LayoutGrid className="w-5 h-5" />
      case 'color_palette_generation': return <Palette className="w-5 h-5" />
      case 'seo_optimization': return <Search className="w-5 h-5" />
      case 'image_enhancement': return <Brain className="w-5 h-5" />
      default: return <Zap className="w-5 h-5" />
    }
  }

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
          <h1 className="text-3xl font-bold">AI Settings Management</h1>
          <p className="text-muted-foreground">Configure AI features, quotas, and system settings</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Global Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Power className="w-5 h-5 mr-2" />
            Global AI Status
          </CardTitle>
          <CardDescription>Master control for all AI features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Switch
                checked={globalSettings.aiEnabled}
                onCheckedChange={(checked) => updateGlobalSetting('aiEnabled', checked)}
              />
              <div>
                <div className="font-medium">AI Features Enabled</div>
                <div className="text-sm text-muted-foreground">
                  {globalSettings.aiEnabled ? 'All AI features are active' : 'All AI features are disabled'}
                </div>
              </div>
            </div>
            <Badge variant={globalSettings.aiEnabled ? 'default' : 'secondary'}>
              {globalSettings.aiEnabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features">Feature Settings</TabsTrigger>
          <TabsTrigger value="quotas">User Quotas</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          <TabsTrigger value="monitoring">Cost Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-6">
            {featureSettings.map((feature) => (
              <Card key={feature.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getFeatureIcon(feature.id)}
                      <div>
                        <CardTitle className="text-lg">{feature.name}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={(checked) => toggleFeature(feature.id, checked)}
                        disabled={!globalSettings.aiEnabled}
                      />
                      <Badge variant={feature.enabled ? 'default' : 'secondary'}>
                        {feature.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Pricing Tier</Label>
                      <Select value={feature.pricingTier} disabled>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STARTER">Starter</SelectItem>
                          <SelectItem value="PREMIUM">Premium</SelectItem>
                          <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Daily Limit</Label>
                      <Input
                        type="number"
                        value={feature.maxRequestsPerDay}
                        disabled
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Cost per Request</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={feature.costPerRequest}
                        disabled
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Model</Label>
                      <Select value={feature.advancedSettings.model} disabled>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Allowed User Roles</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {feature.userRoles.map((role) => (
                        <Badge key={role} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quotas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                User Quotas
              </CardTitle>
              <CardDescription>Daily usage limits for each AI feature</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(globalSettings.userQuotas).map(([feature, quota]) => (
                  <div key={feature} className="space-y-2">
                    <Label className="text-sm font-medium capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Input
                      type="number"
                      value={quota}
                      onChange={(e) => updateUserQuota(feature as keyof typeof globalSettings.userQuotas, parseInt(e.target.value))}
                      min="0"
                      max="1000"
                    />
                    <div className="text-xs text-muted-foreground">
                      Requests per day per user
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Advanced Features
                </CardTitle>
                <CardDescription>Enable or disable advanced AI capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(globalSettings.advancedFeatures).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium capitalize">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {feature === 'batchProcessing' && 'Process multiple AI requests simultaneously'}
                          {feature === 'realTimeSuggestions' && 'Show AI suggestions as users type'}
                          {feature === 'personalization' && 'Learn from user behavior to improve suggestions'}
                          {feature === 'multilingual' && 'Support for multiple languages'}
                        </div>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => updateAdvancedFeature(feature as keyof typeof globalSettings.advancedFeatures, checked)}
                        disabled={!globalSettings.aiEnabled}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  System Configuration
                </CardTitle>
                <CardDescription>Core AI system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Default Model</Label>
                    <Select value={globalSettings.defaultModel} onValueChange={(value) => updateGlobalSetting('defaultModel', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-3">Claude 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">API Rate Limit (requests/minute)</Label>
                    <Input
                      type="number"
                      value={globalSettings.apiRateLimit}
                      onChange={(e) => updateGlobalSetting('apiRateLimit', parseInt(e.target.value))}
                      min="1"
                      max="10000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Cost Monitoring
              </CardTitle>
              <CardDescription>Track and manage AI usage costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Cost Monitoring</div>
                    <div className="text-sm text-muted-foreground">
                      Track API costs and set budget alerts
                    </div>
                  </div>
                  <Switch
                    checked={globalSettings.costMonitoring}
                    onCheckedChange={(checked) => updateGlobalSetting('costMonitoring', checked)}
                  />
                </div>
                
                {globalSettings.costMonitoring && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Monthly Budget</Label>
                      <Input type="number" placeholder="1000" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Alert Threshold (%)</Label>
                      <Input type="number" placeholder="80" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Notification Email</Label>
                      <Input type="email" placeholder="admin@example.com" className="mt-1" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Usage Statistics
              </CardTitle>
              <CardDescription>Current usage overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">1,247</div>
                  <div className="text-sm text-muted-foreground">Total Requests Today</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">$12.47</div>
                  <div className="text-sm text-muted-foreground">Cost Today</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">98.5%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">245ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}