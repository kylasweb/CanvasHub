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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
  Users, 
  TrendingUp, 
  DollarSign, 
  Link as LinkIcon, 
  Copy, 
  ExternalLink,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Share2
} from 'lucide-react';

// Mock data for development
const mockInfluencerData = {
  id: "1",
  status: "ACTIVE" as const,
  trackingLink: "https://example.com/ref/user123",
  commissionRate: 0.15,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-20T14:45:00Z"
};

const mockMetrics = [
  { date: '2024-01-15', clicks: 45, signups: 3, conversions: 1 },
  { date: '2024-01-16', clicks: 52, signups: 4, conversions: 2 },
  { date: '2024-01-17', clicks: 38, signups: 2, conversions: 1 },
  { date: '2024-01-18', clicks: 67, signups: 5, conversions: 3 },
  { date: '2024-01-19', clicks: 71, signups: 6, conversions: 2 },
  { date: '2024-01-20', clicks: 84, signups: 7, conversions: 4 },
];

const mockPayouts = [
  {
    id: "1",
    amount: 150.00,
    status: "PROCESSED" as const,
    payoutMethod: "Bank Transfer",
    transactionId: "TXN123456",
    processedAt: "2024-01-10T10:00:00Z",
    createdAt: "2024-01-05T12:00:00Z"
  },
  {
    id: "2",
    amount: 89.50,
    status: "PENDING" as const,
    payoutMethod: "PayPal",
    transactionId: null,
    processedAt: null,
    createdAt: "2024-01-20T14:00:00Z"
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
    title: 'Marketing',
    items: [
      { 
        title: 'Influencers', 
        url: '/dashboard/influencers', 
        icon: Users,
        description: 'Manage influencer campaigns'
      }
    ]
  }
];

export default function InfluencerManagement() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [influencerData, setInfluencerData] = useState(mockInfluencerData);
  const [metrics, setMetrics] = useState(mockMetrics);
  const [payouts, setPayouts] = useState(mockPayouts);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    commissionRate: mockInfluencerData.commissionRate
  });

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/auth');
      return;
    }
  }, [user, loading, router]);

  const handleCreateProfile = async () => {
    try {
      // TODO: Implement API call
      toast({
        title: "Profile Created",
        description: "Your influencer profile has been created successfully!",
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create influencer profile",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // TODO: Implement API call
      setInfluencerData(prev => ({
        ...prev,
        commissionRate: editForm.commissionRate
      }));
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your influencer profile has been updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update influencer profile",
        variant: "destructive"
      });
    }
  };

  const copyTrackingLink = () => {
    navigator.clipboard.writeText(influencerData.trackingLink || '');
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

  const getPayoutStatusBadge = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return <Badge className="bg-green-100 text-green-800">Processed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalClicks = metrics.reduce((sum, metric) => sum + metric.clicks, 0);
  const totalSignups = metrics.reduce((sum, metric) => sum + metric.signups, 0);
  const totalConversions = metrics.reduce((sum, metric) => sum + metric.conversions, 0);
  const totalEarnings = totalConversions * 50; // Assuming $50 per conversion
  const pendingPayouts = payouts.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0);

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
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">Influencer Hub</h1>
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
                  <h1 className="text-lg font-semibold">Influencer Management</h1>
                </div>
                {!influencerData && (
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Influencer Profile</DialogTitle>
                        <DialogDescription>
                          Set up your influencer profile to start earning commissions through referrals.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="commission">Commission Rate (%)</Label>
                          <Input 
                            id="commission" 
                            type="number" 
                            placeholder="10" 
                            defaultValue="10"
                            min="1"
                            max="50"
                          />
                        </div>
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Your profile will be reviewed by our team before activation.
                          </AlertDescription>
                        </Alert>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateProfile}>
                          Create Profile
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6">
              {influencerData ? (
                <div className="space-y-6">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalClicks}</div>
                        <p className="text-xs text-muted-foreground">
                          +12.5% from last week
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sign-ups</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalSignups}</div>
                        <p className="text-xs text-muted-foreground">
                          +8.2% from last week
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalConversions}</div>
                        <p className="text-xs text-muted-foreground">
                          +15.3% from last week
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
                          ${pendingPayouts.toFixed(2)} pending
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="tracking">Tracking</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="payouts">Payouts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>Profile Information</CardTitle>
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
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Status</span>
                              {getStatusBadge(influencerData.status)}
                            </div>
                            
                            {isEditing ? (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="commissionRate">Commission Rate</Label>
                                  <Input 
                                    id="commissionRate"
                                    type="number"
                                    value={editForm.commissionRate}
                                    onChange={(e) => setEditForm(prev => ({
                                      ...prev,
                                      commissionRate: parseFloat(e.target.value) || 0
                                    }))}
                                    min="0"
                                    max="1"
                                    step="0.01"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleUpdateProfile}>
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
                                  <span className="text-sm font-medium">Commission Rate</span>
                                  <span className="text-sm">{(influencerData.commissionRate * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Created</span>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(influencerData.createdAt).toLocaleDateString()}
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
                            <Button className="w-full justify-start" onClick={copyTrackingLink}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Tracking Link
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share on Social Media
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                              <Download className="w-4 h-4 mr-2" />
                              Export Reports
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="tracking" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Your Tracking Link</CardTitle>
                          <CardDescription>
                            Share this link to earn commissions from referrals
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Input 
                              value={influencerData.trackingLink || ''} 
                              readOnly 
                              className="flex-1"
                            />
                            <Button onClick={copyTrackingLink} size="sm">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Commission rate: {(influencerData.commissionRate * 100).toFixed(1)}% per successful conversion
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Overview</CardTitle>
                          <CardDescription>
                            Track your clicks, sign-ups, and conversions over time
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={{}} className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={metrics}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line type="monotone" dataKey="clicks" stroke="#8884d8" name="Clicks" />
                                <Line type="monotone" dataKey="signups" stroke="#82ca9d" name="Sign-ups" />
                                <Line type="monotone" dataKey="conversions" stroke="#ffc658" name="Conversions" />
                              </LineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="payouts" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Payout History</CardTitle>
                          <CardDescription>
                            Track your earnings and payout status
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {payouts.map((payout) => (
                              <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">${payout.amount.toFixed(2)}</span>
                                    {getPayoutStatusBadge(payout.status)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Method: {payout.payoutMethod}
                                    {payout.transactionId && (
                                      <span className="ml-2">• ID: {payout.transactionId}</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Created: {new Date(payout.createdAt).toLocaleDateString()}
                                    {payout.processedAt && (
                                      <span className="ml-2">• Processed: {new Date(payout.processedAt).toLocaleDateString()}</span>
                                    )}
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
                    <Users className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold">No Influencer Profile</h3>
                      <p className="text-muted-foreground">
                        Create your influencer profile to start earning commissions
                      </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Influencer Profile</DialogTitle>
                          <DialogDescription>
                            Set up your influencer profile to start earning commissions through referrals.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="commission">Commission Rate (%)</Label>
                            <Input 
                              id="commission" 
                              type="number" 
                              placeholder="10" 
                              defaultValue="10"
                              min="1"
                              max="50"
                            />
                          </div>
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Your profile will be reviewed by our team before activation.
                            </AlertDescription>
                          </Alert>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateProfile}>
                            Create Profile
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