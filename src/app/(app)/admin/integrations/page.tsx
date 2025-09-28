'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Settings, 
  Globe, 
  Shield, 
  Database,
  Mail,
  MessageSquare,
  Zap,
  Smartphone,
  CreditCard,
  Cloud,
  Github,
  Slack,
  Facebook,
  Twitter,
  Link,
  Unlink,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search
} from 'lucide-react'
import { toast } from 'sonner'

interface Integration {
  id: string
  name: string
  description: string
  category: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  icon: string
  isConnected: boolean
  lastSync?: string
  config: Record<string, any>
  usage: {
    requests: number
    lastUsed?: string
  }
  features: string[]
  pricing?: 'free' | 'paid' | 'freemium'
  documentation?: string
  supportEmail?: string
}

interface IntegrationStats {
  totalIntegrations: number
  connectedIntegrations: number
  failedIntegrations: number
  totalApiCalls: number
  popularCategories: Array<{
    category: string
    count: number
  }>
  recentActivity: Array<{
    action: string
    integration: string
    timestamp: string
    status: string
  }>
}

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Stripe',
    description: 'Payment processing and subscription management',
    category: 'Payment',
    status: 'connected',
    icon: 'stripe',
    isConnected: true,
    lastSync: '2024-01-20T14:30:00Z',
    config: { apiKey: '•••••••••••••••••••••••••', webhookSecret: '•••••••••••••••••••••••••' },
    usage: { requests: 15420, lastUsed: '2024-01-20T14:30:00Z' },
    features: ['Payment Processing', 'Subscription Management', 'Webhooks', 'Refunds'],
    pricing: 'paid',
    documentation: 'https://docs.stripe.com',
    supportEmail: 'support@stripe.com'
  },
  {
    id: '2',
    name: 'SendGrid',
    description: 'Email delivery and marketing automation',
    category: 'Communication',
    status: 'connected',
    icon: 'sendgrid',
    isConnected: true,
    lastSync: '2024-01-20T14:25:00Z',
    config: { apiKey: '•••••••••••••••••••••••••' },
    usage: { requests: 8934, lastUsed: '2024-01-20T14:25:00Z' },
    features: ['Email Sending', 'Templates', 'Analytics', 'Automation'],
    pricing: 'freemium',
    documentation: 'https://docs.sendgrid.com',
    supportEmail: 'support@sendgrid.com'
  },
  {
    id: '3',
    name: 'Slack',
    description: 'Team communication and collaboration',
    category: 'Communication',
    status: 'connected',
    icon: 'slack',
    isConnected: true,
    lastSync: '2024-01-20T14:20:00Z',
    config: { webhookUrl: 'https://hooks.slack.com/services/•••••••••••••••••••••••••' },
    usage: { requests: 3456, lastUsed: '2024-01-20T14:20:00Z' },
    features: ['Notifications', 'Channel Messages', 'File Sharing', 'Bots'],
    pricing: 'free',
    documentation: 'https://api.slack.com',
    supportEmail: 'support@slack.com'
  },
  {
    id: '4',
    name: 'Google Analytics',
    description: 'Website analytics and user behavior tracking',
    category: 'Analytics',
    status: 'error',
    icon: 'google',
    isConnected: false,
    config: { trackingId: 'UA-••••••••-•' },
    usage: { requests: 0 },
    features: ['Page Views', 'User Tracking', 'Events', 'Conversion Tracking'],
    pricing: 'free',
    documentation: 'https://developers.google.com/analytics',
    supportEmail: 'support@google.com'
  },
  {
    id: '5',
    name: 'GitHub',
    description: 'Version control and code collaboration',
    category: 'Development',
    status: 'disconnected',
    icon: 'github',
    isConnected: false,
    config: {},
    usage: { requests: 0 },
    features: ['Repository Management', 'Webhooks', 'Actions', 'Issues'],
    pricing: 'free',
    documentation: 'https://docs.github.com',
    supportEmail: 'support@github.com'
  },
  {
    id: '6',
    name: 'Twilio',
    description: 'SMS and voice communication platform',
    category: 'Communication',
    status: 'pending',
    icon: 'twilio',
    isConnected: false,
    config: {},
    usage: { requests: 0 },
    features: ['SMS', 'Voice Calls', 'WhatsApp', 'Video'],
    pricing: 'paid',
    documentation: 'https://www.twilio.com/docs',
    supportEmail: 'support@twilio.com'
  }
]

const mockStats: IntegrationStats = {
  totalIntegrations: 6,
  connectedIntegrations: 3,
  failedIntegrations: 1,
  totalApiCalls: 27810,
  popularCategories: [
    { category: 'Communication', count: 3 },
    { category: 'Payment', count: 1 },
    { category: 'Analytics', count: 1 },
    { category: 'Development', count: 1 }
  ],
  recentActivity: [
    { action: 'connected', integration: 'Stripe', timestamp: '2024-01-20T14:30:00Z', status: 'success' },
    { action: 'synced', integration: 'SendGrid', timestamp: '2024-01-20T14:25:00Z', status: 'success' },
    { action: 'disconnected', integration: 'Google Analytics', timestamp: '2024-01-20T14:15:00Z', status: 'error' },
    { action: 'connected', integration: 'Slack', timestamp: '2024-01-20T14:10:00Z', status: 'success' }
  ]
}

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations)
  const [stats] = useState<IntegrationStats>(mockStats)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = searchTerm === '' || 
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || integration.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || integration.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800'
      case 'disconnected':
        return 'bg-gray-100 text-gray-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-gray-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Payment':
        return <CreditCard className="w-5 h-5" />
      case 'Communication':
        return <MessageSquare className="w-5 h-5" />
      case 'Analytics':
        return <Database className="w-5 h-5" />
      case 'Development':
        return <Github className="w-5 h-5" />
      default:
        return <Settings className="w-5 h-5" />
    }
  }

  const getPricingColor = (pricing?: string) => {
    switch (pricing) {
      case 'free':
        return 'bg-green-100 text-green-800'
      case 'paid':
        return 'bg-red-100 text-red-800'
      case 'freemium':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleToggleConnection = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === integrationId
        ? { 
            ...integration, 
            isConnected: !integration.isConnected,
            status: integration.isConnected ? 'disconnected' : 'connected',
            lastSync: !integration.isConnected ? new Date().toISOString() : integration.lastSync
          }
        : integration
    ))
    toast.success(`Integration ${integrations.find(i => i.id === integrationId)?.isConnected ? 'connected' : 'disconnected'}!`)
  }

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsConfigDialogOpen(true)
  }

  const handleSaveConfig = () => {
    setIsConfigDialogOpen(false)
    setSelectedIntegration(null)
    toast.success('Configuration saved successfully!')
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const categories = Array.from(new Set(integrations.map(i => i.category)))

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Integrations</h1>
            <p className="text-muted-foreground">
              Manage third-party integrations and API connections
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalIntegrations}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.connectedIntegrations} connected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.totalApiCalls)}</div>
                <p className="text-xs text-muted-foreground">
                  Total requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.failedIntegrations}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {((stats.connectedIntegrations / stats.totalIntegrations) * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Connected integrations
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search integrations..."
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="connected">Connected</SelectItem>
                      <SelectItem value="disconnected">Disconnected</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getCategoryIcon(integration.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription className="text-sm">{integration.category}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integration.status)}
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {integration.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.features.length - 3}
                        </Badge>
                      )}
                    </div>

                    {integration.pricing && (
                      <Badge className={getPricingColor(integration.pricing)}>
                        {integration.pricing}
                      </Badge>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span>API Calls:</span>
                      <span className="font-medium">{formatNumber(integration.usage.requests)}</span>
                    </div>

                    {integration.lastSync && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Last Sync:</span>
                        <span className="text-muted-foreground">
                          {new Date(integration.lastSync).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={integration.isConnected}
                          onCheckedChange={() => handleToggleConnection(integration.id)}
                        />
                        <span className="text-sm">
                          {integration.isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleConfigure(integration)}>
                          <Settings className="w-4 h-4" />
                        </Button>
                        {integration.documentation && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={integration.documentation} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Categories</CardTitle>
                <CardDescription>
                  Most used integration categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.popularCategories.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category.category)}
                        <span>{category.category}</span>
                      </div>
                      <Badge variant="outline">{category.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>
                  Integration usage metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total API Calls</span>
                    <Badge variant="secondary">{formatNumber(stats.totalApiCalls)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Connected Integrations</span>
                    <Badge className="bg-green-100 text-green-800">{stats.connectedIntegrations}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Failed Integrations</span>
                    <Badge className="bg-red-100 text-red-800">{stats.failedIntegrations}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Success Rate</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {((stats.connectedIntegrations / stats.totalIntegrations) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest integration activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {activity.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium capitalize">{activity.action} {activity.integration}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge className={activity.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Update integration settings and configuration
            </DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={selectedIntegration.config.apiKey || ''}
                    placeholder="Enter API key"
                  />
                </div>
                <div>
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={selectedIntegration.config.webhookUrl || ''}
                    placeholder="Enter webhook URL"
                  />
                </div>
              </div>
              
              <div>
                <Label>Features</Label>
                <div className="mt-2 space-y-2">
                  {selectedIntegration.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Switch id={`feature-${index}`} defaultChecked />
                      <Label htmlFor={`feature-${index}`} className="text-sm">
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveConfig}>
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}