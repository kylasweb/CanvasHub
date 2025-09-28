'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Shield, 
  Lock, 
  Key, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Users,
  Globe,
  Database,
  Wifi,
  Fingerprint,
  Smartphone,
  Mail,
  RefreshCw,
  Settings,
  Activity,
  Ban,
  ShieldAlert,
  ShieldCheck,
  Clock,
  MapPin,
  Monitor
} from 'lucide-react'

interface SecurityAlert {
  id: string
  type: 'warning' | 'critical' | 'info'
  title: string
  description: string
  timestamp: string
  source: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  isResolved: boolean
  resolvedAt?: string
  resolvedBy?: string
}

interface SecurityMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'critical'
  description: string
  trend: 'up' | 'down' | 'stable'
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  passwordExpiry: number
  ipWhitelist: string[]
  suspiciousActivityDetection: boolean
  emailNotifications: boolean
  auditLogging: boolean
  dataEncryption: boolean
  apiRateLimiting: boolean
  firewallEnabled: boolean
  malwareProtection: boolean
}

interface LoginAttempt {
  id: string
  timestamp: string
  username: string
  ipAddress: string
  location: string
  device: string
  status: 'success' | 'failed'
  reason?: string
  riskScore: number
}

const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Multiple Failed Login Attempts',
    description: 'Detected 10 failed login attempts from IP 192.168.1.100 within 5 minutes',
    timestamp: '2024-01-20T14:30:00Z',
    source: 'auth-system',
    severity: 'high',
    isResolved: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Unusual Access Pattern',
    description: 'User account accessed from 3 different countries within 24 hours',
    timestamp: '2024-01-20T13:45:00Z',
    source: 'behavioral-analysis',
    severity: 'medium',
    isResolved: false
  },
  {
    id: '3',
    type: 'info',
    title: 'Password Policy Update',
    description: 'System password policy has been updated to require 12 characters',
    timestamp: '2024-01-20T12:00:00Z',
    source: 'admin-action',
    severity: 'low',
    isResolved: true,
    resolvedAt: '2024-01-20T12:05:00Z',
    resolvedBy: 'admin'
  }
]

const mockSecurityMetrics: SecurityMetric[] = [
  {
    id: '1',
    name: 'Failed Login Attempts',
    value: 234,
    unit: 'attempts',
    status: 'warning',
    description: 'Failed login attempts in last 24 hours',
    trend: 'up'
  },
  {
    id: '2',
    name: 'Blocked IPs',
    value: 45,
    unit: 'IPs',
    status: 'good',
    description: 'Currently blocked IP addresses',
    trend: 'stable'
  },
  {
    id: '3',
    name: 'Security Score',
    value: 87,
    unit: '%',
    status: 'good',
    description: 'Overall security health score',
    trend: 'up'
  },
  {
    id: '4',
    name: 'Vulnerabilities',
    value: 3,
    unit: 'issues',
    status: 'critical',
    description: 'Unresolved security vulnerabilities',
    trend: 'down'
  }
]

const mockSecuritySettings: SecuritySettings = {
  twoFactorAuth: true,
  sessionTimeout: 3600,
  maxLoginAttempts: 5,
  passwordExpiry: 90,
  ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
  suspiciousActivityDetection: true,
  emailNotifications: true,
  auditLogging: true,
  dataEncryption: true,
  apiRateLimiting: true,
  firewallEnabled: true,
  malwareProtection: true
}

const mockLoginAttempts: LoginAttempt[] = [
  {
    id: '1',
    timestamp: '2024-01-20T14:30:00Z',
    username: 'john@example.com',
    ipAddress: '192.168.1.100',
    location: 'New York, US',
    device: 'Chrome on Windows',
    status: 'failed',
    reason: 'Invalid password',
    riskScore: 85
  },
  {
    id: '2',
    timestamp: '2024-01-20T14:28:00Z',
    username: 'jane@example.com',
    ipAddress: '192.168.1.101',
    location: 'London, UK',
    device: 'Safari on macOS',
    status: 'success',
    riskScore: 12
  },
  {
    id: '3',
    timestamp: '2024-01-20T14:25:00Z',
    username: 'admin',
    ipAddress: '192.168.1.102',
    location: 'San Francisco, US',
    device: 'Firefox on Linux',
    status: 'success',
    riskScore: 8
  },
  {
    id: '4',
    timestamp: '2024-01-20T14:20:00Z',
    username: 'mike@example.com',
    ipAddress: '203.0.113.1',
    location: 'Unknown',
    device: 'Chrome on Android',
    status: 'failed',
    reason: 'Account locked',
    riskScore: 95
  }
]

export default function AdminSecurityPage() {
  const [securityAlerts] = useState<SecurityAlert[]>(mockSecurityAlerts)
  const [securityMetrics] = useState<SecurityMetric[]>(mockSecurityMetrics)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(mockSecuritySettings)
  const [loginAttempts] = useState<LoginAttempt[]>(mockLoginAttempts)
  const [loading, setLoading] = useState(false)

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <ShieldAlert className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <ShieldCheck className="w-5 h-5 text-blue-500" />
      default:
        return <Shield className="w-5 h-5 text-gray-500" />
    }
  }

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getMetricIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const handleSettingChange = (key: keyof SecuritySettings, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }))
  }

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const criticalAlerts = securityAlerts.filter(alert => alert.type === 'critical' && !alert.isResolved).length
  const warningAlerts = securityAlerts.filter(alert => alert.type === 'warning' && !alert.isResolved).length
  const failedLogins = loginAttempts.filter(attempt => attempt.status === 'failed').length

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Security Center</h1>
            <p className="text-muted-foreground">
              Monitor and manage security settings, alerts, and threats
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="activity">Activity Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Security Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">87%</div>
                <p className="text-xs text-muted-foreground">
                  Overall health
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{criticalAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  Need immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                <Ban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{failedLogins}</div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{warningAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  Under investigation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
                <CardDescription>
                  Key security performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getMetricIcon(metric.status)}
                        <div>
                          <div className="font-medium">{metric.name}</div>
                          <div className="text-sm text-muted-foreground">{metric.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getMetricColor(metric.status)}`}>
                          {metric.value}{metric.unit}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {metric.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Alerts</CardTitle>
                <CardDescription>
                  Latest security notifications and warnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge className={getAlertColor(alert.type)}>
                            {alert.type}
                          </Badge>
                          {alert.isResolved && (
                            <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()} • {alert.source}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                All security alerts and incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge className={getAlertColor(alert.type)}>
                          {alert.type}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {alert.severity}
                        </Badge>
                        {alert.isResolved && (
                          <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Source: {alert.source}</span>
                        <span>•</span>
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        {alert.resolvedAt && (
                          <>
                            <span>•</span>
                            <span>Resolved: {new Date(alert.resolvedAt).toLocaleString()}</span>
                            <span>•</span>
                            <span>By: {alert.resolvedBy}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!alert.isResolved && (
                        <>
                          <Button size="sm">Investigate</Button>
                          <Button size="sm" variant="outline">Resolve</Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>
                  Configure authentication and access control
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Automatic logout after inactivity</p>
                  </div>
                  <span className="text-sm font-medium">{securitySettings.sessionTimeout / 3600}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Max Login Attempts</Label>
                    <p className="text-sm text-muted-foreground">Account lockout threshold</p>
                  </div>
                  <span className="text-sm font-medium">{securitySettings.maxLoginAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Password Expiry</Label>
                    <p className="text-sm text-muted-foreground">Days until password change required</p>
                  </div>
                  <span className="text-sm font-medium">{securitySettings.passwordExpiry} days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Security</CardTitle>
                <CardDescription>
                  Configure network and firewall settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Firewall Enabled</Label>
                    <p className="text-sm text-muted-foreground">Block unauthorized access</p>
                  </div>
                  <Switch
                    checked={securitySettings.firewallEnabled}
                    onCheckedChange={(checked) => handleSettingChange('firewallEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>API Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">Prevent API abuse</p>
                  </div>
                  <Switch
                    checked={securitySettings.apiRateLimiting}
                    onCheckedChange={(checked) => handleSettingChange('apiRateLimiting', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Malware Protection</Label>
                    <p className="text-sm text-muted-foreground">Scan for malicious files</p>
                  </div>
                  <Switch
                    checked={securitySettings.malwareProtection}
                    onCheckedChange={(checked) => handleSettingChange('malwareProtection', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>IP Whitelist</Label>
                    <p className="text-sm text-muted-foreground">Allowed IP ranges</p>
                  </div>
                  <span className="text-sm font-medium">{securitySettings.ipWhitelist.length} ranges</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Protection</CardTitle>
              <CardDescription>
                Configure data encryption and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">Encrypt sensitive data</p>
                  </div>
                  <Switch
                    checked={securitySettings.dataEncryption}
                    onCheckedChange={(checked) => handleSettingChange('dataEncryption', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all security events</p>
                  </div>
                  <Switch
                    checked={securitySettings.auditLogging}
                    onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Alert on security events</p>
                  </div>
                  <Switch
                    checked={securitySettings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Suspicious Activity Detection</Label>
                    <p className="text-sm text-muted-foreground">Monitor for anomalies</p>
                  </div>
                  <Switch
                    checked={securitySettings.suspiciousActivityDetection}
                    onCheckedChange={(checked) => handleSettingChange('suspiciousActivityDetection', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Login Activity Monitor</CardTitle>
              <CardDescription>
                Track and analyze login attempts and access patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginAttempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(attempt.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{attempt.username}</TableCell>
                      <TableCell>{attempt.ipAddress}</TableCell>
                      <TableCell>{attempt.location}</TableCell>
                      <TableCell className="max-w-xs truncate">{attempt.device}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {attempt.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="capitalize">{attempt.status}</span>
                          {attempt.reason && (
                            <span className="text-xs text-muted-foreground">({attempt.reason})</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            attempt.riskScore > 80 ? 'bg-red-500' :
                            attempt.riskScore > 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <span className={`text-sm font-medium ${
                            attempt.riskScore > 80 ? 'text-red-600' :
                            attempt.riskScore > 50 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {attempt.riskScore}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}