"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter,
  Users,
  ExternalLink,
  MousePointer,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Shield,
  Clock,
  MapPin,
  Monitor,
  Calendar,
  RefreshCw,
  Download,
  Eye,
  Blocks,
  CheckCircle,
  XCircle,
  Activity,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ActivityEvent {
  id: string;
  influencerId: string;
  influencerName: string;
  influencerEmail: string;
  eventType: 'CLICK' | 'SIGNUP' | 'CONVERSION';
  sourceIp: string;
  userAgent: string;
  location: {
    country: string;
    city: string;
    region: string;
  };
  deviceInfo: {
    deviceType: 'Desktop' | 'Mobile' | 'Tablet';
    browser: string;
    os: string;
  };
  trackingLink: string;
  referrer?: string;
  timestamp: string;
  riskScore: number;
  isFlagged: boolean;
  flagReason?: string;
}

export default function AdminActivityMonitoring() {
  const router = useRouter();
  const { user, appUser, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ActivityEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    clickEvents: 0,
    signupEvents: 0,
    conversionEvents: 0,
    flaggedEvents: 0,
    highRiskEvents: 0,
    uniqueIPs: 0,
    topCountries: [] as Array<{ name: string; count: number }>
  });

  // Mock data for demonstration
  const mockEvents: ActivityEvent[] = [
    {
      id: '1',
      influencerId: '1',
      influencerName: 'John Smith',
      influencerEmail: 'john@example.com',
      eventType: 'CLICK',
      sourceIp: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: {
        country: 'United States',
        city: 'New York',
        region: 'NY'
      },
      deviceInfo: {
        deviceType: 'Desktop',
        browser: 'Chrome',
        os: 'Windows'
      },
      trackingLink: 'https://example.com/ref/john123',
      referrer: 'https://google.com',
      timestamp: '2024-01-20T10:30:00Z',
      riskScore: 0.1,
      isFlagged: false
    },
    {
      id: '2',
      influencerId: '2',
      influencerName: 'Sarah Johnson',
      influencerEmail: 'sarah@photography.com',
      eventType: 'SIGNUP',
      sourceIp: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      location: {
        country: 'Canada',
        city: 'Toronto',
        region: 'ON'
      },
      deviceInfo: {
        deviceType: 'Mobile',
        browser: 'Safari',
        os: 'iOS'
      },
      trackingLink: 'https://example.com/ref/sarah456',
      timestamp: '2024-01-20T10:25:00Z',
      riskScore: 0.2,
      isFlagged: false
    },
    {
      id: '3',
      influencerId: '1',
      influencerName: 'John Smith',
      influencerEmail: 'john@example.com',
      eventType: 'CONVERSION',
      sourceIp: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      location: {
        country: 'United Kingdom',
        city: 'London',
        region: 'England'
      },
      deviceInfo: {
        deviceType: 'Desktop',
        browser: 'Firefox',
        os: 'macOS'
      },
      trackingLink: 'https://example.com/ref/john123',
      timestamp: '2024-01-20T10:20:00Z',
      riskScore: 0.05,
      isFlagged: false
    },
    {
      id: '4',
      influencerId: '4',
      influencerName: 'Emma Davis',
      influencerEmail: 'emma@studio.com',
      eventType: 'CLICK',
      sourceIp: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F)',
      location: {
        country: 'Germany',
        city: 'Berlin',
        region: 'BE'
      },
      deviceInfo: {
        deviceType: 'Mobile',
        browser: 'Chrome',
        os: 'Android'
      },
      trackingLink: 'https://example.com/ref/emma789',
      timestamp: '2024-01-20T10:15:00Z',
      riskScore: 0.8,
      isFlagged: true,
      flagReason: 'High frequency clicks from same IP'
    },
    {
      id: '5',
      influencerId: '5',
      influencerName: 'Alex Rodriguez',
      influencerEmail: 'alex@creative.com',
      eventType: 'CLICK',
      sourceIp: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0)',
      location: {
        country: 'Australia',
        city: 'Sydney',
        region: 'NSW'
      },
      deviceInfo: {
        deviceType: 'Desktop',
        browser: 'Firefox',
        os: 'Windows'
      },
      trackingLink: 'https://example.com/ref/alex321',
      referrer: 'https://facebook.com',
      timestamp: '2024-01-20T10:10:00Z',
      riskScore: 0.3,
      isFlagged: false
    }
  ];

  useEffect(() => {
    if (loading) return;
    
    if (!user || appUser?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
      updateStats(mockEvents);
      setLoadingEvents(false);
    }, 1000);
  }, [user, appUser, loading, router]);

  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.influencerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.influencerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.sourceIp.includes(searchTerm) ||
        event.location.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedEventType !== 'all') {
      filtered = filtered.filter(event => event.eventType === selectedEventType);
    }

    if (selectedRisk !== 'all') {
      if (selectedRisk === 'flagged') {
        filtered = filtered.filter(event => event.isFlagged);
      } else if (selectedRisk === 'high') {
        filtered = filtered.filter(event => event.riskScore > 0.7);
      }
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedEventType, selectedRisk]);

  const updateStats = (eventsData: ActivityEvent[]) => {
    const totalEvents = eventsData.length;
    const clickEvents = eventsData.filter(e => e.eventType === 'CLICK').length;
    const signupEvents = eventsData.filter(e => e.eventType === 'SIGNUP').length;
    const conversionEvents = eventsData.filter(e => e.eventType === 'CONVERSION').length;
    const flaggedEvents = eventsData.filter(e => e.isFlagged).length;
    const highRiskEvents = eventsData.filter(e => e.riskScore > 0.7).length;
    const uniqueIPs = new Set(eventsData.map(e => e.sourceIp)).size;
    
    const countryCounts = eventsData.reduce((acc, event) => {
      acc[event.location.country] = (acc[event.location.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCountries = Object.entries(countryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalEvents,
      clickEvents,
      signupEvents,
      conversionEvents,
      flaggedEvents,
      highRiskEvents,
      uniqueIPs,
      topCountries
    });
  };

  // Simulate real-time updates
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      // Simulate new event
      const newEvent: ActivityEvent = {
        id: `event-${Date.now()}`,
        influencerId: Math.random() > 0.5 ? '1' : '2',
        influencerName: Math.random() > 0.5 ? 'John Smith' : 'Sarah Johnson',
        influencerEmail: Math.random() > 0.5 ? 'john@example.com' : 'sarah@photography.com',
        eventType: Math.random() > 0.7 ? 'CLICK' : Math.random() > 0.5 ? 'SIGNUP' : 'CONVERSION',
        sourceIp: `192.168.1.${Math.floor(Math.random() * 200) + 100}`,
        userAgent: 'Mozilla/5.0 (Demo Browser)',
        location: {
          country: ['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia'][Math.floor(Math.random() * 5)],
          city: 'Demo City',
          region: 'Demo Region'
        },
        deviceInfo: {
          deviceType: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)] as 'Desktop' | 'Mobile' | 'Tablet',
          browser: 'Chrome',
          os: 'Windows'
        },
        trackingLink: 'https://example.com/ref/demo',
        timestamp: new Date().toISOString(),
        riskScore: Math.random(),
        isFlagged: Math.random() > 0.8,
        flagReason: Math.random() > 0.8 ? 'Suspicious activity detected' : undefined
      };

      setEvents(prev => {
        const updated = [newEvent, ...prev].slice(0, 100); // Keep last 100 events
        updateStats(updated);
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLiveMode]);

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'CLICK':
        return <MousePointer className="w-4 h-4" />;
      case 'SIGNUP':
        return <UserCheck className="w-4 h-4" />;
      case 'CONVERSION':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getEventTypeBadge = (eventType: string) => {
    switch (eventType) {
      case 'CLICK':
        return <Badge className="bg-blue-100 text-blue-800">Click</Badge>;
      case 'SIGNUP':
        return <Badge className="bg-green-100 text-green-800">Sign-up</Badge>;
      case 'CONVERSION':
        return <Badge className="bg-purple-100 text-purple-800">Conversion</Badge>;
      default:
        return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  const getRiskBadge = (riskScore: number, isFlagged: boolean) => {
    if (isFlagged) {
      return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Flagged</Badge>;
    }
    if (riskScore > 0.7) {
      return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3 mr-1" /> High Risk</Badge>;
    }
    if (riskScore > 0.4) {
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Medium Risk</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Low Risk</Badge>;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'Desktop':
        return <Monitor className="w-4 h-4" />;
      case 'Mobile':
        return <Wifi className="w-4 h-4" />;
      case 'Tablet':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  if (loading || loadingEvents) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Activity Monitor...</p>
        </div>
      </div>
    );
  }

  if (!user || appUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access activity monitoring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/admin/influencers')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Back to Influencers
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Monitoring</h1>
            <p className="text-gray-600 mt-2">Real-time monitoring of influencer activities and fraud detection</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isLiveMode ? "default" : "outline"}
            onClick={() => setIsLiveMode(!isLiveMode)}
          >
            {isLiveMode ? <Wifi className="w-4 h-4 mr-2" /> : <WifiOff className="w-4 h-4 mr-2" />}
            {isLiveMode ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              All activities
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clickEvents}</div>
            <p className="text-xs text-muted-foreground">
              Link clicks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sign-ups</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.signupEvents}</div>
            <p className="text-xs text-muted-foreground">
              New registrations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionEvents}</div>
            <p className="text-xs text-muted-foreground">
              Successful conversions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.flaggedEvents}</div>
            <p className="text-xs text-muted-foreground">
              Suspicious activities
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueIPs}</div>
            <p className="text-xs text-muted-foreground">
              Different IPs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Countries */}
      <Card>
        <CardHeader>
          <CardTitle>Top Countries by Activity</CardTitle>
          <CardDescription>Geographic distribution of influencer activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stats.topCountries.map((country, index) => (
              <div key={country.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{country.name}</span>
                </div>
                <Badge variant="outline">{country.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="CLICK">Clicks</SelectItem>
                  <SelectItem value="SIGNUP">Sign-ups</SelectItem>
                  <SelectItem value="CONVERSION">Conversions</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="flagged">Flagged Only</SelectItem>
                  <SelectItem value="high">High Risk Only</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>
            Real-time feed of all influencer activities with fraud detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {getEventTypeIcon(event.eventType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{event.influencerName}</h3>
                          {getEventTypeBadge(event.eventType)}
                          {getRiskBadge(event.riskScore, event.isFlagged)}
                        </div>
                        <p className="text-sm text-gray-600">{event.influencerEmail}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location.city}, {event.location.country}
                          </div>
                          <div className="flex items-center gap-1">
                            {getDeviceIcon(event.deviceInfo.deviceType)}
                            {event.deviceInfo.deviceType}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                        </div>
                        {event.flagReason && (
                          <div className="mt-2">
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              {event.flagReason}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right text-xs">
                      <div className="font-mono">{event.sourceIp}</div>
                      <div className="text-gray-500">Risk: {(event.riskScore * 100).toFixed(0)}%</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {event.isFlagged && (
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Blocks className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Tracking Link:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs ml-2">
                      {event.trackingLink}
                    </code>
                  </div>
                  {event.referrer && (
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Referrer:</span>
                      <span className="ml-2">{event.referrer}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}