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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Plus, 
  Save, 
  X, 
  Settings, 
  Users, 
  DollarSign, 
  Calendar,
  Star,
  Copy,
  Zap,
  Database,
  BarChart3,
  TrendingUp,
  HardDrive,
  Globe,
  Shield,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FeatureTemplate {
  id: string;
  name: string;
  description: string;
  category: 'storage' | 'users' | 'projects' | 'api' | 'support' | 'integrations' | 'analytics' | 'security' | 'customization';
  type: 'boolean' | 'numeric' | 'text' | 'select';
  defaultValue: any;
  unit?: string;
  options?: string[];
}

interface PlanFeature {
  id: string;
  featureId: string;
  name: string;
  description: string;
  value: any;
  isUnlimited: boolean;
  isVisible: boolean;
  unit?: string;
}

interface SaaSPlanData {
  id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  status: 'active' | 'inactive' | 'archived' | 'draft';
  sortOrder: number;
  isPopular: boolean;
  trialDays: number;
  setupFee: number;
  features: PlanFeature[];
  metadata: Record<string, any>;
}

const featureTemplates: FeatureTemplate[] = [
  {
    id: 'users',
    name: 'Number of Users',
    description: 'Maximum number of user accounts',
    category: 'users',
    type: 'numeric',
    defaultValue: 5,
    unit: 'users'
  },
  {
    id: 'storage',
    name: 'Storage Space',
    description: 'Total storage space available',
    category: 'storage',
    type: 'numeric',
    defaultValue: 10,
    unit: 'GB'
  },
  {
    id: 'projects',
    name: 'Projects',
    description: 'Maximum number of active projects',
    category: 'projects',
    type: 'numeric',
    defaultValue: 10,
    unit: 'projects'
  },
  {
    id: 'api_access',
    name: 'API Access',
    description: 'Access to platform API',
    category: 'api',
    type: 'boolean',
    defaultValue: false
  },
  {
    id: 'api_calls',
    name: 'API Calls Limit',
    description: 'Monthly API call limit',
    category: 'api',
    type: 'numeric',
    defaultValue: 1000,
    unit: 'calls/month'
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Priority customer support',
    category: 'support',
    type: 'boolean',
    defaultValue: false
  },
  {
    id: '24_7_support',
    name: '24/7 Support',
    description: 'Round-the-clock customer support',
    category: 'support',
    type: 'boolean',
    defaultValue: false
  },
  {
    id: 'custom_integrations',
    name: 'Custom Integrations',
    description: 'Ability to create custom integrations',
    category: 'integrations',
    type: 'boolean',
    defaultValue: false
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Advanced analytics and reporting',
    category: 'analytics',
    type: 'boolean',
    defaultValue: false
  },
  {
    id: 'white_label',
    name: 'White Label',
    description: 'White labeling capabilities',
    category: 'customization',
    type: 'boolean',
    defaultValue: false
  },
  {
    id: 'custom_domain',
    name: 'Custom Domain',
    description: 'Use custom domain',
    category: 'customization',
    type: 'boolean',
    defaultValue: false
  },
  {
    id: 'ssl_certificate',
    name: 'SSL Certificate',
    description: 'Free SSL certificate',
    category: 'security',
    type: 'boolean',
    defaultValue: false
  },
  {
    id: 'backup_frequency',
    name: 'Backup Frequency',
    description: 'How often data is backed up',
    category: 'security',
    type: 'select',
    defaultValue: 'daily',
    options: ['daily', 'weekly', 'monthly']
  }
];

const categoryIcons = {
  storage: HardDrive,
  users: Users,
  projects: BarChart3,
  api: Globe,
  support: MessageSquare,
  integrations: Zap,
  analytics: BarChart3,
  security: Shield,
  customization: Settings
};

const categoryLabels = {
  storage: 'Storage',
  users: 'Users',
  projects: 'Projects',
  api: 'API',
  support: 'Support',
  integrations: 'Integrations',
  analytics: 'Analytics',
  security: 'Security',
  customization: 'Customization'
};

const billingCycleLabels = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  lifetime: 'Lifetime'
};

export default function SaaSPlanCreator() {
  const router = useRouter();
  const { user, appUser, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [planData, setPlanData] = useState<SaaSPlanData>({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    billingCycle: 'monthly',
    status: 'draft',
    sortOrder: 0,
    isPopular: false,
    trialDays: 0,
    setupFee: 0,
    features: [],
    metadata: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (loading) return;
    
    if (!user || appUser?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, appUser, loading, router]);

  const addFeature = (template: FeatureTemplate) => {
    const existingFeature = planData.features.find(f => f.featureId === template.id);
    if (existingFeature) {
      toast({
        title: "Feature Already Added",
        description: `${template.name} is already in the plan`,
        variant: "destructive"
      });
      return;
    }

    const newFeature: PlanFeature = {
      id: Date.now().toString(),
      featureId: template.id,
      name: template.name,
      description: template.description,
      value: template.defaultValue,
      isUnlimited: false,
      isVisible: true,
      unit: template.unit
    };

    setPlanData(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));

    toast({
      title: "Feature Added",
      description: `${template.name} has been added to the plan`,
    });
  };

  const removeFeature = (featureId: string) => {
    setPlanData(prev => ({
      ...prev,
      features: prev.features.filter(f => f.id !== featureId)
    }));
  };

  const updateFeature = (featureId: string, updates: Partial<PlanFeature>) => {
    setPlanData(prev => ({
      ...prev,
      features: prev.features.map(f => 
        f.id === featureId ? { ...f, ...updates } : f
      )
    }));
  };

  const savePlan = async () => {
    if (!planData.name || !planData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Plan Saved",
        description: `${planData.name} has been saved successfully`,
      });
      
      // Redirect to plans manager
      setTimeout(() => {
        router.push('/admin/saas-plans');
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save plan",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const duplicateFromTemplate = (templateName: string) => {
    const templates = {
      starter: {
        name: 'Starter Plan',
        description: 'Perfect for individuals and small teams getting started',
        price: 29,
        features: ['users', 'storage', 'projects', 'priority_support']
      },
      professional: {
        name: 'Professional Plan',
        description: 'Ideal for growing businesses with advanced needs',
        price: 79,
        features: ['users', 'storage', 'projects', 'api_access', 'api_calls', 'priority_support', 'advanced_analytics']
      },
      enterprise: {
        name: 'Enterprise Plan',
        description: 'Custom solution for large organizations',
        price: 299,
        features: ['users', 'storage', 'projects', 'api_access', 'api_calls', '24_7_support', 'custom_integrations', 'advanced_analytics', 'white_label', 'custom_domain', 'ssl_certificate']
      }
    };

    const template = templates[templateName as keyof typeof templates];
    if (template) {
      const features = template.features.map(featureId => {
        const templateFeature = featureTemplates.find(t => t.id === featureId);
        return {
          id: Date.now().toString() + Math.random(),
          featureId,
          name: templateFeature?.name || '',
          description: templateFeature?.description || '',
          value: templateFeature?.defaultValue,
          isUnlimited: false,
          isVisible: true,
          unit: templateFeature?.unit
        } as PlanFeature;
      });

      setPlanData(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        price: template.price,
        features
      }));

      toast({
        title: "Template Applied",
        description: `${template.name} template has been applied`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SAAS Plan Creator...</p>
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
              You don't have permission to access the SAAS plan creator.
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
              <h1 className="text-3xl font-bold text-gray-900">Advanced SAAS Plan Creator</h1>
              <p className="text-gray-600 mt-2">Create sophisticated subscription plans with advanced features</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                {previewMode ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/saas-plans')}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={savePlan} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Plan'}
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Information</CardTitle>
                  <CardDescription>Basic information about your subscription plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="plan-name">Plan Name *</Label>
                    <Input
                      id="plan-name"
                      placeholder="Enter plan name"
                      value={planData.name}
                      onChange={(e) => setPlanData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan-description">Description *</Label>
                    <Textarea
                      id="plan-description"
                      placeholder="Describe your plan"
                      value={planData.description}
                      onChange={(e) => setPlanData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan-status">Status</Label>
                    <Select value={planData.status} onValueChange={(value) => setPlanData(prev => ({ ...prev, status: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Templates</CardTitle>
                  <CardDescription>Start with a pre-configured template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => duplicateFromTemplate('starter')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Starter Plan Template
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => duplicateFromTemplate('professional')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Professional Plan Template
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => duplicateFromTemplate('enterprise')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Enterprise Plan Template
                    </Button>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Quick Start</p>
                        <p>Templates provide a starting point that you can customize to your needs.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Features</CardTitle>
                    <CardDescription>Add features to your plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(categoryLabels).map(([category, label]) => {
                        const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
                        const categoryFeatures = featureTemplates.filter(f => f.category === category);
                        
                        return (
                          <Accordion key={category} type="single" collapsible>
                            <AccordionItem value={category}>
                              <AccordionTrigger className="text-sm">
                                <div className="flex items-center gap-2">
                                  <CategoryIcon className="w-4 h-4" />
                                  {label}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {categoryFeatures.map(feature => (
                                    <Button
                                      key={feature.id}
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-left"
                                      onClick={() => addFeature(feature)}
                                    >
                                      <Plus className="w-3 h-3 mr-2" />
                                      <div>
                                        <div className="font-medium">{feature.name}</div>
                                        <div className="text-xs text-gray-500">{feature.description}</div>
                                      </div>
                                    </Button>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Features</CardTitle>
                    <CardDescription>Configure features for your plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {planData.features.length === 0 ? (
                      <div className="text-center py-12">
                        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No features added</h3>
                        <p className="text-gray-500 mb-4">
                          Add features from the available features panel.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {planData.features.map(feature => {
                          const template = featureTemplates.find(t => t.id === feature.featureId);
                          return (
                            <div key={feature.id} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium">{feature.name}</h4>
                                  <p className="text-sm text-gray-600">{feature.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={feature.isVisible}
                                    onCheckedChange={(checked) => updateFeature(feature.id, { isVisible: checked })}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFeature(feature.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {template && template.type !== 'boolean' && (
                                <div className="flex items-center gap-4">
                                  {template.type === 'numeric' && (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <Switch
                                          checked={feature.isUnlimited}
                                          onCheckedChange={(checked) => updateFeature(feature.id, { isUnlimited: checked })}
                                        />
                                        <span className="text-sm">Unlimited</span>
                                      </div>
                                      {!feature.isUnlimited && (
                                        <div className="flex items-center gap-2">
                                          <Input
                                            type="number"
                                            value={feature.value}
                                            onChange={(e) => updateFeature(feature.id, { value: parseFloat(e.target.value) || 0 })}
                                            className="w-24"
                                          />
                                          <span className="text-sm text-gray-500">{feature.unit}</span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                  
                                  {template.type === 'select' && template.options && (
                                    <Select value={feature.value} onValueChange={(value) => updateFeature(feature.id, { value })}>
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {template.options.map(option => (
                                          <SelectItem key={option} value={option}>
                                            {option}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Configuration</CardTitle>
                  <CardDescription>Set pricing and billing options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="plan-price">Price *</Label>
                    <div className="flex items-center gap-2">
                      <Select value={planData.currency} onValueChange={(value) => setPlanData(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="plan-price"
                        type="number"
                        placeholder="0.00"
                        value={planData.price}
                        onChange={(e) => setPlanData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="billing-cycle">Billing Cycle</Label>
                    <Select value={planData.billingCycle} onValueChange={(value) => setPlanData(prev => ({ ...prev, billingCycle: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(billingCycleLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="setup-fee">Setup Fee</Label>
                    <div className="flex items-center gap-2">
                      <Select value={planData.currency} onValueChange={(value) => setPlanData(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="setup-fee"
                        type="number"
                        placeholder="0.00"
                        value={planData.setupFee}
                        onChange={(e) => setPlanData(prev => ({ ...prev, setupFee: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="trial-days">Trial Period (Days)</Label>
                    <Input
                      id="trial-days"
                      type="number"
                      placeholder="0"
                      value={planData.trialDays}
                      onChange={(e) => setPlanData(prev => ({ ...prev, trialDays: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display Settings</CardTitle>
                  <CardDescription>Configure how the plan appears to users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Popular Plan</Label>
                      <p className="text-sm text-gray-500">Highlight as most popular</p>
                    </div>
                    <Switch
                      checked={planData.isPopular}
                      onCheckedChange={(checked) => setPlanData(prev => ({ ...prev, isPopular: checked }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sort-order">Sort Order</Label>
                    <Input
                      id="sort-order"
                      type="number"
                      placeholder="0"
                      value={planData.sortOrder}
                      onChange={(e) => setPlanData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium">Pricing Preview</p>
                        <p>Monthly: ${planData.price} {planData.currency}</p>
                        {planData.setupFee > 0 && <p>Setup: ${planData.setupFee} {planData.currency}</p>}
                        {planData.trialDays > 0 && <p>Trial: {planData.trialDays} days</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Additional configuration options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="metadata">Additional Metadata</Label>
                      <Textarea
                        id="metadata"
                        placeholder="JSON metadata for additional configuration"
                        value={JSON.stringify(planData.metadata, null, 2)}
                        onChange={(e) => {
                          try {
                            const metadata = JSON.parse(e.target.value);
                            setPlanData(prev => ({ ...prev, metadata }));
                          } catch {
                            // Invalid JSON, ignore
                          }
                        }}
                        rows={8}
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter valid JSON format</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Plan Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {planData.name || 'Not set'}</div>
                        <div><strong>Features:</strong> {planData.features.length}</div>
                        <div><strong>Price:</strong> ${planData.price} {planData.currency}/{billingCycleLabels[planData.billingCycle].toLowerCase()}</div>
                        <div><strong>Status:</strong> {planData.status}</div>
                        <div><strong>Popular:</strong> {planData.isPopular ? 'Yes' : 'No'}</div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Feature Summary</h4>
                      <div className="space-y-1 text-sm">
                        {planData.features.slice(0, 5).map(feature => (
                          <div key={feature.id} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {feature.name}
                          </div>
                        ))}
                        {planData.features.length > 5 && (
                          <div className="text-gray-500">
                            +{planData.features.length - 5} more features
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}