"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Globe,
  Mail,
  Phone,
  MapPin,
  Camera,
  Download,
  Upload,
  Save,
  RefreshCw,
  Trash2,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  // Profile settings
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Canvas Hub',
    website: 'https://canvashub.com',
    bio: 'Professional photographer and designer with 10+ years of experience.',
    address: '123 Main St, City, State 12345',
    timezone: 'America/New_York',
    language: 'en'
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    desktop: true,
    newClient: true,
    projectUpdates: true,
    invoicePaid: true,
    systemAlerts: true,
    marketingEmails: false
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: 30,
    loginAlerts: true,
    passwordExpiry: 90,
    allowedIPs: '',
    apiKeys: [] as string[]
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    accentColor: 'blue',
    fontSize: 'medium',
    sidebarCollapsed: false,
    denseMode: false,
    animations: true
  });

  // System settings
  const [system, setSystem] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: 30,
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info'
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notifications Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Security Settings Updated",
      description: "Your security settings have been saved.",
    });
  };

  const handleSaveAppearance = () => {
    toast({
      title: "Appearance Updated",
      description: "Your appearance settings have been saved.",
    });
  };

  const handleSaveSystem = () => {
    toast({
      title: "System Settings Updated",
      description: "Your system settings have been saved.",
    });
  };

  const generateAPIKey = () => {
    const newKey = `chk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setSecurity(prev => ({
      ...prev,
      apiKeys: [...prev.apiKeys, newKey]
    }));
    toast({
      title: "API Key Generated",
      description: "New API key has been created successfully.",
    });
  };

  const deleteAPIKey = (key: string) => {
    setSecurity(prev => ({
      ...prev,
      apiKeys: prev.apiKeys.filter(k => k !== key)
    }));
    toast({
      title: "API Key Deleted",
      description: "API key has been removed successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and system configuration
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile({...profile, company: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => setProfile({...profile, website: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={profile.timezone} onValueChange={(value) => setProfile({...profile, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Channels</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive text message alerts</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Desktop Notifications</Label>
                      <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                    </div>
                    <Switch
                      checked={notifications.desktop}
                      onCheckedChange={(checked) => setNotifications({...notifications, desktop: checked})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Types</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Client Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notify when new clients register</p>
                    </div>
                    <Switch
                      checked={notifications.newClient}
                      onCheckedChange={(checked) => setNotifications({...notifications, newClient: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Project Updates</Label>
                      <p className="text-sm text-muted-foreground">Notify about project changes</p>
                    </div>
                    <Switch
                      checked={notifications.projectUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, projectUpdates: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Invoice Payments</Label>
                      <p className="text-sm text-muted-foreground">Notify when invoices are paid</p>
                    </div>
                    <Switch
                      checked={notifications.invoicePaid}
                      onCheckedChange={(checked) => setNotifications({...notifications, invoicePaid: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <p className="text-sm text-muted-foreground">Critical system notifications</p>
                    </div>
                    <Switch
                      checked={notifications.systemAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, systemAlerts: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Product updates and news</p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => setNotifications({...notifications, marketingEmails: checked})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveNotifications}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Authentication</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch
                      checked={security.twoFactor}
                      onCheckedChange={(checked) => setSecurity({...security, twoFactor: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified on new logins</p>
                    </div>
                    <Switch
                      checked={security.loginAlerts}
                      onCheckedChange={(checked) => setSecurity({...security, loginAlerts: checked})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Session Management</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Select value={security.sessionTimeout.toString()} onValueChange={(value) => setSecurity({...security, sessionTimeout: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Select value={security.passwordExpiry.toString()} onValueChange={(value) => setSecurity({...security, passwordExpiry: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">API Keys</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Manage your API access keys</p>
                    <Button onClick={generateAPIKey}>
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Key
                    </Button>
                  </div>
                  {security.apiKeys.length > 0 ? (
                    <div className="space-y-2">
                      {security.apiKeys.map((key, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <p className="font-mono text-sm">{key}</p>
                            <p className="text-xs text-muted-foreground">Created just now</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAPIKey(key)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No API keys generated yet</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveSecurity}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="theme">Theme Mode</Label>
                    <Select value={appearance.theme} onValueChange={(value) => setAppearance({...appearance, theme: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <Select value={appearance.accentColor} onValueChange={(value) => setAppearance({...appearance, accentColor: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Layout</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Collapsed Sidebar</Label>
                      <p className="text-sm text-muted-foreground">Start with sidebar collapsed</p>
                    </div>
                    <Switch
                      checked={appearance.sidebarCollapsed}
                      onCheckedChange={(checked) => setAppearance({...appearance, sidebarCollapsed: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dense Mode</Label>
                      <p className="text-sm text-muted-foreground">Use compact layout</p>
                    </div>
                    <Switch
                      checked={appearance.denseMode}
                      onCheckedChange={(checked) => setAppearance({...appearance, denseMode: checked})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Typography</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Select value={appearance.fontSize} onValueChange={(value) => setAppearance({...appearance, fontSize: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Effects</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Animations</Label>
                      <p className="text-sm text-muted-foreground">Enable UI animations</p>
                    </div>
                    <Switch
                      checked={appearance.animations}
                      onCheckedChange={(checked) => setAppearance({...appearance, animations: checked})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveAppearance}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Manage system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Backup & Recovery</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Backup</Label>
                      <p className="text-sm text-muted-foreground">Enable automatic system backups</p>
                    </div>
                    <Switch
                      checked={system.autoBackup}
                      onCheckedChange={(checked) => setSystem({...system, autoBackup: checked})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select value={system.backupFrequency} onValueChange={(value) => setSystem({...system, backupFrequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
                    <Select value={system.retentionPeriod.toString()} onValueChange={(value) => setSystem({...system, retentionPeriod: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Mode</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Put system in maintenance mode</p>
                    </div>
                    <Switch
                      checked={system.maintenanceMode}
                      onCheckedChange={(checked) => setSystem({...system, maintenanceMode: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable debug logging</p>
                    </div>
                    <Switch
                      checked={system.debugMode}
                      onCheckedChange={(checked) => setSystem({...system, debugMode: checked})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Logging</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="logLevel">Log Level</Label>
                    <Select value={system.logLevel} onValueChange={(value) => setSystem({...system, logLevel: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveSystem}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}