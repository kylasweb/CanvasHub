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
  Building2,
  Users,
  Target,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Eye,
  MoreHorizontal,
  ExternalLink,
  ArrowLeft,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  clientName: string;
  agencyName: string;
  agencyId: string;
  contactEmail: string;
  contactPhone?: string;
  industry: string;
  createdAt: string;
  lastActivity?: string;
  campaignCount: number;
  activeCampaigns: number;
  totalContent: number;
  location?: {
    country: string;
    city: string;
  };
}

interface Agency {
  id: string;
  agencyName: string;
  subscriptionTier: 'BASIC' | 'PRO' | 'ENTERPRISE';
}

export default function AdminClientManagement() {
  const router = useRouter();
  const { user, appUser, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  // Mock data for demonstration
  const mockAgencies: Agency[] = [
    { id: '1', agencyName: 'Creative Minds Agency', subscriptionTier: 'PRO' },
    { id: '2', agencyName: 'Digital Pulse Media', subscriptionTier: 'ENTERPRISE' },
    { id: '3', agencyName: 'Brand Builders Co', subscriptionTier: 'BASIC' },
    { id: '4', agencyName: 'Social Spark Agency', subscriptionTier: 'PRO' },
    { id: '5', agencyName: 'Content Creators Inc', subscriptionTier: 'BASIC' }
  ];

  const mockClients: Client[] = [
    {
      id: '1',
      clientName: 'TechCorp Solutions',
      agencyName: 'Creative Minds Agency',
      agencyId: '1',
      contactEmail: 'contact@techcorp.com',
      contactPhone: '+1-555-0123',
      industry: 'Technology',
      createdAt: '2024-01-15',
      lastActivity: '2024-01-20T10:30:00Z',
      campaignCount: 5,
      activeCampaigns: 3,
      totalContent: 42,
      location: {
        country: 'United States',
        city: 'San Francisco'
      }
    },
    {
      id: '2',
      clientName: 'Fashion Forward',
      agencyName: 'Digital Pulse Media',
      agencyId: '2',
      contactEmail: 'hello@fashionforward.com',
      contactPhone: '+1-555-0124',
      industry: 'Fashion',
      createdAt: '2024-01-18',
      lastActivity: '2024-01-19T15:45:00Z',
      campaignCount: 8,
      activeCampaigns: 6,
      totalContent: 89,
      location: {
        country: 'Canada',
        city: 'Toronto'
      }
    },
    {
      id: '3',
      clientName: 'Green Energy Co',
      agencyName: 'Creative Minds Agency',
      agencyId: '1',
      contactEmail: 'info@greenenergy.com',
      industry: 'Energy',
      createdAt: '2024-01-20',
      lastActivity: '2024-01-20T09:15:00Z',
      campaignCount: 3,
      activeCampaigns: 1,
      totalContent: 23,
      location: {
        country: 'United Kingdom',
        city: 'London'
      }
    },
    {
      id: '4',
      clientName: 'Foodie Delights',
      agencyName: 'Brand Builders Co',
      agencyId: '3',
      contactEmail: 'orders@foodiedelights.com',
      industry: 'Food & Beverage',
      createdAt: '2024-01-12',
      lastActivity: '2024-01-18T14:20:00Z',
      campaignCount: 4,
      activeCampaigns: 2,
      totalContent: 34,
      location: {
        country: 'Australia',
        city: 'Sydney'
      }
    },
    {
      id: '5',
      clientName: 'Health Plus Medical',
      agencyName: 'Social Spark Agency',
      agencyId: '4',
      contactEmail: 'contact@healthplus.com',
      contactPhone: '+1-555-0125',
      industry: 'Healthcare',
      createdAt: '2024-01-10',
      lastActivity: '2024-01-16T11:30:00Z',
      campaignCount: 6,
      activeCampaigns: 4,
      totalContent: 67,
      location: {
        country: 'Germany',
        city: 'Berlin'
      }
    },
    {
      id: '6',
      clientName: 'EduTech Solutions',
      agencyName: 'Content Creators Inc',
      agencyId: '5',
      contactEmail: 'info@edutech.com',
      industry: 'Education',
      createdAt: '2024-01-14',
      lastActivity: '2024-01-19T13:45:00Z',
      campaignCount: 2,
      activeCampaigns: 1,
      totalContent: 15,
      location: {
        country: 'United States',
        city: 'New York'
      }
    }
  ];

  const industries = ['Technology', 'Fashion', 'Energy', 'Food & Beverage', 'Healthcare', 'Education', 'Finance', 'Real Estate', 'Entertainment', 'Sports'];

  useEffect(() => {
    if (loading) return;
    
    if (!user || appUser?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setAgencies(mockAgencies);
      setClients(mockClients);
      setFilteredClients(mockClients);
      setLoadingClients(false);
    }, 1000);
  }, [user, appUser, loading, router]);

  useEffect(() => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactPhone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedAgency !== 'all') {
      filtered = filtered.filter(client => client.agencyId === selectedAgency);
    }

    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(client => client.industry === selectedIndustry);
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm, selectedAgency, selectedIndustry]);

  const handleViewClient = (clientId: string) => {
    toast({
      title: "View Client",
      description: `Client details for ${clientId} would open here`,
    });
  };

  const handleEditClient = (clientId: string) => {
    toast({
      title: "Edit Client",
      description: `Edit form for client ${clientId} would open here`,
    });
  };

  const handleDeleteClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client && confirm(`Are you sure you want to delete ${client.clientName}?`)) {
      setClients(prev => prev.filter(c => c.id !== clientId));
      toast({
        title: "Client Deleted",
        description: `${client.clientName} has been deleted`,
      });
    }
  };

  const getAgencyBadge = (agencyName: string, tier: string) => {
    let color = 'bg-gray-100 text-gray-800';
    if (tier === 'PRO') color = 'bg-blue-100 text-blue-800';
    if (tier === 'ENTERPRISE') color = 'bg-purple-100 text-purple-800';
    
    return <Badge className={color}>{agencyName}</Badge>;
  };

  if (loading || loadingClients) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Clients...</p>
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
              <Building2 className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access client management.
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

  const totalClients = clients.length;
  const totalCampaigns = clients.reduce((acc, c) => acc + c.campaignCount, 0);
  const totalContent = clients.reduce((acc, c) => acc + c.totalContent, 0);
  const activeCampaigns = clients.reduce((acc, c) => acc + c.activeCampaigns, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/admin/agencies')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Agencies
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600 mt-2">Manage all agency clients and their campaigns</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Across all agencies
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
              All campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContent}</div>
            <p className="text-xs text-muted-foreground">
              Pieces of content
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agencies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencies.length}</div>
            <p className="text-xs text-muted-foreground">
              Active agencies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalClients > 0 ? Math.round(totalCampaigns / totalClients) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per client
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
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Agencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agencies</SelectItem>
                  {agencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.agencyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
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

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>
            Manage all agency clients and their campaign information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{client.clientName}</h3>
                          <Badge variant="outline" className="text-xs">{client.industry}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{client.contactEmail}</p>
                        {client.contactPhone && (
                          <p className="text-xs text-gray-500">{client.contactPhone}</p>
                        )}
                        {client.location && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {client.location.city}, {client.location.country}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{client.campaignCount}</div>
                      <div className="text-xs text-gray-500">Campaigns</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{client.activeCampaigns}</div>
                      <div className="text-xs text-gray-500">Active</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{client.totalContent}</div>
                      <div className="text-xs text-gray-500">Content</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAgencyBadge(client.agencyName, 
                        agencies.find(a => a.id === client.agencyId)?.subscriptionTier || 'BASIC'
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewClient(client.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClient(client.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/agencies/clients/${client.id}`)}
                      >
                        <Target className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {client.lastActivity && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Last Activity: {new Date(client.lastActivity).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(client.createdAt).toLocaleDateString()}
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