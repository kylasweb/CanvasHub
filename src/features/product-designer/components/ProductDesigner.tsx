'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  LayoutTemplate, 
  ShoppingCart, 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Image as ImageIcon,
  Type,
  Layers,
  Settings,
  DollarSign,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { ProductDesignerService } from '../services/product-designer-service';
import { ProductTemplate, ProductDesign, ProductOrder, DesignAnalytics } from '../types/product-designer';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductDesigner() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [designs, setDesigns] = useState<ProductDesign[]>([]);
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [analytics, setAnalytics] = useState<DesignAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ProductTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDesignDialog, setShowDesignDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'album' as const,
    price: '',
    dimensions: {
      width: '',
      height: '',
      unit: 'in' as const
    }
  });

  useEffect(() => {
    if (user?.tenantId) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.tenantId) return;
    try {
      setLoading(true);
      const [templateList, designList, orderList] = await Promise.all([
        ProductDesignerService.getTemplatesByTenant(user.tenantId),
        ProductDesignerService.getDesignsByClient(user.tenantId), // Using tenantId as client_id for demo
        ProductDesignerService.getOrdersByClient(user.tenantId)
      ]);
      
      setTemplates(templateList);
      setDesigns(designList);
      setOrders(orderList);

      // Load analytics for templates
      const analyticsList = await Promise.all(
        templateList.map(template => ProductDesignerService.getTemplateAnalytics(template.id))
      );
      setAnalytics(analyticsList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!user?.tenantId) return;
    try {
      await ProductDesignerService.createTemplate({
        tenant_id: user.tenantId,
        name: newTemplate.name,
        description: newTemplate.description,
        category: newTemplate.category,
        thumbnail_url: '',
        preview_url: '',
        dimensions: {
          width: parseFloat(newTemplate.dimensions.width),
          height: parseFloat(newTemplate.dimensions.height),
          unit: newTemplate.dimensions.unit
        },
        price: parseFloat(newTemplate.price),
        is_active: true,
        settings: {
          allow_custom_layout: true,
          min_photos: 1,
          max_photos: 50,
          default_spacing: 10,
          default_margins: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
          },
          available_customizations: []
        }
      });

      setNewTemplate({
        name: '',
        description: '',
        category: 'album',
        price: '',
        dimensions: {
          width: '',
          height: '',
          unit: 'in'
        }
      });
      setShowCreateDialog(false);
      loadData();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleCreateDesign = async () => {
    if (!selectedTemplate || !user?.tenantId) return;
    try {
      const layout = ProductDesignerService.createDefaultLayout(12); // Default 12 photos
      await ProductDesignerService.createDesign({
        tenant_id: user.tenantId,
        template_id: selectedTemplate.id,
        client_id: user.tenantId,
        name: `New ${selectedTemplate.name} Design`,
        photos: [],
        layout,
        customizations: [],
        status: 'draft',
        price: selectedTemplate.price,
        quantity: 1
      });

      setShowDesignDialog(false);
      loadData();
    } catch (error) {
      console.error('Error creating design:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'album': return <Package className="h-4 w-4" />;
      case 'print': return <ImageIcon className="h-4 w-4" />;
      case 'merchandise': return <ShoppingCart className="h-4 w-4" />;
      case 'digital': return <Download className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'draft': 'outline',
      'pending_review': 'secondary',
      'approved': 'default',
      'in_production': 'secondary',
      'completed': 'default',
      'cart': 'outline',
      'pending_payment': 'secondary',
      'processing': 'secondary',
      'shipped': 'default',
      'delivered': 'default',
      'cancelled': 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product designer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Designer</h1>
          <p className="text-muted-foreground">
            Create and manage custom photo products
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a new product template for your clients
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="col-span-1">Name</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="col-span-1">Description</Label>
                  <Textarea
                    id="description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="col-span-1">Category</Label>
                  <Select value={newTemplate.category} onValueChange={(value: any) => setNewTemplate({...newTemplate, category: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="album">Album</SelectItem>
                      <SelectItem value="print">Print</SelectItem>
                      <SelectItem value="merchandise">Merchandise</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="col-span-1">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newTemplate.price}
                    onChange={(e) => setNewTemplate({...newTemplate, price: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="width" className="col-span-1">Width</Label>
                  <div className="col-span-2 flex gap-2">
                    <Input
                      id="width"
                      type="number"
                      value={newTemplate.dimensions.width}
                      onChange={(e) => setNewTemplate({
                        ...newTemplate,
                        dimensions: {...newTemplate.dimensions, width: e.target.value}
                      })}
                    />
                    <Select value={newTemplate.dimensions.unit} onValueChange={(value: any) => setNewTemplate({
                      ...newTemplate,
                      dimensions: {...newTemplate.dimensions, unit: value}
                    })}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">in</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="mm">mm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="height" className="col-span-1">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={newTemplate.dimensions.height}
                    onChange={(e) => setNewTemplate({
                      ...newTemplate,
                      dimensions: {...newTemplate.dimensions, height: e.target.value}
                    })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateTemplate}>Create Template</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showDesignDialog} onOpenChange={setShowDesignDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <LayoutTemplate className="mr-2 h-4 w-4" />
                New Design
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Design</DialogTitle>
                <DialogDescription>
                  Select a template to start designing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Template</Label>
                  <Select onValueChange={(value) => {
                    const template = templates.find(t => t.id === value);
                    setSelectedTemplate(template || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} - ${template.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedTemplate && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{selectedTemplate.name}</CardTitle>
                      <CardDescription className="text-xs">{selectedTemplate.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center text-xs">
                        <span>{selectedTemplate.dimensions.width}x{selectedTemplate.dimensions.height} {selectedTemplate.dimensions.unit}</span>
                        <Badge variant="secondary">${selectedTemplate.price}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleCreateDesign} disabled={!selectedTemplate}>
                  Create Design
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="designs">Designs</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge variant={template.is_active ? "default" : "destructive"}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Dimensions</span>
                      <span>{template.dimensions.width}x{template.dimensions.height} {template.dimensions.unit}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold">${template.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="outline" className="capitalize">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="designs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {designs.map(design => {
              const template = templates.find(t => t.id === design.template_id);
              return (
                <Card key={design.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{design.name}</CardTitle>
                      {getStatusBadge(design.status)}
                    </div>
                    <CardDescription>
                      {template?.name} • {design.photos.length} photos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-semibold">${design.price}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Quantity</span>
                        <span>{design.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold">${(design.price * design.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4">
            {orders.map(order => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                      <CardDescription>
                        {new Date(order.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Amount</div>
                      <div className="font-semibold">${order.total_price.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Payment</div>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>
                    {order.tracking_number && (
                      <div className="md:col-span-2">
                        <div className="text-sm text-muted-foreground">Tracking</div>
                        <div className="font-mono text-sm">{order.tracking_number}</div>
                      </div>
                    )}
                    {order.estimated_delivery && (
                      <div>
                        <div className="text-sm text-muted-foreground">Delivery</div>
                        <div className="text-sm">{new Date(order.estimated_delivery).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analytics.map((analytic, index) => {
              const template = templates[index];
              return (
                <Card key={analytic.template_id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{template?.name}</CardTitle>
                    <CardDescription>Template Performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Designs</span>
                        <span className="font-semibold">{analytic.total_designs}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Completed Orders</span>
                        <span className="font-semibold">{analytic.completed_orders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Revenue</span>
                        <span className="font-semibold">${analytic.total_revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}