"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Settings, 
  Users, 
  FileText, 
  Camera, 
  CreditCard, 
  BarChart3, 
  Calendar,
  MessageSquare,
  Database,
  Shield,
  Zap,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Feature {
  id: string;
  name: string;
  description: string;
  category: 'client_management' | 'project_workflow' | 'photo_studio' | 'analytics' | 'financial' | 'system';
  status: 'active' | 'inactive' | 'beta' | 'development';
  enabled: boolean;
  userRoles: string[];
  pricingTier: 'starter' | 'professional' | 'enterprise' | 'all';
  lastUpdated: string;
  dependencies: string[];
  settings: Record<string, any>;
}

const categoryIcons = {
  client_management: Users,
  project_workflow: FileText,
  photo_studio: Camera,
  analytics: BarChart3,
  financial: CreditCard,
  system: Settings
};

const categoryLabels = {
  client_management: 'Client Management',
  project_workflow: 'Project Workflow',
  photo_studio: 'Photo Studio',
  analytics: 'Analytics',
  financial: 'Financial',
  system: 'System'
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  beta: 'bg-blue-100 text-blue-800',
  development: 'bg-yellow-100 text-yellow-800'
};

export default function FeatureManager() {
  const router = useRouter();
  const { user, appUser, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [filteredFeatures, setFilteredFeatures] = useState<Feature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

  // Mock data for demonstration
  const mockFeatures: Feature[] = [
    {
      id: '1',
      name: 'Client Database',
      description: 'Comprehensive client management with advanced CRM capabilities',
      category: 'client_management',
      status: 'active',
      enabled: true,
      userRoles: ['admin', 'user'],
      pricingTier: 'all',
      lastUpdated: '2024-01-15',
      dependencies: [],
      settings: { maxClients: 1000, customFields: true }
    },
    {
      id: '2',
      name: 'Project Workflow Automation',
      description: 'Automated project workflows with custom triggers and actions',
      category: 'project_workflow',
      status: 'beta',
      enabled: true,
      userRoles: ['admin', 'manager'],
      pricingTier: 'professional',
      lastUpdated: '2024-01-14',
      dependencies: ['1'],
      settings: { maxWorkflows: 50, aiEnabled: true }
    },
    {
      id: '3',
      name: 'Advanced Photo Editor',
      description: 'Professional photo editing with AI-powered enhancements',
      category: 'photo_studio',
      status: 'active',
      enabled: true,
      userRoles: ['admin', 'user', 'editor'],
      pricingTier: 'professional',
      lastUpdated: '2024-01-13',
      dependencies: [],
      settings: { maxStorage: '50GB', aiFeatures: true }
    },
    {
      id: '4',
      name: 'Real-time Analytics',
      description: 'Live business analytics with custom dashboards',
      category: 'analytics',
      status: 'development',
      enabled: false,
      userRoles: ['admin'],
      pricingTier: 'enterprise',
      lastUpdated: '2024-01-12',
      dependencies: ['1'],
      settings: { realTimeUpdates: true, customReports: true }
    },
    {
      id: '5',
      name: 'Invoice Generation',
      description: 'Automated invoice creation and payment processing',
      category: 'financial',
      status: 'active',
      enabled: true,
      userRoles: ['admin', 'manager'],
      pricingTier: 'all',
      lastUpdated: '2024-01-11',
      dependencies: ['1'],
      settings: { autoInvoicing: true, paymentGateways: ['stripe', 'paypal'] }
    },
    {
      id: '6',
      name: 'System Health Monitoring',
      description: 'Comprehensive system monitoring and alerting',
      category: 'system',
      status: 'active',
      enabled: true,
      userRoles: ['admin'],
      pricingTier: 'all',
      lastUpdated: '2024-01-10',
      dependencies: [],
      settings: { alertsEnabled: true, uptimeMonitoring: true }
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
      setFeatures(mockFeatures);
      setFilteredFeatures(mockFeatures);
      setLoadingFeatures(false);
    }, 1000);
  }, [user, appUser, loading, router]);

  useEffect(() => {
    let filtered = features;

    if (searchTerm) {
      filtered = filtered.filter(feature =>
        feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(feature => feature.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(feature => feature.status === selectedStatus);
    }

    setFilteredFeatures(filtered);
  }, [features, searchTerm, selectedCategory, selectedStatus]);

  const toggleFeatureEnabled = (featureId: string) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));
    
    const feature = features.find(f => f.id === featureId);
    if (feature) {
      toast({
        title: `Feature ${feature.enabled ? 'Disabled' : 'Enabled'}`,
        description: `${feature.name} has been ${feature.enabled ? 'disabled' : 'enabled'}`,
      });
    }
  };

  const handleCreateFeature = () => {
    // This would open a form to create a new feature
    toast({
      title: "Create Feature",
      description: "Feature creation form would open here",
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditFeature = (feature: Feature) => {
    setEditingFeature(feature);
    // This would open an edit form
    toast({
      title: "Edit Feature",
      description: `Edit form for ${feature.name} would open here`,
    });
  };

  const handleDeleteFeature = (featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (feature && confirm(`Are you sure you want to delete ${feature.name}?`)) {
      setFeatures(prev => prev.filter(f => f.id !== featureId));
      toast({
        title: "Feature Deleted",
        description: `${feature.name} has been deleted`,
      });
    }
  };

  if (loading || loadingFeatures) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Feature Manager...</p>
        </div>
      </div>
    );
  }

  if (!user || appUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the feature manager.
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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feature Manager</h1>
              <p className="text-gray-600 mt-2">Manage and configure platform features</p>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Feature
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Feature</DialogTitle>
                    <DialogDescription>
                      Define a new feature for the platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="feature-name">Feature Name</Label>
                      <Input id="feature-name" placeholder="Enter feature name" />
                    </div>
                    <div>
                      <Label htmlFor="feature-description">Description</Label>
                      <Textarea id="feature-description" placeholder="Describe the feature" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="feature-category">Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(categoryLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="feature-tier">Pricing Tier</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                            <SelectItem value="all">All Tiers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateFeature}>
                        Create Feature
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search features..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => {
            const CategoryIcon = categoryIcons[feature.category];
            return (
              <Card key={feature.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CategoryIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{feature.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {categoryLabels[feature.category]}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={() => toggleFeatureEnabled(feature.id)}
                      />
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFeature(feature)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFeature(feature.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Status</span>
                      <Badge className={statusColors[feature.status]}>
                        {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Pricing</span>
                      <Badge variant="outline">
                        {feature.pricingTier.charAt(0).toUpperCase() + feature.pricingTier.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Roles</span>
                      <div className="flex gap-1">
                        {feature.userRoles.slice(0, 2).map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                        {feature.userRoles.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{feature.userRoles.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {feature.dependencies.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Dependencies</span>
                        <span className="text-xs text-gray-600">
                          {feature.dependencies.length} required
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredFeatures.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No features found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}