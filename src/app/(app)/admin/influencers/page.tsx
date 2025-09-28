"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Users,
  Mail,
  Phone,
  Calendar,
  Shield,
  Zap,
  UserCheck,
  UserX,
  MoreHorizontal,
  Eye,
  FileText,
  Star,
  DollarSign,
  ExternalLink,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Link as LinkIcon,
  Copy
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Influencer {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  trackingLink: string;
  commissionRate: number;
  totalClicks: number;
  totalSignups: number;
  totalConversions: number;
  totalEarnings: number;
  pendingPayouts: number;
  createdAt: string;
  lastActivity?: string;
}

export default function AdminInfluencerManagement() {
  const router = useRouter();
  const { user, appUser, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>([]);
  const [loadingInfluencers, setLoadingInfluencers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);

  // Mock data for demonstration
  const mockInfluencers: Influencer[] = [
    {
      id: '1',
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john@example.com',
      userPhone: '+1-555-0123',
      status: 'ACTIVE',
      trackingLink: 'https://example.com/ref/john123',
      commissionRate: 0.15,
      totalClicks: 1247,
      totalSignups: 89,
      totalConversions: 23,
      totalEarnings: 345.00,
      pendingPayouts: 89.50,
      createdAt: '2024-01-15',
      lastActivity: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      userId: 'user-2',
      userName: 'Sarah Johnson',
      userEmail: 'sarah@photography.com',
      userPhone: '+1-555-0124',
      status: 'ACTIVE',
      trackingLink: 'https://example.com/ref/sarah456',
      commissionRate: 0.12,
      totalClicks: 892,
      totalSignups: 67,
      totalConversions: 18,
      totalEarnings: 270.00,
      pendingPayouts: 0,
      createdAt: '2024-01-10',
      lastActivity: '2024-01-19T15:45:00Z'
    },
    {
      id: '3',
      userId: 'user-3',
      userName: 'Mike Chen',
      userEmail: 'mike@design.com',
      userPhone: '+1-555-0125',
      status: 'PENDING',
      trackingLink: '',
      commissionRate: 0.10,
      totalClicks: 0,
      totalSignups: 0,
      totalConversions: 0,
      totalEarnings: 0,
      pendingPayouts: 0,
      createdAt: '2024-01-18',
      lastActivity: ''
    },
    {
      id: '4',
      userId: 'user-4',
      userName: 'Emma Davis',
      userEmail: 'emma@studio.com',
      userPhone: '+1-555-0126',
      status: 'SUSPENDED',
      trackingLink: 'https://example.com/ref/emma789',
      commissionRate: 0.20,
      totalClicks: 2341,
      totalSignups: 156,
      totalConversions: 42,
      totalEarnings: 630.00,
      pendingPayouts: 210.00,
      createdAt: '2024-01-05',
      lastActivity: '2024-01-12T14:15:00Z'
    },
    {
      id: '5',
      userId: 'user-5',
      userName: 'Alex Rodriguez',
      userEmail: 'alex@creative.com',
      userPhone: '+1-555-0127',
      status: 'ACTIVE',
      trackingLink: 'https://example.com/ref/alex321',
      commissionRate: 0.18,
      totalClicks: 1567,
      totalSignups: 112,
      totalConversions: 31,
      totalEarnings: 465.00,
      pendingPayouts: 0,
      createdAt: '2024-01-12',
      lastActivity: '2024-01-20T11:30:00Z'
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
      setInfluencers(mockInfluencers);
      setFilteredInfluencers(mockInfluencers);
      setLoadingInfluencers(false);
    }, 1000);
  }, [user, appUser, loading, router]);

  useEffect(() => {
    let filtered = influencers;

    if (searchTerm) {
      filtered = filtered.filter(influencer =>
        influencer.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        influencer.userPhone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(influencer => influencer.status === selectedStatus);
    }

    setFilteredInfluencers(filtered);
  }, [influencers, searchTerm, selectedStatus]);

  const toggleInfluencerStatus = (influencerId: string) => {
    setInfluencers(prev => prev.map(influencer => 
      influencer.id === influencerId 
        ? { 
            ...influencer, 
            status: influencer.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' 
          }
        : influencer
    ));
    
    const influencer = influencers.find(i => i.id === influencerId);
    if (influencer) {
      toast({
        title: `Influencer ${influencer.status === 'ACTIVE' ? 'Suspended' : 'Activated'}`,
        description: `${influencer.userName} has been ${influencer.status === 'ACTIVE' ? 'suspended' : 'activated'}`,
      });
    }
  };

  const handleApproveInfluencer = (influencerId: string) => {
    setInfluencers(prev => prev.map(influencer => 
      influencer.id === influencerId 
        ? { ...influencer, status: 'ACTIVE' as const, trackingLink: `https://example.com/ref/${influencer.userName.toLowerCase()}` }
        : influencer
    ));
    
    const influencer = influencers.find(i => i.id === influencerId);
    if (influencer) {
      toast({
        title: "Influencer Approved",
        description: `${influencer.userName} has been approved and tracking link generated`,
      });
    }
  };

  const handleEditInfluencer = (influencer: Influencer) => {
    setEditingInfluencer(influencer);
    toast({
      title: "Edit Influencer",
      description: `Edit form for ${influencer.userName} would open here`,
    });
  };

  const handleDeleteInfluencer = (influencerId: string) => {
    const influencer = influencers.find(i => i.id === influencerId);
    if (influencer && confirm(`Are you sure you want to delete ${influencer.userName}?`)) {
      setInfluencers(prev => prev.filter(i => i.id !== influencerId));
      toast({
        title: "Influencer Deleted",
        description: `${influencer.userName} has been deleted`,
      });
    }
  };

  const copyTrackingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Tracking link copied to clipboard!",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading || loadingInfluencers) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Influencers...</p>
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
              You don't have permission to access influencer management.
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

  const totalInfluencers = influencers.length;
  const activeInfluencers = influencers.filter(i => i.status === 'ACTIVE').length;
  const pendingInfluencers = influencers.filter(i => i.status === 'PENDING').length;
  const totalClicks = influencers.reduce((acc, i) => acc + i.totalClicks, 0);
  const totalEarnings = influencers.reduce((acc, i) => acc + i.totalEarnings, 0);
  const totalPendingPayouts = influencers.reduce((acc, i) => acc + i.pendingPayouts, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Influencer Management</h1>
          <p className="text-gray-600 mt-2">Manage all influencer accounts and track performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/influencers/payouts')}>
            <DollarSign className="w-4 h-4 mr-2" />
            Payouts
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/influencers/activity')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Activity
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Influencers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInfluencers}</div>
            <p className="text-xs text-muted-foreground">
              Registered influencers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInfluencers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInfluencers}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time clicks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total generated
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPendingPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search influencers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
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

      {/* Influencers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Influencers</CardTitle>
          <CardDescription>
            Manage all influencer accounts and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInfluencers.map((influencer) => (
              <div key={influencer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{influencer.userName}</h3>
                          {getStatusBadge(influencer.status)}
                        </div>
                        <p className="text-sm text-gray-600">{influencer.userEmail}</p>
                        {influencer.userPhone && (
                          <p className="text-xs text-gray-500">{influencer.userPhone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{(influencer.commissionRate * 100).toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">Commission</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{influencer.totalClicks.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Clicks</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{influencer.totalConversions}</div>
                      <div className="text-xs text-gray-500">Conversions</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${influencer.totalEarnings.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Earnings</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {influencer.trackingLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyTrackingLink(influencer.trackingLink)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                      {influencer.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleApproveInfluencer(influencer.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleInfluencerStatus(influencer.id)}
                      >
                        {influencer.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInfluencer(influencer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {influencer.trackingLink && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <LinkIcon className="w-4 h-4" />
                      <span className="font-medium">Tracking Link:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {influencer.trackingLink}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}