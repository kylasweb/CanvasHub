"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { usePerformance } from '@/lib/performance';
import { useAuth } from '@/contexts/AuthContext';
import { ClientList } from '@/features/client-management/components/ClientList';
import EventManagement from '@/features/event-photo-management/components/EventManagement';
import ProductDesigner from '@/features/product-designer/components/ProductDesigner';
import PhotoDesigner from '@/features/photo-designer/components/PhotoDesigner';
import { ProjectList } from '@/features/project-workflows/components/ProjectList';
import { InvoiceList } from '@/features/invoicing/components/InvoiceList';
import { 
  Activity, 
  BarChart3, 
  Bell, 
  Database, 
  Home, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Settings, 
  Users, 
  Wifi, 
  Zap,
  TrendingUp,
  Clock,
  Server,
  Globe,
  UserPlus,
  FileText,
  Calendar,
  CreditCard,
  Camera,
  Image,
  Palette,
  ShoppingBag,
  Edit,
  Shield,
  Smartphone,
  IdCard,
  Code,
  Layout,
  Users as UsersIcon,
  DollarSign,
  ExternalLink,
  Building2
} from 'lucide-react';
import { io } from 'socket.io-client';

// Mock data for charts
const salesData = [
  { month: 'Jan', sales: 4000, revenue: 2400 },
  { month: 'Feb', sales: 3000, revenue: 1398 },
  { month: 'Mar', sales: 2000, revenue: 9800 },
  { month: 'Apr', sales: 2780, revenue: 3908 },
  { month: 'May', sales: 1890, revenue: 4800 },
  { month: 'Jun', sales: 2390, revenue: 3800 },
];

const userActivityData = [
  { hour: '00:00', active: 400 },
  { hour: '04:00', active: 300 },
  { hour: '08:00', active: 200 },
  { hour: '12:00', active: 278 },
  { hour: '16:00', active: 189 },
  { hour: '20:00', active: 239 },
];

const pieData = [
  { name: 'Desktop', value: 400, color: '#8884d8' },
  { name: 'Mobile', value: 300, color: '#82ca9d' },
  { name: 'Tablet', value: 300, color: '#ffc658' },
];

// Enhanced categorized and nested menu items
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
        icon: Home,
        description: 'Main dashboard view'
      }
    ]
  },
  {
    title: 'Client Management',
    items: [
      { 
        title: 'Clients', 
        url: '/clients', 
        icon: Users,
        description: 'Client database and relationships'
      },
      { 
        title: 'Client Groups', 
        url: '/client-groups', 
        icon: UserPlus,
        description: 'Client categorization'
      }
    ]
  },
  {
    title: 'Projects & Workflows',
    items: [
      { 
        title: 'Projects', 
        url: '/projects', 
        icon: FileText,
        description: 'Project management and tracking'
      },
      { 
        title: 'Calendar', 
        url: '/calendar', 
        icon: Calendar,
        description: 'Schedule and appointments'
      }
    ]
  },
  {
    title: 'Digital Tools',
    items: [
      { 
        title: 'Virtual Visiting Cards', 
        url: '/visiting-card', 
        icon: IdCard,
        description: 'Create and manage digital business cards'
      },
      { 
        title: 'Web Designer', 
        url: '/web-designer', 
        icon: Layout,
        description: 'Create and manage websites and landing pages'
      }
    ]
  },
  {
    title: 'Account Setup',
    items: [
      { 
        title: 'Onboarding Guide', 
        url: '/onboarding', 
        icon: UserPlus,
        description: 'Complete your account setup'
      },
      { 
        title: 'KYC Verification', 
        url: '/kyc-verification', 
        icon: Shield,
        description: 'Identity verification and security'
      }
    ]
  },
  {
    title: 'Marketing',
    items: [
      { 
        title: 'Influencers', 
        url: '/dashboard/influencers', 
        icon: UsersIcon,
        description: 'Manage influencer campaigns'
      },
      { 
        title: 'Agencies', 
        url: '/dashboard/agencies', 
        icon: Building2,
        description: 'Manage agency clients and campaigns'
      }
    ]
  },
  {
    title: 'Financial Operations',
    items: [
      { 
        title: 'Invoices', 
        url: '/invoices', 
        icon: CreditCard,
        description: 'Billing and payments'
      },
      { 
        title: 'Revenue Analytics', 
        url: '/revenue', 
        icon: TrendingUp,
        description: 'Financial performance'
      }
    ]
  },
  {
    title: 'Creative Suite',
    items: [
      { 
        title: 'Photo Management', 
        url: '/photos', 
        icon: Camera,
        description: 'Photo organization and editing'
      },
      { 
        title: 'Event Management', 
        url: '/events', 
        icon: Calendar,
        description: 'Event planning and coordination'
      },
      { 
        title: 'Product Designer', 
        url: '/products', 
        icon: Palette,
        description: 'Product creation tools'
      },
      { 
        title: 'Photo Editor', 
        url: '/editor', 
        icon: Edit,
        description: 'Advanced photo editing'
      }
    ]
  },
  {
    title: 'Analytics & Insights',
    items: [
      { 
        title: 'Analytics', 
        url: '/analytics', 
        icon: BarChart3,
        description: 'Business intelligence'
      },
      { 
        title: 'Performance', 
        url: '/performance', 
        icon: Zap,
        description: 'System performance metrics'
      }
    ]
  },
  {
    title: 'System Tools',
    items: [
      { 
        title: 'WebSocket', 
        url: '/websocket', 
        icon: Wifi,
        description: 'Real-time communication'
      },
      { 
        title: 'Settings', 
        url: '/settings', 
        icon: Settings,
        description: 'System configuration'
      }
    ]
  },
  {
    title: 'Administration',
    items: [
      { 
        title: 'Admin Dashboard', 
        url: '/admin', 
        icon: Shield,
        description: 'Platform administration (Admin only)'
      },
      { 
        title: 'Feature Manager', 
        url: '/admin/features', 
        icon: Settings,
        description: 'Manage platform features (Admin only)'
      }
    ]
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { user, appUser, loading, signOut } = useAuth();
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [systemStatus, setSystemStatus] = useState({
    uptime: '2h 34m',
    memory: '45%',
    cpu: '23%',
    connections: 156
  });
  const [activeSection, setActiveSection] = useState('overview');
  const { metrics, measure, measureAsync } = usePerformance();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;
    
    // No client-side redirects - middleware handles authentication
    // Only initialize WebSocket if user is available
  }, [loading]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    const initSocket = async () => {
      const newSocket = io('http://localhost:3000', {
        path: '/api/socketio',
        transports: ['websocket']
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
        toast({
          title: "WebSocket Connected",
          description: "Real-time features are now active",
        });
      });

      newSocket.on('message', (msg: any) => {
        setMessages(prev => [...prev, msg]);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
        toast({
          title: "WebSocket Disconnected",
          description: "Real-time features are temporarily unavailable",
          variant: "destructive"
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    };

    initSocket();
  }, [user, toast]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        connections: prev.connections + Math.floor(Math.random() * 10) - 5,
        cpu: `${Math.floor(Math.random() * 40 + 10)}%`,
        memory: `${Math.floor(Math.random() * 30 + 30)}%`
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (socket && inputMessage.trim()) {
      socket.emit('message', {
        text: inputMessage,
        senderId: 'user'
      });
      setInputMessage('');
    }
  };

  const handleCreateClient = () => {
    toast({
      title: "Client Creation",
      description: "Client creation form would open here",
    });
  };

  const handleEditClient = (clientId: string) => {
    toast({
      title: "Edit Client",
      description: `Edit client ${clientId} form would open here`,
    });
  };

  const handleCreateProject = () => {
    toast({
      title: "Project Creation",
      description: "Project creation form would open here",
    });
  };

  const handleEditProject = (projectId: string) => {
    toast({
      title: "Edit Project",
      description: `Edit project ${projectId} form would open here`,
    });
  };

  const handleCreateInvoice = () => {
    toast({
      title: "Invoice Creation",
      description: "Invoice creation form would open here",
    });
  };

  const handleEditInvoice = (invoiceId: string) => {
    toast({
      title: "Edit Invoice",
      description: `Edit invoice ${invoiceId} form would open here`,
    });
  };

  const handleViewInvoice = (invoiceId: string) => {
    toast({
      title: "View Invoice",
      description: `View invoice ${invoiceId} details would open here`,
    });
  };

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

  // No client-side access checks - middleware handles authentication
  // If user reaches here, they are authenticated

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full relative">
        <Sidebar className="z-50 w-64 sidebar-container">
          <SidebarHeader className="z-10 border-b p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Canvas Hub</h1>
                <p className="text-xs text-muted-foreground">AI Platform</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="sidebar-content-wrapper">
            <div className="space-y-1 p-2">
              {menuItems.map((category) => (
                <div key={category.title} className="mb-3">
                  <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                    {category.title}
                  </SidebarGroupLabel>
                  <SidebarGroupContent className="space-y-1">
                    {category.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          onClick={() => {
                            if (item.url.startsWith('/')) {
                              router.push(item.url);
                            } else {
                              setActiveSection(item.title.toLowerCase().replace(/\s+/g, ''));
                            }
                          }}
                          className="sidebar-menu-item w-full flex items-center gap-3 px-3 py-2 h-auto rounded-lg"
                          tooltip={item.description}
                        >
                          <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                            <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="sidebar-menu-text text-sm font-medium">{item.title}</span>
                            <span className="sidebar-menu-description">
                              {item.description.length > 25 
                                ? `${item.description.substring(0, 25)}...` 
                                : item.description
                              }
                            </span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarGroupContent>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t px-2">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                  System Status
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <div className="system-status-item">
                      <div className="flex items-center gap-2">
                        <div className="system-status-indicator bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-medium">CPU</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {systemStatus.cpu}
                      </Badge>
                    </div>
                    <div className="system-status-item">
                      <div className="flex items-center gap-2">
                        <div className="system-status-indicator bg-yellow-500"></div>
                        <span className="text-sm font-medium">Memory</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {systemStatus.memory}
                      </Badge>
                    </div>
                    <div className="system-status-item">
                      <div className="flex items-center gap-2">
                        <div className="system-status-indicator bg-blue-500"></div>
                        <span className="text-sm font-medium">Connections</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {systemStatus.connections}
                      </Badge>
                    </div>
                    <div className="system-status-item">
                      <div className="flex items-center gap-2">
                        <div className="system-status-indicator bg-green-500"></div>
                        <span className="text-sm font-medium">Uptime</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {systemStatus.uptime}
                      </Badge>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          </SidebarContent>

          <SidebarFooter className="sidebar-footer">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="font-medium">WebSocket</span>
                </div>
                <Badge variant={socket?.connected ? "default" : "destructive"} className="text-xs">
                  {socket?.connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut} 
                className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive text-xs"
              >
                Sign Out
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="relative z-10">
          <header className="flex items-center justify-between p-4 border-b relative z-20">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-2xl font-semibold">Dashboard</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={socket?.connected ? "default" : "destructive"}>
                {socket?.connected ? "Live" : "Offline"}
              </Badge>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto relative z-10">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$45,231.89</div>
                      <p className="text-xs text-muted-foreground">
                        +20.1% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">+2350</div>
                      <p className="text-xs text-muted-foreground">
                        +180.1% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">+12,234</div>
                      <p className="text-xs text-muted-foreground">
                        +19% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">+573</div>
                      <p className="text-xs text-muted-foreground">
                        +201 since last hour
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Influencer Clicks</CardTitle>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,247</div>
                      <p className="text-xs text-muted-foreground">
                        +35.2% from last week
                      </p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/influencers')}>
                          <UsersIcon className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Agency Clients</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24</div>
                      <p className="text-xs text-muted-foreground">
                        +3 new this month
                      </p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/agencies')}>
                          <Building2 className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Overview</CardTitle>
                      <CardDescription>Monthly revenue for the current year</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{}} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={salesData}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User Activity</CardTitle>
                      <CardDescription>Active users over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{}} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={userActivityData}>
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="active" stroke="hsl(var(--primary))" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Recent Clients</CardTitle>
                      <CardDescription>Latest client additions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ClientList 
                        onCreateClient={handleCreateClient}
                        onEditClient={handleEditClient}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Device Distribution</CardTitle>
                      <CardDescription>User device types</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{}} className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Clients Section */}
            {activeSection === 'clients' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Client Management</h2>
                  <Button onClick={handleCreateClient}>
                    <Users className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </div>
                <ClientList 
                  onCreateClient={handleCreateClient}
                  onEditClient={handleEditClient}
                />
              </div>
            )}

            {/* Projects Section */}
            {activeSection === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Project Management</h2>
                  <Button onClick={handleCreateProject}>
                    <FileText className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </div>
                <ProjectList 
                  onCreateProject={handleCreateProject}
                  onEditProject={handleEditProject}
                />
              </div>
            )}

            {/* Invoices Section */}
            {activeSection === 'invoices' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Invoice Management</h2>
                  <Button onClick={handleCreateInvoice}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
                <InvoiceList 
                  onCreateInvoice={handleCreateInvoice}
                  onEditInvoice={handleEditInvoice}
                  onViewInvoice={handleViewInvoice}
                />
              </div>
            )}

            {/* Other sections would follow the same pattern... */}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}