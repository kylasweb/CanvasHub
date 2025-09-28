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
  DollarSign, 
  Calendar,
  Star,
  Copy,
  Search,
  Filter,
  Zap,
  Database,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SaaSPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  features: string[];
  limits: Record<string, any>;
  status: 'active' | 'inactive' | 'archived' | 'draft';
  sortOrder: number;
  isPopular: boolean;
  trialDays: number;
  setupFee: number;
  subscribers: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

const billingCycleLabels = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  lifetime: 'Lifetime'
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  archived: 'bg-red-100 text-red-800',
  draft: 'bg-yellow-100 text-yellow-800'
};

export default function SaaSPlansManager() {
  const router = useRouter();
  const { user, appUser, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<SaaSPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SaaSPlan | null>(null);

  // Mock data for demonstration
  const mockPlans: SaaSPlan[] = [
    {
      id: '1',
      name: 'Starter',
      description: 'Perfect for individuals and small teams getting started',
      price: 29,
      currency: 'USD',
      billingCycle: 'monthly',
      features: ['Up to 5 users', '10GB storage', 'Basic analytics', 'Email support'],
      limits: { users: 5, storage: 10, projects: 10 },
      status: 'active',
      sortOrder: 1,
      isPopular: false,
      trialDays: 14,
      setupFee: 0,
      subscribers: 1247,
      revenue: 36163,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Professional',
      description: 'Ideal for growing businesses with advanced needs',
      price: 79,
      currency: 'USD',
      billingCycle: 'monthly',
      features: ['Up to 25 users', '100GB storage', 'Advanced analytics', 'Priority support', 'API access'],
      limits: { users: 25, storage: 100, projects: 100, apiCalls: 10000 },
      status: 'active',
      sortOrder: 2,
      isPopular: true,
      trialDays: 14,
      setupFee: 0,
      subscribers: 856,
      revenue: 67624,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      id: '3',
      name: 'Enterprise',
      description: 'Custom solution for large organizations',
      price: 299,
      currency: 'USD',
      billingCycle: 'monthly',
      features: ['Unlimited users', 'Unlimited storage', 'Custom analytics', '24/7 dedicated support', 'Custom integrations', 'SLA guarantee'],
      limits: { users: -1, storage: -1, projects: -1, apiCalls: -1 },
      status: 'active',
      sortOrder: 3,
      isPopular: false,
      trialDays: 30,
      setupFee: 1000,
      subscribers: 124,
      revenue: 37076,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      id: '4',
      name: 'Free Trial',
      description: 'Try all features for 14 days',
      price: 0,
      currency: 'USD',
      billingCycle: 'monthly',
      features: ['All features included', '5 users', '10GB storage', 'Full support'],
      limits: { users: 5, storage: 10, projects: 10 },
      status: 'active',
      sortOrder: 0,
      isPopular: false,
      trialDays: 14,
      setupFee: 0,
      subscribers: 3421,
      revenue: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
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
      setPlans(mockPlans);
      setFilteredPlans(mockPlans);
      setLoadingPlans(false);
    }, 1000);
  }, [user, appUser, loading, router]);

  useEffect(() => {
    let filtered = plans;

    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(plan => plan.status === selectedStatus);
    }

    if (selectedBillingCycle !== 'all') {
      filtered = filtered.filter(plan => plan.billingCycle === selectedBillingCycle);
    }

    setFilteredPlans(filtered);
  }, [plans, searchTerm, selectedStatus, selectedBillingCycle]);

  const togglePlanStatus = (planId: string) => {
    setPlans(prev => prev.map(plan => 
      plan.id === planId 
        ? { ...plan, status: plan.status === 'active' ? 'inactive' : 'active' }
        : plan
    ));
    
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      toast({
        title: `Plan ${plan.status === 'active' ? 'Deactivated' : 'Activated'}`,
        description: `${plan.name} has been ${plan.status === 'active' ? 'deactivated' : 'activated'}`,
      });
    }
  };

  const handleCreatePlan = () => {
    // This would open a form to create a new plan
    toast({
      title: "Create Plan",
      description: "Plan creation form would open here",
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditPlan = (plan: SaaSPlan) => {
    setEditingPlan(plan);
    // This would open an edit form
    toast({
      title: "Edit Plan",
      description: `Edit form for ${plan.name} would open here`,
    });
  };

  const handleDeletePlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan && confirm(`Are you sure you want to delete ${plan.name}?`)) {
      setPlans(prev => prev.filter(p => p.id !== planId));
      toast({
        title: "Plan Deleted",
        description: `${plan.name} has been deleted`,
      });
    }
  };

  const handleDuplicatePlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      const duplicatedPlan = {
        ...plan,
        id: Date.now().toString(),
        name: `${plan.name} (Copy)`,
        status: 'draft' as const,
        subscribers: 0,
        revenue: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setPlans(prev => [...prev, duplicatedPlan]);
      toast({
        title: "Plan Duplicated",
        description: `${plan.name} has been duplicated`,
      });
    }
  };

  if (loading || loadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SAAS Plans Manager...</p>
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
              <Settings className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the SAAS plans manager.
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

  // Calculate totals
  const totalSubscribers = plans.reduce((sum, plan) => sum + plan.subscribers, 0);
  const totalRevenue = plans.reduce((sum, plan) => sum + plan.revenue, 0);
  const activePlans = plans.filter(plan => plan.status === 'active').length;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SAAS Plans Manager</h1>
              <p className="text-gray-600 mt-2">Manage subscription plans and pricing</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push('/admin/saas-creator')}>
                <Zap className="w-4 h-4 mr-2" />
                Advanced Creator
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Plan</DialogTitle>
                    <DialogDescription>
                      Define a new subscription plan for the platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="plan-name">Plan Name</Label>
                      <Input id="plan-name" placeholder="Enter plan name" />
                    </div>
                    <div>
                      <Label htmlFor="plan-description">Description</Label>
                      <Textarea id="plan-description" placeholder="Describe the plan" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="plan-price">Price</Label>
                        <Input id="plan-price" type="number" placeholder="0.00" />
                      </div>
                      <div>
                        <Label htmlFor="plan-cycle">Billing Cycle</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cycle" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(billingCycleLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePlan}>
                        Create Plan
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plans.length}</div>
              <p className="text-xs text-muted-foreground">
                {activePlans} active plans
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all plans
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">
                Recurring revenue
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalSubscribers > 0 ? (totalRevenue / totalSubscribers).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Per subscriber
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedBillingCycle} onValueChange={setSelectedBillingCycle}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Cycles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cycles</SelectItem>
                    {Object.entries(billingCycleLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="relative">
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {plan.description}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[plan.status]}>
                    {plan.status}
                  </Badge>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/{billingCycleLabels[plan.billingCycle].toLowerCase()}</span>
                  </div>
                  {plan.setupFee > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      +${plan.setupFee} setup fee
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Features */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Features</h4>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-sm text-gray-500">
                        +{plan.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Subscribers</p>
                    <p className="text-sm font-medium">{plan.subscribers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-sm font-medium">${plan.revenue.toLocaleString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Switch
                    checked={plan.status === 'active'}
                    onCheckedChange={() => togglePlanStatus(plan.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPlan(plan)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicatePlan(plan.id)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your filters or create a new plan.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}