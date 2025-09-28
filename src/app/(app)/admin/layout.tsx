"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  Camera, 
  BarChart3, 
  Settings, 
  Database,
  Shield,
  Bell,
  Activity,
  Zap,
  LogOut,
  ChevronRight,
  ChevronDown,
  Grid3X3,
  Wrench,
  Image,
  MessageSquare,
  Globe,
  Key,
  Smartphone,
  IdCard,
  QrCode,
  Layout,
  Code
} from 'lucide-react';

const adminMenuItems = [
  {
    title: 'Dashboard',
    items: [
      { 
        title: 'Admin Dashboard', 
        url: '/admin', 
        icon: LayoutDashboard,
        description: 'Platform overview and analytics'
      },
      { 
        title: 'Feature Manager', 
        url: '/admin/features', 
        icon: Grid3X3,
        description: 'Manage platform features'
      }
    ]
  },
  {
    title: 'SAAS Management',
    items: [
      { 
        title: 'SAAS Plans', 
        url: '/admin/saas-plans', 
        icon: Database,
        description: 'Manage subscription plans'
      },
      { 
        title: 'Plan Creator', 
        url: '/admin/saas-creator', 
        icon: Zap,
        description: 'Create advanced plans'
      },
      { 
        title: 'SAAS Analytics', 
        url: '/admin/saas-analytics', 
        icon: BarChart3,
        description: 'SAAS metrics and insights'
      }
    ]
  },
  {
    title: 'Virtual Visiting Cards',
    items: [
      { 
        title: 'All Cards', 
        url: '/admin/visiting-cards', 
        icon: IdCard,
        description: 'Manage all virtual visiting cards'
      },
      { 
        title: 'Card Analytics', 
        url: '/admin/visiting-cards/analytics', 
        icon: QrCode,
        description: 'Card usage statistics'
      }
    ]
  },
  {
    title: 'Web Designer',
    items: [
      { 
        title: 'All Designs', 
        url: '/admin/web-designs', 
        icon: Layout,
        description: 'Manage all web designs'
      },
      { 
        title: 'Templates', 
        url: '/admin/web-designs/templates', 
        icon: Code,
        description: 'Manage design templates'
      }
    ]
  },
  {
    title: 'KYC Verification',
    items: [
      { 
        title: 'KYC Verifications', 
        url: '/admin/kyc-verifications', 
        icon: Shield,
        description: 'Manage identity verification requests'
      },
      { 
        title: 'KYC Analytics', 
        url: '/admin/kyc-analytics', 
        icon: BarChart3,
        description: 'KYC verification statistics'
      }
    ]
  },
  {
    title: 'Influencer Management',
    items: [
      { 
        title: 'Influencers', 
        url: '/admin/influencers', 
        icon: Users,
        description: 'Manage influencer accounts and campaigns'
      },
      { 
        title: 'Payouts', 
        url: '/admin/influencers/payouts', 
        icon: CreditCard,
        description: 'Process influencer payments and commissions'
      },
      { 
        title: 'Activity Monitor', 
        url: '/admin/influencers/activity', 
        icon: Activity,
        description: 'Real-time activity monitoring and fraud detection'
      }
    ]
  },
  {
    title: 'User Management',
    items: [
      { 
        title: 'All Users', 
        url: '/admin/users', 
        icon: Users,
        description: 'Manage user accounts and roles'
      },
      { 
        title: 'User Roles', 
        url: '/admin/roles', 
        icon: Key,
        description: 'Manage user permissions'
      }
    ]
  },
  {
    title: 'Content Management',
    items: [
      { 
        title: 'All Projects', 
        url: '/admin/projects', 
        icon: FileText,
        description: 'Manage all platform projects'
      },
      { 
        title: 'Media Library', 
        url: '/admin/media', 
        icon: Image,
        description: 'Manage photos and media'
      },
      { 
        title: 'Content Pages', 
        url: '/admin/content', 
        icon: MessageSquare,
        description: 'Manage landing pages and content'
      }
    ]
  },
  {
    title: 'Financial Management',
    items: [
      { 
        title: 'All Payments', 
        url: '/admin/payments', 
        icon: CreditCard,
        description: 'Manage transactions and billing'
      },
      { 
        title: 'Subscriptions', 
        url: '/admin/subscriptions', 
        icon: Database,
        description: 'Manage user subscriptions'
      }
    ]
  },
  {
    title: 'Analytics & Reports',
    items: [
      { 
        title: 'Analytics', 
        url: '/admin/analytics', 
        icon: BarChart3,
        description: 'Platform analytics and insights'
      },
      { 
        title: 'System Logs', 
        url: '/admin/logs', 
        icon: Activity,
        description: 'System logs and monitoring'
      }
    ]
  },
  {
    title: 'System Settings',
    items: [
      { 
        title: 'General Settings', 
        url: '/admin/settings', 
        icon: Settings,
        description: 'Platform configuration'
      },
      { 
        title: 'Integrations', 
        url: '/admin/integrations', 
        icon: Wrench,
        description: 'Third-party integrations'
      },
      { 
        title: 'Security', 
        url: '/admin/security', 
        icon: Shield,
        description: 'Security settings and monitoring'
      }
    ]
  }
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, appUser, signOut } = useAuth();
  const { toast } = useToast();
  const [systemStatus] = useState({
    uptime: '45d 12h',
    memory: '67%',
    cpu: '23%',
    connections: 1247
  });
  const [isSystemStatusOpen, setIsSystemStatusOpen] = useState(true);

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
      router.push('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  const isActive = (url: string) => {
    return pathname === url;
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full relative">
        <Sidebar className="border-r bg-gray-50 z-50">
          <SidebarHeader className="border-b bg-white z-10">
            <div className="flex items-center gap-3 p-4">
              <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">Canvas Hub Management</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="flex-1 overflow-y-auto">
            {adminMenuItems.map((category) => (
              <SidebarGroup key={category.title}>
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                  {category.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {category.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          onClick={() => handleNavigation(item.url)}
                          className={`w-full justify-start px-4 py-3 mx-2 rounded-lg transition-colors relative z-10 ${
                            isActive(item.url) 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-sm font-medium truncate">{item.title}</span>
                              <span className="text-xs text-gray-500 truncate">{item.description}</span>
                            </div>
                            {isActive(item.url) && (
                              <ChevronRight className="w-4 h-4 text-red-600 flex-shrink-0" />
                            )}
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t bg-white p-4">
            <div className="space-y-4">
              {/* Collapsible System Status */}
              <Collapsible open={isSystemStatusOpen} onOpenChange={setIsSystemStatusOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                    <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-0">
                      System Status
                    </SidebarGroupLabel>
                    <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" 
                      style={{ transform: isSystemStatusOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">CPU</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {systemStatus.cpu}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium">Memory</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {systemStatus.memory}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Connections</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {systemStatus.connections}
                      </Badge>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* User Actions */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {appUser?.name || 'Admin User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {appUser?.email || 'admin@example.com'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut} 
                  className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 relative z-10">
          <header className="flex items-center justify-between h-16 px-6 border-b bg-white relative z-20">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-6 w-px bg-gray-200"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Platform Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Administrator
              </Badge>
              <Badge variant="secondary">
                {systemStatus.uptime}
              </Badge>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Alerts
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-gray-50 relative z-10">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}