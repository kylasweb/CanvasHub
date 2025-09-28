'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  Clock,
  Server,
  Database,
  Users,
  Shield,
  Zap,
  Activity,
  Settings,
  Globe,
  Smartphone
} from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  source: string
  category: string
  userId?: string
  ipAddress?: string
  userAgent?: string
  metadata: Record<string, any>
}

interface LogStats {
  totalLogs: number
  logsByLevel: {
    info: number
    warning: number
    error: number
    debug: number
  }
  logsByCategory: {
    system: number
    security: number
    user: number
    api: number
    database: number
    performance: number
  }
  recentErrors: Array<{
    message: string
    count: number
    lastSeen: string
  }>
  topSources: Array<{
    source: string
    count: number
  }>
}

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-20T14:30:00Z',
    level: 'info',
    message: 'User login successful',
    source: 'auth-service',
    category: 'user',
    userId: 'user_123',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    metadata: { method: 'password', provider: 'local' }
  },
  {
    id: '2',
    timestamp: '2024-01-20T14:28:00Z',
    level: 'warning',
    message: 'High memory usage detected',
    source: 'system-monitor',
    category: 'system',
    metadata: { memory_usage: '87%', threshold: '80%' }
  },
  {
    id: '3',
    timestamp: '2024-01-20T14:25:00Z',
    level: 'error',
    message: 'Database connection failed',
    source: 'database-service',
    category: 'database',
    metadata: { error_code: 'CONN_TIMEOUT', retry_count: 3 }
  },
  {
    id: '4',
    timestamp: '2024-01-20T14:20:00Z',
    level: 'info',
    message: 'API request processed',
    source: 'api-gateway',
    category: 'api',
    userId: 'user_456',
    ipAddress: '192.168.1.101',
    metadata: { endpoint: '/api/v1/users', method: 'GET', response_time: 245 }
  },
  {
    id: '5',
    timestamp: '2024-01-20T14:15:00Z',
    level: 'debug',
    message: 'Cache miss for user data',
    source: 'cache-service',
    category: 'performance',
    userId: 'user_789',
    metadata: { cache_key: 'user_789_profile', ttl: 3600 }
  },
  {
    id: '6',
    timestamp: '2024-01-20T14:10:00Z',
    level: 'error',
    message: 'Payment processing failed',
    source: 'payment-service',
    category: 'user',
    userId: 'user_321',
    metadata: { payment_id: 'pay_123', error: 'Insufficient funds' }
  },
  {
    id: '7',
    timestamp: '2024-01-20T14:05:00Z',
    level: 'warning',
    message: 'Unusual login attempt detected',
    source: 'security-service',
    category: 'security',
    userId: 'user_654',
    ipAddress: '203.0.113.1',
    userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
    metadata: { risk_score: 0.7, location: 'Unknown' }
  },
  {
    id: '8',
    timestamp: '2024-01-20T14:00:00Z',
    level: 'info',
    message: 'System backup completed successfully',
    source: 'backup-service',
    category: 'system',
    metadata: { backup_size: '2.3GB', duration: 245 }
  }
]

const mockStats: LogStats = {
  totalLogs: 15420,
  logsByLevel: {
    info: 8934,
    warning: 3456,
    error: 1234,
    debug: 1796
  },
  logsByCategory: {
    system: 4567,
    security: 2345,
    user: 3456,
    api: 2890,
    database: 1234,
    performance: 928
  },
  recentErrors: [
    { message: 'Database connection failed', count: 45, lastSeen: '2024-01-20T14:25:00Z' },
    { message: 'Payment processing failed', count: 23, lastSeen: '2024-01-20T14:10:00Z' },
    { message: 'API rate limit exceeded', count: 12, lastSeen: '2024-01-20T13:45:00Z' },
    { message: 'File upload failed', count: 8, lastSeen: '2024-01-20T13:30:00Z' },
    { message: 'Email delivery failed', count: 6, lastSeen: '2024-01-20T13:15:00Z' }
  ],
  topSources: [
    { source: 'auth-service', count: 3456 },
    { source: 'api-gateway', count: 2890 },
    { source: 'database-service', count: 1234 },
    { source: 'system-monitor', count: 987 },
    { source: 'security-service', count: 876 }
  ]
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs)
  const [stats] = useState<LogStats>(mockStats)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [timeRange, setTimeRange] = useState('1h')
  const [loading, setLoading] = useState(false)

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter
    const matchesSource = sourceFilter === 'all' || log.source === sourceFilter
    
    return matchesSearch && matchesLevel && matchesCategory && matchesSource
  })

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'debug':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />
      case 'debug':
        return <Settings className="w-4 h-4 text-gray-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system':
        return <Server className="w-4 h-4" />
      case 'security':
        return <Shield className="w-4 h-4" />
      case 'user':
        return <Users className="w-4 h-4" />
      case 'api':
        return <Globe className="w-4 h-4" />
      case 'database':
        return <Database className="w-4 h-4" />
      case 'performance':
        return <Zap className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const handleExportLogs = () => {
    // Placeholder for export functionality
    console.log('Exporting logs...')
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Logs</h1>
            <p className="text-muted-foreground">
              Monitor and analyze system activity logs
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportLogs}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="errors">Error Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.totalLogs)}</div>
                <p className="text-xs text-muted-foreground">
                  Last {timeRange}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Errors</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatNumber(stats.logsByLevel.error)}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warnings</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{formatNumber(stats.logsByLevel.warning)}</div>
                <p className="text-xs text-muted-foreground">
                  Review recommended
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.logsByCategory.security)}</div>
                <p className="text-xs text-muted-foreground">
                  Security related
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
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
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
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      {stats.topSources.map(source => (
                        <SelectItem key={source.source} value={source.source}>{source.source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLevelIcon(log.level)}
                          <Badge className={getLevelColor(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(log.category)}
                          <span className="capitalize">{log.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>{log.source}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {log.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.userId ? (
                          <Badge variant="outline">{log.userId}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Logs by Level</CardTitle>
                <CardDescription>
                  Distribution of log levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.logsByLevel).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getLevelIcon(level)}
                        <span className="capitalize">{level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatNumber(count)}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / stats.totalLogs) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logs by Category</CardTitle>
                <CardDescription>
                  Distribution of log categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.logsByCategory).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category)}
                        <span className="capitalize">{category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatNumber(count)}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(count / stats.totalLogs) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Sources</CardTitle>
              <CardDescription>
                Most active log sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <span>{source.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(source.count)}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(source.count / stats.topSources[0].count) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>
                Most frequent error messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentErrors.map((error, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="font-medium">{error.message}</div>
                        <div className="text-sm text-muted-foreground">
                          Last seen: {new Date(error.lastSeen).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{error.count} occurrences</Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
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