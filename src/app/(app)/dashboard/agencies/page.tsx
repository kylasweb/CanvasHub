"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarInset, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { 
  Building2, 
  Users, 
  Target, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  TrendingUp,
  Settings,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserPlus,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for development
const mockAgencyData = {
  id: "1",
  agencyName: "Creative Minds Agency",
  contactEmail: "contact@creativeminds.com",
  subscriptionTier: "PRO" as const,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-20T14:45:00Z"
};

const mockClients = [
  {
    id: "1",
    clientName: "TechCorp Solutions",
    createdAt: "2024-01-15T10:30:00Z",
    campaigns: [
      {
        id: "1",
        campaignName: "Q1 Product Launch",
        startDate: "2024-01-15",
        endDate: "2024-03-31",
        status: "ACTIVE" as const
      },
      {
        id: "2", 
        campaignName: "Brand Awareness",
        startDate: "2024-02-01",
        endDate: null,
        status: "DRAFT" as const
      }
    ]
  },
  {
    id: "2",
    clientName: "Fashion Forward",
    createdAt: "2024-01-18T14:20:00Z",
    campaigns: [
      {
        id: "3",
        campaignName: "Spring Collection",
        startDate: "2024-03-01",
        endDate: "2024-05-31",
        status: "ACTIVE" as const
      }
    ]
  },
  {
    id: "3",
    clientName: "Green Energy Co",
    createdAt: "2024-01-20T09:15:00Z",
    campaigns: []
  }
];

const mockMembers = [
  {
    id: "1",
    userName: "John Smith",
    userEmail: "john@creativeminds.com",
    role: "OWNER" as const,
    joinedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    userName: "Sarah Johnson",
    userEmail: "sarah@creativeminds.com",
    role: "ADMIN" as const,
    joinedAt: "2024-01-16T11:20:00Z"
  },
  {
    id: "3",
    userName: "Mike Chen",
    userEmail: "mike@creativeminds.com",
    role: "MEMBER" as const,
    joinedAt: "2024-01-18T13:45:00Z"
  }
];

const menuItems = [
  {
    title: 'Dashboard',
    items: [
      { 
        title: 'Overview', 
        url: '/overview', 
        icon: TrendingUp,
        description: 'Business metrics and analytics'
      },
      { 
        title: 'Dashboard', 
        url: '/dashboard', 
        icon: TrendingUp,
        description: 'Main dashboard view'
      }
    ]
  },
  {
    title: 'Agency Management',
    items: [
      { 
        title: 'Agencies', 
        url: '/dashboard/agencies', 
        icon: Building2,
        description: 'Manage your agency and clients'
      }
    ]
  }
];

export default function AgencyManagement() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [agencyData, setAgencyData] = useState(mockAgencyData);
  const [clients, setClients] = useState(mockClients);
  const [members, setMembers] = useState(mockMembers);
  const [isCreateAgencyDialogOpen, setIsCreateAgencyDialogOpen] = useState(false);
  const [isCreateClientDialogOpen, setIsCreateClientDialogOpen] = useState(false);
  const [isCreateMemberDialogOpen, setIsCreateMemberDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    agencyName: mockAgencyData.agencyName,
    contactEmail: mockAgencyData.contactEmail
  });

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/auth');
      return;
    }
  }, [user, loading, router]);

  const handleCreateAgency = async () => {
    try {
      // TODO: Implement API call
      toast({
        title: "Agency Created",
        description: "Your agency has been created successfully!",
      });
      setIsCreateAgencyDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create agency",
        variant: "destructive"
      });
    }
  };

  const handleCreateClient = async () => {
    try {
      // TODO: Implement API call
      toast({
        title: "Client Added",
        description: "New client has been added to your agency!",
      });
      setIsCreateClientDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive"
      });
    }
  };

  const handleCreateMember = async () => {
    try {
      // TODO: Implement API call
      toast({
        title: "Member Added",
        description: "New team member has been added to your agency!",
      });
      setIsCreateMemberDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive"
      });
    }
  };

  const handleUpdateAgency = async () => {
    try {
      // TODO: Implement API call
      setAgencyData(prev => ({
        ...prev,
        agencyName: editForm.agencyName,
        contactEmail: editForm.contactEmail
      }));
      setIsEditing(false);
      toast({
        title: "Agency Updated",
        description: "Your agency information has been updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update agency",
        variant: "destructive"
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Badge className="bg-purple-100 text-purple-800">Owner</Badge>;
      case 'ADMIN':
        return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>;
      case 'MEMBER':
        return <Badge className="bg-gray-100 text-gray-800">Member</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getCampaignStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'DRAFT':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Draft</Badge>;
      case 'ARCHIVED':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalClients = clients.length;
  const totalCampaigns = clients.reduce((sum, client) => sum + client.campaigns.length, 0);
  const activeCampaigns = clients.reduce((sum, client) => 
    sum + client.campaigns.filter(c => c.status === 'ACTIVE').length, 0
  );
  const totalMembers = members.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">Agency Hub</h1>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            {menuItems.map((category) => (
              <SidebarGroup key={category.title}>
                <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {category.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          onClick={() => router.push(item.url)}
                          className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors group"
                          tooltip={item.description}
                        >
                          <div className="flex items-center justify-center w-5 h-5">
                            <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </div>
                          <div className="flex flex-col flex-1">
                            <span className="text-sm font-medium">{item.title}</span>
                            <span className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                              {item.description}
                            </span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter>
            <div className="p-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <div className="flex flex-col h-full">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center">
                <SidebarTrigger className="mr-4" />
                <div className="flex-1">
                  <h1 className="text-lg font-semibold">Agency Management</h1>
                </div>
                {!agencyData && (
                  <Dialog open={isCreateAgencyDialogOpen} onOpenChange={setIsCreateAgencyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Agency
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Your Agency</DialogTitle>
                        <DialogDescription>
                          Set up your media agency to start managing clients and campaigns.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="agencyName">Agency Name</Label>
                          <Input 
                            id="agencyName" 
                            placeholder="Enter your agency name" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail">Contact Email</Label>
                          <Input 
                            id="contactEmail" 
                            type="email" 
                            placeholder="contact@youragency.com" 
                          />
                        </div>
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Your agency will be created with a Basic subscription tier. You can upgrade later.
                          </AlertDescription>
                        </Alert>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateAgencyDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateAgency}>
                          Create Agency
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6">
              {agencyData ? (
                <div className="space-y-6">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalClients}</div>
                        <p className="text-xs text-muted-foreground">
                          Active client accounts
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalCampaigns}</div>
                        <p className="text-xs text-muted-foreground">
                          {activeCampaigns} active campaigns
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalMembers}</div>
                        <p className="text-xs text-muted-foreground">
                          Agency team size
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          {getTierBadge(agencyData.subscriptionTier)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Current plan
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="clients">Clients</TabsTrigger>
                      <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                      <TabsTrigger value="team">Team</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>Agency Information</CardTitle>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                              >
                                <Settings className="w-4 h-4 mr-1" />
                                {isEditing ? 'Cancel' : 'Edit'}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {isEditing ? (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="editAgencyName">Agency Name</Label>
                                  <Input 
                                    id="editAgencyName"
                                    value={editForm.agencyName}
                                    onChange={(e) => setEditForm(prev => ({
                                      ...prev,
                                      agencyName: e.target.value
                                    }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="editContactEmail">Contact Email</Label>
                                  <Input 
                                    id="editContactEmail"
                                    type="email"
                                    value={editForm.contactEmail}
                                    onChange={(e) => setEditForm(prev => ({
                                      ...prev,
                                      contactEmail: e.target.value
                                    }))}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleUpdateAgency}>
                                    Save Changes
                                  </Button>
                                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Agency Name</span>
                                  <span className="text-sm">{agencyData.agencyName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Contact Email</span>
                                  <span className="text-sm">{agencyData.contactEmail}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Subscription</span>
                                  {getTierBadge(agencyData.subscriptionTier)}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Created</span>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(agencyData.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Dialog open={isCreateClientDialogOpen} onOpenChange={setIsCreateClientDialogOpen}>
                              <DialogTrigger asChild>
                                <Button className="w-full justify-start">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add New Client
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add New Client</DialogTitle>
                                  <DialogDescription>
                                    Create a new client profile under your agency.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="clientName">Client Name</Label>
                                    <Input 
                                      id="clientName" 
                                      placeholder="Enter client name" 
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsCreateClientDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleCreateClient}>
                                    Add Client
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <Dialog open={isCreateMemberDialogOpen} onOpenChange={setIsCreateMemberDialogOpen}>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Invite Team Member
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Invite Team Member</DialogTitle>
                                  <DialogDescription>
                                    Add a new team member to your agency.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="memberEmail">Email Address</Label>
                                    <Input 
                                      id="memberEmail" 
                                      type="email" 
                                      placeholder="member@example.com" 
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="memberRole">Role</Label>
                                    <Select>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="MEMBER">Member</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsCreateMemberDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleCreateMember}>
                                    Send Invitation
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="clients" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>Clients</CardTitle>
                              <CardDescription>
                                Manage all your agency clients and their information
                              </CardDescription>
                            </div>
                            <Dialog open={isCreateClientDialogOpen} onOpenChange={setIsCreateClientDialogOpen}>
                              <DialogTrigger asChild>
                                <Button>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Client
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add New Client</DialogTitle>
                                  <DialogDescription>
                                    Create a new client profile under your agency.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="clientName">Client Name</Label>
                                    <Input 
                                      id="clientName" 
                                      placeholder="Enter client name" 
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsCreateClientDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleCreateClient}>
                                    Add Client
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {clients.map((client) => (
                              <div key={client.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                      <Building2 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{client.clientName}</h3>
                                      <p className="text-sm text-gray-600">
                                        Created: {new Date(client.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div className="text-sm font-medium">{client.campaigns.length}</div>
                                      <div className="text-xs text-gray-500">Campaigns</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="sm">
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button variant="outline" size="sm">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                
                                {client.campaigns.length > 0 && (
                                  <div className="mt-3 pt-3 border-t">
                                    <div className="flex flex-wrap gap-2">
                                      {client.campaigns.map((campaign) => (
                                        <Badge key={campaign.id} variant="outline" className="text-xs">
                                          {campaign.campaignName}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="campaigns" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>All Campaigns</CardTitle>
                          <CardDescription>
                            View and manage all campaigns across your clients
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {clients.flatMap(client => 
                              client.campaigns.map(campaign => ({
                                ...campaign,
                                clientName: client.clientName
                              }))
                            ).map((campaign) => (
                              <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <Target className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{campaign.campaignName}</h3>
                                      <p className="text-sm text-gray-600">Client: {campaign.clientName}</p>
                                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {new Date(campaign.startDate).toLocaleDateString()}
                                          {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString()}`}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {getCampaignStatusBadge(campaign.status)}
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="team" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>Team Members</CardTitle>
                              <CardDescription>
                                Manage your agency team and their permissions
                              </CardDescription>
                            </div>
                            <Dialog open={isCreateMemberDialogOpen} onOpenChange={setIsCreateMemberDialogOpen}>
                              <DialogTrigger asChild>
                                <Button>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Invite Member
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Invite Team Member</DialogTitle>
                                  <DialogDescription>
                                    Add a new team member to your agency.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="memberEmail">Email Address</Label>
                                    <Input 
                                      id="memberEmail" 
                                      type="email" 
                                      placeholder="member@example.com" 
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="memberRole">Role</Label>
                                    <Select>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="MEMBER">Member</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsCreateMemberDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleCreateMember}>
                                    Send Invitation
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {members.map((member) => (
                              <div key={member.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                      <Users className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{member.userName}</h3>
                                      <p className="text-sm text-gray-600">{member.userEmail}</p>
                                      <p className="text-xs text-gray-500">
                                        Joined: {new Date(member.joinedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    {getRoleBadge(member.role)}
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="sm">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      {member.role !== 'OWNER' && (
                                        <Button variant="outline" size="sm" className="text-red-600">
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold">No Agency Account</h3>
                      <p className="text-muted-foreground">
                        Create your agency to start managing clients and campaigns
                      </p>
                    </div>
                    <Dialog open={isCreateAgencyDialogOpen} onOpenChange={setIsCreateAgencyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Agency
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Your Agency</DialogTitle>
                          <DialogDescription>
                            Set up your media agency to start managing clients and campaigns.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="agencyName">Agency Name</Label>
                            <Input 
                              id="agencyName" 
                              placeholder="Enter your agency name" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input 
                              id="contactEmail" 
                              type="email" 
                              placeholder="contact@youragency.com" 
                            />
                          </div>
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Your agency will be created with a Basic subscription tier. You can upgrade later.
                            </AlertDescription>
                          </Alert>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCreateAgencyDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateAgency}>
                            Create Agency
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}