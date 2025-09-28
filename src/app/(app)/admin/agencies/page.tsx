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
  Building2,
  Users,
  Target,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  TrendingUp,
  Eye,
  MoreHorizontal,
  Star,
  Shield,
  UserPlus,
  Settings,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Agency {
  id: string;
  agencyName: string;
  contactEmail: string;
  contactPhone?: string;
  subscriptionTier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
  lastActivity?: string;
  memberCount: number;
  clientCount: number;
  campaignCount: number;
  totalContent: number;
  apiCalls: number;
  location?: {
    country: string;
    city: string;
  };
}

export default function AdminAgencyManagement() {
  const router = useRouter();
  const { user, appUser, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);

  // Mock data for demonstration
  const mockAgencies: Agency[] = [
    {
      id: '1',
      agencyName: 'Creative Minds Agency',
      contactEmail: 'contact@creativeminds.com',
      contactPhone: '+1-555-0123',
      subscriptionTier: 'PRO',
      status: 'ACTIVE',
      createdAt: '2024-01-15',
      lastActivity: '2024-01-20T10:30:00Z',
      memberCount: 8,
      clientCount: 24,
      campaignCount: 67,
      totalContent: 342,
      apiCalls: 15420,
      location: {
        country: 'United States',
        city: 'New York'
      }
    },
    {
      id: '2',
      agencyName: 'Digital Pulse Media',
      contactEmail: 'hello@digitalpulse.com',
      contactPhone: '+1-555-0124',
      subscriptionTier: 'ENTERPRISE',
      status: 'ACTIVE',
      createdAt: '2024-01-10',
      lastActivity: '2024-01-19T15:45:00Z',
      memberCount: 15,
      clientCount: 42,
      campaignCount: 128,
      totalContent: 892,
      apiCalls: 45630,
      location: {
        country: 'Canada',
        city: 'Toronto'
      }
    },
    {
      id: '3',
      agencyName: 'Brand Builders Co',
      contactEmail: 'info@brandbuilders.com',
      subscriptionTier: 'BASIC',
      status: 'PENDING',
      createdAt: '2024-01-18',
      lastActivity: undefined,
      memberCount: 3,
      clientCount: 5,
      campaignCount: 8,
      totalContent: 23,
      apiCalls: 1240,
      location: {
        country: 'United Kingdom',
        city: 'London'
      }
    },
    {
      id: '4',
      agencyName: 'Social Spark Agency',
      contactEmail: 'team@socialspark.com',
      contactPhone: '+1-555-0125',
      subscriptionTier: 'PRO',
      status: 'SUSPENDED',
      createdAt: '2024-01-05',
      lastActivity: '2024-01-12T14:15:00Z',
      memberCount: 6,
      clientCount: 18,
      campaignCount: 45,
      totalContent: 267,
      apiCalls: 23450,
      location: {
        country: 'Australia',
        city: 'Sydney'
      }
    },
    {
      id: '5',
      agencyName: 'Content Creators Inc',
      contactEmail: 'contact@contentcreators.com',
      subscriptionTier: 'BASIC',
      status: 'ACTIVE',
      createdAt: '2024-01-12',
      lastActivity: '2024-01-20T11:30:00Z',
      memberCount: 4,
      clientCount: 12,
      campaignCount: 23,
      totalContent: 156,
      apiCalls: 8760,
      location: {
        country: 'Germany',
        city: 'Berlin'
      }
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
      setAgencies(mockAgencies);
      setFilteredAgencies(mockAgencies);
      setLoadingAgencies(false);
    }, 1000);
  }, [user, appUser, loading, router]);

  useEffect(() => {
    let filtered = agencies;

    if (searchTerm) {
      filtered = filtered.filter(agency =>
        agency.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.contactPhone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTier !== 'all') {
      filtered = filtered.filter(agency => agency.subscriptionTier === selectedTier);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(agency => agency.status === selectedStatus);
    }

    setFilteredAgencies(filtered);
  }, [agencies, searchTerm, selectedTier, selectedStatus]);

  const toggleAgencyStatus = (agencyId: string) => {
    setAgencies(prev => prev.map(agency => 
      agency.id === agencyId 
        ? { 
            ...agency, 
            status: agency.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' 
          }
        : agency
    ));
    
    const agency = agencies.find(a => a.id === agencyId);
    if (agency) {
      toast({
        title: `Agency ${agency.status === 'ACTIVE' ? 'Suspended' : 'Activated'}`,
        description: `${agency.agencyName} has been ${agency.status === 'ACTIVE' ? 'suspended' : 'activated'}`,
      });
    }
  };

  const handleApproveAgency = (agencyId: string) => {
    setAgencies(prev => prev.map(agency => 
      agency.id === agencyId 
        ? { ...agency, status: 'ACTIVE' as const }
        : agency
    ));
    
    const agency = agencies.find(a => a.id === agencyId);
    if (agency) {
      toast({
        title: "Agency Approved",
        description: `${agency.agencyName} has been approved and activated`,
      });
    }
  };

  const handleEditAgency = (agency: Agency) => {
    setEditingAgency(agency);
    toast({
      title: "Edit Agency",
      description: `Edit form for ${agency.agencyName} would open here`,
    });
  };

  const handleDeleteAgency = (agencyId: string) => {
    const agency = agencies.find(a => a.id === agencyId);
    if (agency && confirm(`Are you sure you want to delete ${agency.agencyName}?`)) {
      setAgencies(prev => prev.filter(a => a.id !== agencyId));
      toast({
        title: "Agency Deleted",
        description: `${agency.agencyName} has been deleted`,
      });
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return <Badge className="bg-gray-100 text-gray-800">Basic</Badge>;
      case 'PRO':
        return <Badge className="bg-blue-100 text-blue-800">Pro</Badge>;
      case 'ENTERPRISE':
        return <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>;
      default:
        return <Badge variant="outline">{tier}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading || loadingAgencies) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Agencies...</p>
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
              You don't have permission to access agency management.
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

  const totalAgencies = agencies.length;
  const activeAgencies = agencies.filter(a => a.status === 'ACTIVE').length;
  const pendingAgencies = agencies.filter(a => a.status === 'PENDING').length;
  const totalMembers = agencies.reduce((acc, a) => acc + a.memberCount, 0);
  const totalClients = agencies.reduce((acc, a) => acc + a.clientCount, 0);
  const totalCampaigns = agencies.reduce((acc, a) => acc + a.campaignCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agency Management</h1>
          <p className="text-gray-600 mt-2">Manage all media agencies and their operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/agencies/clients')}>
            <Users className="w-4 h-4 mr-2" />
            Clients
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/agencies/analytics')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agencies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgencies}</div>
            <p className="text-xs text-muted-foreground">
              Registered agencies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAgencies}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAgencies}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Agency team members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Agency clients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Active campaigns
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
                  placeholder="Search agencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Agencies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agencies</CardTitle>
          <CardDescription>
            Manage all media agency accounts and their operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAgencies.map((agency) => (
              <div key={agency.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{agency.agencyName}</h3>
                          {getTierBadge(agency.subscriptionTier)}
                          {getStatusBadge(agency.status)}
                        </div>
                        <p className="text-sm text-gray-600">{agency.contactEmail}</p>
                        {agency.contactPhone && (
                          <p className="text-xs text-gray-500">{agency.contactPhone}</p>
                        )}
                        {agency.location && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {agency.location.city}, {agency.location.country}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{agency.memberCount}</div>
                      <div className="text-xs text-gray-500">Members</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{agency.clientCount}</div>
                      <div className="text-xs text-gray-500">Clients</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{agency.campaignCount}</div>
                      <div className="text-xs text-gray-500">Campaigns</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{agency.totalContent}</div>
                      <div className="text-xs text-gray-500">Content</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{agency.apiCalls.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">API Calls</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {agency.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleApproveAgency(agency.id)}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAgencyStatus(agency.id)}
                      >
                        {agency.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAgency(agency)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/agencies/${agency.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {agency.lastActivity && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Last Activity: {new Date(agency.lastActivity).toLocaleString()}
                      </div>
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