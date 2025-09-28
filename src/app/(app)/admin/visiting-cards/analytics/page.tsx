'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Download,
  Share2,
  QrCode,
  Smartphone,
  Calendar,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  MapPin,
  Users,
  CreditCard,
  Tablet
} from 'lucide-react'

interface CardAnalytics {
  totalCards: number
  activeCards: number
  totalViews: number
  totalScans: number
  totalShares: number
  totalDownloads: number
  conversionRate: number
  avgEngagement: number
  topCards: Array<{
    id: string
    name: string
    views: number
    scans: number
    shares: number
    owner: string
  }>
  viewsByDate: Array<{
    date: string
    views: number
    scans: number
  }>
  deviceStats: {
    mobile: number
    desktop: number
    tablet: number
  }
  geographicData: Array<{
    country: string
    views: number
    scans: number
  }>
  performanceMetrics: {
    loadTime: number
    bounceRate: number
    avgSessionDuration: number
  }
}

const mockAnalytics: CardAnalytics = {
  totalCards: 1247,
  activeCards: 1089,
  totalViews: 45678,
  totalScans: 23456,
  totalShares: 3456,
  totalDownloads: 1234,
  conversionRate: 12.5,
  avgEngagement: 3.2,
  topCards: [
    { id: '1', name: 'John Doe - Business Card', views: 15420, scans: 8756, shares: 234, owner: 'John Doe' },
    { id: '2', name: 'Jane Smith - Designer', views: 12345, scans: 6543, shares: 189, owner: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson - Developer', views: 9876, scans: 5432, shares: 156, owner: 'Mike Johnson' },
    { id: '4', name: 'Sarah Wilson - Marketing', views: 8765, scans: 4321, shares: 123, owner: 'Sarah Wilson' },
    { id: '5', name: 'Tom Brown - Sales', views: 7654, scans: 3210, shares: 98, owner: 'Tom Brown' }
  ],
  viewsByDate: [
    { date: '2024-01-01', views: 1200, scans: 600 },
    { date: '2024-01-02', views: 1350, scans: 680 },
    { date: '2024-01-03', views: 1180, scans: 590 },
    { date: '2024-01-04', views: 1420, scans: 720 },
    { date: '2024-01-05', views: 1650, scans: 850 },
    { date: '2024-01-06', views: 1580, scans: 800 },
    { date: '2024-01-07', views: 1720, scans: 890 }
  ],
  deviceStats: {
    mobile: 68,
    desktop: 25,
    tablet: 7
  },
  geographicData: [
    { country: 'United States', views: 15678, scans: 8234 },
    { country: 'United Kingdom', views: 8934, scans: 4567 },
    { country: 'Canada', views: 6543, scans: 3210 },
    { country: 'Germany', views: 5432, scans: 2765 },
    { country: 'Australia', views: 4321, scans: 2109 }
  ],
  performanceMetrics: {
    loadTime: 1.2,
    bounceRate: 35.5,
    avgSessionDuration: 185
  }
}

export default function AdminVisitingCardsAnalyticsPage() {
  const [analytics] = useState<CardAnalytics>(mockAnalytics)
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(false)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Visiting Cards Analytics</h1>
            <p className="text-muted-foreground">
              Performance insights and usage statistics for virtual visiting cards
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics.totalCards)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(analytics.activeCards)} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics.totalViews)}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.conversionRate}% conversion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics.totalScans)}</div>
                <p className="text-xs text-muted-foreground">
                  {((analytics.totalScans / analytics.totalViews) * 100).toFixed(1)}% scan rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shares</CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics.totalShares)}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.avgEngagement} avg engagement
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Views & Scans Trend</CardTitle>
                <CardDescription>
                  Daily views and QR code scans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.viewsByDate.map((data, index) => (
                    <div key={data.date} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{new Date(data.date).toLocaleDateString()}</span>
                        <div className="flex gap-4">
                          <span className="text-blue-600">{formatNumber(data.views)} views</span>
                          <span className="text-green-600">{formatNumber(data.scans)} scans</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(data.views / 2000) * 100}%` }}
                          ></div>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(data.scans / 1000) * 100}%` }}
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
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>
                  How users access visiting cards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span>Mobile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${analytics.deviceStats.mobile}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{analytics.deviceStats.mobile}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Desktop</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${analytics.deviceStats.desktop}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{analytics.deviceStats.desktop}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tablet className="w-4 h-4" />
                      <span>Tablet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${analytics.deviceStats.tablet}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{analytics.deviceStats.tablet}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Cards</CardTitle>
              <CardDescription>
                Most viewed and engaged visiting cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Card Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Scans</TableHead>
                    <TableHead>Shares</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="font-medium">{card.name}</TableCell>
                      <TableCell>{card.owner}</TableCell>
                      <TableCell>{formatNumber(card.views)}</TableCell>
                      <TableCell>{formatNumber(card.scans)}</TableCell>
                      <TableCell>{formatNumber(card.shares)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Load Time</CardTitle>
                <CardDescription>
                  Average page load time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{analytics.performanceMetrics.loadTime}s</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Excellent performance
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bounce Rate</CardTitle>
                <CardDescription>
                  Single-page sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{analytics.performanceMetrics.bounceRate}%</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Below industry average
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Duration</CardTitle>
                <CardDescription>
                  Average time spent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{formatDuration(analytics.performanceMetrics.avgSessionDuration)}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Good engagement
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>
                Where your visitors are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.geographicData.map((data) => (
                  <div key={data.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{data.country}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-600">{formatNumber(data.views)} views</span>
                        <span className="text-sm text-green-600">{formatNumber(data.scans)} scans</span>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(data.views / 20000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>
                  How users interact with cards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Average Engagement Score</span>
                    <Badge variant="secondary">{analytics.avgEngagement}/5</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shares per View</span>
                    <Badge variant="secondary">
                      {((analytics.totalShares / analytics.totalViews) * 100).toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Downloads per View</span>
                    <Badge variant="secondary">
                      {((analytics.totalDownloads / analytics.totalViews) * 100).toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Scan Rate</span>
                    <Badge variant="secondary">
                      {((analytics.totalScans / analytics.totalViews) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>
                  User journey from view to action
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Views</span>
                      <span>{formatNumber(analytics.totalViews)}</span>
                    </div>
                    <Progress value={100} className="w-full" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>QR Scans</span>
                      <span>{formatNumber(analytics.totalScans)}</span>
                    </div>
                    <Progress value={(analytics.totalScans / analytics.totalViews) * 100} className="w-full" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Shares</span>
                      <span>{formatNumber(analytics.totalShares)}</span>
                    </div>
                    <Progress value={(analytics.totalShares / analytics.totalViews) * 100} className="w-full" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Downloads</span>
                      <span>{formatNumber(analytics.totalDownloads)}</span>
                    </div>
                    <Progress value={(analytics.totalDownloads / analytics.totalViews) * 100} className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}