'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Bell, 
  Database, 
  Users,
  Mail,
  Globe,
  CreditCard,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Upload,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailVerification: boolean;
  defaultUserRole: string;
  sessionTimeout: number;
  maxUploadSize: number;
  allowedFileTypes: string[];
  currency: string;
  timezone: string;
  language: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  encryption: string;
}

interface PaymentSettings {
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  paypalClientId: string;
  paypalClientSecret: string;
  currency: string;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'Canvas Hub',
    siteUrl: 'https://canvashub.com',
    adminEmail: 'admin@canvashub.com',
    maintenanceMode: false,
    allowRegistration: true,
    emailVerification: true,
    defaultUserRole: 'USER',
    sessionTimeout: 3600,
    maxUploadSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    currency: 'USD',
    timezone: 'UTC',
    language: 'en'
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@canvashub.com',
    fromName: 'Canvas Hub',
    encryption: 'tls'
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    paypalClientId: '',
    paypalClientSecret: '',
    currency: 'USD'
  });

  const handleSaveSettings = async (section: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: `${section} settings have been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Email Test Sent",
        description: "Test email has been sent to your admin email address.",
      });
    } catch (error) {
      toast({
        title: "Email Test Failed",
        description: "Failed to send test email. Please check your email settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportSettings = () => {
    const settings = {
      system: systemSettings,
      email: emailSettings,
      payment: paymentSettings
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Settings Exported",
      description: "Settings have been exported successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="w-4 h-4 mr-2" />
            Export Settings
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alert for Maintenance Mode */}
      {systemSettings.maintenanceMode && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Maintenance Mode Active</AlertTitle>
          <AlertDescription>
            The site is currently in maintenance mode. Only administrators can access the site.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic site configuration and general settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={systemSettings.siteName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-url">Site URL</Label>
                  <Input
                    id="site-url"
                    value={systemSettings.siteUrl}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={systemSettings.adminEmail}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={systemSettings.language} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to temporarily disable the site for non-admin users
                  </p>
                </div>
                <Switch
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Allow User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register on the platform
                  </p>
                </div>
                <Switch
                  checked={systemSettings.allowRegistration}
                  onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, allowRegistration: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require email verification for new user registrations
                  </p>
                </div>
                <Switch
                  checked={systemSettings.emailVerification}
                  onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, emailVerification: checked }))}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('General')} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure email settings for system notifications and user communications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">SMTP Username</Label>
                  <Input
                    id="smtp-username"
                    value={emailSettings.smtpUsername}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">SMTP Password</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="encryption">Encryption</Label>
                <Select value={emailSettings.encryption} onValueChange={(value) => setEmailSettings(prev => ({ ...prev, encryption: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <Button onClick={() => handleSaveSettings('Email')} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Email Settings
                </Button>
                <Button variant="outline" onClick={handleTestEmail} disabled={loading}>
                  <Mail className="w-4 h-4 mr-2" />
                  Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Configuration
              </CardTitle>
              <CardDescription>
                Configure payment processors and billing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Stripe Configuration</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripe-public">Publishable Key</Label>
                    <Input
                      id="stripe-public"
                      value={paymentSettings.stripePublicKey}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-secret">Secret Key</Label>
                    <Input
                      id="stripe-secret"
                      type="password"
                      value={paymentSettings.stripeSecretKey}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-webhook">Webhook Secret</Label>
                    <Input
                      id="stripe-webhook"
                      type="password"
                      value={paymentSettings.stripeWebhookSecret}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeWebhookSecret: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">PayPal Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paypal-client">Client ID</Label>
                    <Input
                      id="paypal-client"
                      value={paymentSettings.paypalClientId}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalClientId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paypal-secret">Client Secret</Label>
                    <Input
                      id="paypal-secret"
                      type="password"
                      value={paymentSettings.paypalClientSecret}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalClientSecret: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('Payment')} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Payment Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security options and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (seconds)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-upload">Max Upload Size (MB)</Label>
                  <Input
                    id="max-upload"
                    type="number"
                    value={systemSettings.maxUploadSize}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxUploadSize: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-role">Default User Role</Label>
                <Select value={systemSettings.defaultUserRole} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, defaultUserRole: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Allowed File Types</Label>
                <div className="flex flex-wrap gap-2">
                  {systemSettings.allowedFileTypes.map((type, index) => (
                    <Badge key={index} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('Security')} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}