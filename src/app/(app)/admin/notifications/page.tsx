'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Bell, 
  Send, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Search, 
  Filter,
  RefreshCw,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare as Sms,
  Webhook,
  Slack,
  Database,
  CreditCard,
  Settings,
  Calendar,
  Tag,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'email' | 'sms' | 'webhook' | 'slack' | 'in_app';
  targetAudience: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  createdBy: string;
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'webhook' | 'slack';
  category: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  slackEnabled: boolean;
  webhookEnabled: boolean;
  inAppEnabled: boolean;
  emailFrom: string;
  smsFrom: string;
  slackWebhook: string;
  webhookUrl: string;
  defaultChannel: string;
  rateLimit: number;
}

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [activeTab, setActiveTab] = useState('notifications');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data for demonstration
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'System Maintenance Scheduled',
      message: 'We will be performing scheduled maintenance on January 20, 2024, from 2:00 AM to 4:00 AM EST.',
      type: 'info',
      priority: 'medium',
      channel: 'email',
      targetAudience: 'all_users',
      status: 'sent',
      sentAt: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-15T09:00:00Z',
      createdBy: 'John Smith',
      recipients: 15420,
      delivered: 15234,
      opened: 12456,
      clicked: 8234
    },
    {
      id: '2',
      title: 'Payment Processing Issue',
      message: 'Some payment transactions are experiencing delays. Our team is investigating the issue.',
      type: 'warning',
      priority: 'high',
      channel: 'email',
      targetAudience: 'affected_users',
      status: 'sent',
      sentAt: '2024-01-14T15:45:00Z',
      createdAt: '2024-01-14T15:30:00Z',
      createdBy: 'Sarah Johnson',
      recipients: 342,
      delivered: 342,
      opened: 298,
      clicked: 156
    },
    {
      id: '3',
      title: 'New Feature Launch',
      message: 'Exciting new features have been added to your dashboard. Check them out now!',
      type: 'success',
      priority: 'low',
      channel: 'in_app',
      targetAudience: 'all_users',
      status: 'sent',
      sentAt: '2024-01-13T12:00:00Z',
      createdAt: '2024-01-13T11:00:00Z',
      createdBy: 'Mike Chen',
      recipients: 15420,
      delivered: 15420,
      opened: 8934,
      clicked: 5678
    },
    {
      id: '4',
      title: 'Security Alert',
      message: 'Unusual login activity detected on your account. Please review your recent login attempts.',
      type: 'error',
      priority: 'urgent',
      channel: 'email',
      targetAudience: 'security_alert_users',
      status: 'sent',
      sentAt: '2024-01-12T08:30:00Z',
      createdAt: '2024-01-12T08:15:00Z',
      createdBy: 'System',
      recipients: 45,
      delivered: 45,
      opened: 42,
      clicked: 38
    },
    {
      id: '5',
      title: 'Weekly Report Ready',
      message: 'Your weekly analytics report is now available for download.',
      type: 'info',
      priority: 'low',
      channel: 'email',
      targetAudience: 'premium_users',
      status: 'scheduled',
      scheduledAt: '2024-01-20T09:00:00Z',
      createdAt: '2024-01-15T16:00:00Z',
      createdBy: 'Emma Davis',
      recipients: 2341,
      delivered: 0,
      opened: 0,
      clicked: 0
    }
  ];

  const mockTemplates: NotificationTemplate[] = [
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to Canvas Hub!',
      content: 'Hi {{name}}, welcome to Canvas Hub! We\'re excited to have you on board.',
      type: 'email',
      category: 'user_onboarding',
      variables: ['name'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-10T12:00:00Z'
    },
    {
      id: '2',
      name: 'Password Reset',
      subject: 'Reset Your Password',
      content: 'Hi {{name}}, click here to reset your password: {{reset_link}}',
      type: 'email',
      category: 'security',
      variables: ['name', 'reset_link'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-05T14:30:00Z'
    },
    {
      id: '3',
      name: 'Payment Failed',
      subject: 'Payment Failed',
      content: 'Hi {{name}}, your payment of {{amount}} has failed. Please update your payment method.',
      type: 'email',
      category: 'billing',
      variables: ['name', 'amount'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-08T10:15:00Z'
    }
  ];

  const mockSettings: NotificationSettings = {
    emailEnabled: true,
    smsEnabled: false,
    slackEnabled: true,
    webhookEnabled: true,
    inAppEnabled: true,
    emailFrom: 'noreply@canvashub.com',
    smsFrom: '+1234567890',
    slackWebhook: 'https://hooks.slack.com/services/...',
    webhookUrl: 'https://api.canvashub.com/webhooks/notifications',
    defaultChannel: 'email',
    rateLimit: 100
  };

  useEffect(() => {
    fetchNotificationsData();
  }, []);

  const fetchNotificationsData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotifications(mockNotifications);
      setTemplates(mockTemplates);
      setSettings(mockSettings);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notifications data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Sms className="w-4 h-4" />;
      case 'webhook': return <Webhook className="w-4 h-4" />;
      case 'slack': return <Slack className="w-4 h-4" />;
      case 'in_app': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const calculateRate = (delivered: number, recipients: number) => {
    return recipients > 0 ? ((delivered / recipients) * 100).toFixed(1) : '0';
  };

  const handleSendNotification = async () => {
    toast({
      title: "Notification Sent",
      description: "Notification has been sent successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Manage system notifications, templates, and delivery settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
                <DialogDescription>
                  Create and send a new notification to users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="notification-title">Title</Label>
                    <Input id="notification-title" placeholder="Enter notification title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notification-type">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-message">Message</Label>
                  <Textarea id="notification-message" placeholder="Enter notification message" rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="notification-priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notification-channel">Channel</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="in_app">In-App</SelectItem>
                        <SelectItem value="slack">Slack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-audience">Target Audience</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="premium_users">Premium Users</SelectItem>
                      <SelectItem value="active_users">Active Users</SelectItem>
                      <SelectItem value="inactive_users">Inactive Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendNotification}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={fetchNotificationsData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                View and manage all sent and scheduled notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {notification.message}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTypeColor(notification.type)}>
                            {notification.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getChannelIcon(notification.channel)}
                            <span className="capitalize">{notification.channel.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Delivery: {calculateRate(notification.delivered, notification.recipients)}%</div>
                            <div>Open: {calculateRate(notification.opened, notification.recipients)}%</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {notification.sentAt ? formatTimestamp(notification.sentAt) : 
                             notification.scheduledAt ? `Scheduled: ${formatTimestamp(notification.scheduledAt)}` : 
                             'Not sent'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Notification Templates
              </CardTitle>
              <CardDescription>
                Manage email and notification templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline">{template.type}</Badge>
                        <Badge variant="secondary">{template.category}</Badge>
                        {template.isActive && <Badge className="bg-green-100 text-green-800">Active</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                      <p className="text-sm text-gray-500 mt-1">{template.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Variables:</span>
                        {template.variables.map((variable, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {settings && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure notification channels and delivery settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Channel Settings</h3>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.emailEnabled}
                        onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, emailEnabled: checked } : prev)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                      </div>
                      <Switch
                        checked={settings.smsEnabled}
                        onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, smsEnabled: checked } : prev)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label>Slack Integration</Label>
                        <p className="text-sm text-muted-foreground">Send notifications to Slack</p>
                      </div>
                      <Switch
                        checked={settings.slackEnabled}
                        onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, slackEnabled: checked } : prev)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label>Webhook Integration</Label>
                        <p className="text-sm text-muted-foreground">Send notifications via webhooks</p>
                      </div>
                      <Switch
                        checked={settings.webhookEnabled}
                        onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, webhookEnabled: checked } : prev)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label>In-App Notifications</Label>
                        <p className="text-sm text-muted-foreground">Show notifications within the app</p>
                      </div>
                      <Switch
                        checked={settings.inAppEnabled}
                        onCheckedChange={(checked) => setSettings(prev => prev ? { ...prev, inAppEnabled: checked } : prev)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Configuration</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email-from">Email From Address</Label>
                      <Input
                        id="email-from"
                        value={settings.emailFrom}
                        onChange={(e) => setSettings(prev => prev ? { ...prev, emailFrom: e.target.value } : prev)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sms-from">SMS From Number</Label>
                      <Input
                        id="sms-from"
                        value={settings.smsFrom}
                        onChange={(e) => setSettings(prev => prev ? { ...prev, smsFrom: e.target.value } : prev)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                      <Input
                        id="slack-webhook"
                        value={settings.slackWebhook}
                        onChange={(e) => setSettings(prev => prev ? { ...prev, slackWebhook: e.target.value } : prev)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">Default Webhook URL</Label>
                      <Input
                        id="webhook-url"
                        value={settings.webhookUrl}
                        onChange={(e) => setSettings(prev => prev ? { ...prev, webhookUrl: e.target.value } : prev)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default-channel">Default Channel</Label>
                      <Select value={settings.defaultChannel} onValueChange={(value) => setSettings(prev => prev ? { ...prev, defaultChannel: value } : prev)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="in_app">In-App</SelectItem>
                          <SelectItem value="slack">Slack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rate-limit">Rate Limit (per minute)</Label>
                      <Input
                        id="rate-limit"
                        type="number"
                        value={settings.rateLimit}
                        onChange={(e) => setSettings(prev => prev ? { ...prev, rateLimit: parseInt(e.target.value) } : prev)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}