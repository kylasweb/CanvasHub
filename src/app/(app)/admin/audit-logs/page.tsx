'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Calendar,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Database,
  Users,
  CreditCard,
  Mail,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  weekLogs: number;
  monthLogs: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
  topUsers: Array<{
    user: string;
    count: number;
  }>;
  severityDistribution: {
    info: number;
    warning: number;
    error: number;
    success: number;
  };
}

export default function AdminAuditLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Mock data for demonstration
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john@example.com',
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: 'user-1',
      details: { method: 'password', device: 'Chrome on Windows' },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-15T10:30:00Z',
      severity: 'success'
    },
    {
      id: '2',
      userId: 'user-2',
      userName: 'Sarah Johnson',
      userEmail: 'sarah@example.com',
      action: 'SETTINGS_UPDATED',
      entityType: 'SystemSettings',
      entityId: 'system',
      details: { section: 'email', fields: ['smtpHost', 'smtpPort'] },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: '2024-01-15T09:45:00Z',
      severity: 'info'
    },
    {
      id: '3',
      userId: 'user-3',
      userName: 'Mike Chen',
      userEmail: 'mike@example.com',
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: 'user-4',
      details: { role: 'USER', emailVerified: true },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-15T09:30:00Z',
      severity: 'success'
    },
    {
      id: '4',
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john@example.com',
      action: 'PAYMENT_FAILED',
      entityType: 'Payment',
      entityId: 'payment-1',
      details: { amount: 99.99, currency: 'USD', reason: 'Insufficient funds' },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-15T09:15:00Z',
      severity: 'error'
    },
    {
      id: '5',
      userId: 'user-2',
      userName: 'Sarah Johnson',
      userEmail: 'sarah@example.com',
      action: 'PERMISSION_CHANGED',
      entityType: 'User',
      entityId: 'user-3',
      details: { oldRole: 'USER', newRole: 'MANAGER' },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: '2024-01-15T09:00:00Z',
      severity: 'warning'
    }
  ];

  const mockStats: AuditStats = {
    totalLogs: 15420,
    todayLogs: 342,
    weekLogs: 2156,
    monthLogs: 8934,
    topActions: [
      { action: 'USER_LOGIN', count: 8934 },
      { action: 'SETTINGS_UPDATED', count: 2156 },
      { action: 'USER_CREATED', count: 1834 },
      { action: 'PAYMENT_PROCESSED', count: 1423 },
      { action: 'PERMISSION_CHANGED', count: 1073 }
    ],
    topUsers: [
      { user: 'John Smith', count: 3421 },
      { user: 'Sarah Johnson', count: 2893 },
      { user: 'Mike Chen', count: 2156 },
      { user: 'Emma Davis', count: 1834 },
      { user: 'Alex Rodriguez', count: 1616 }
    ],
    severityDistribution: {
      info: 8934,
      warning: 3216,
      error: 1834,
      success: 1436
    }
  };

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLogs(mockLogs);
      setStats(mockStats);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesUser = userFilter === 'all' || log.userId === userFilter;
    
    return matchesSearch && matchesAction && matchesSeverity && matchesUser;
  });

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <User className="w-4 h-4" />;
    if (action.includes('SETTINGS')) return <Settings className="w-4 h-4" />;
    if (action.includes('USER') && action.includes('CREATE')) return <Plus className="w-4 h-4" />;
    if (action.includes('PAYMENT')) return <CreditCard className="w-4 h-4" />;
    if (action.includes('PERMISSION')) return <Shield className="w-4 h-4" />;
    if (action.includes('DELETE')) return <Trash2 className="w-4 h-4" />;
    if (action.includes('EDIT')) return <Edit className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Email', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Severity'],
      ...filteredLogs.map(log => [
        formatTimestamp(log.timestamp),
        log.userName,
        log.userEmail,
        log.action,
        log.entityType,
        log.entityId,
        log.ipAddress,
        log.severity
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Logs Exported",
      description: "Audit logs have been exported successfully.",
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLogs(mockLogs);
    setStats(mockStats);
    setLoading(false);
    
    toast({
      title: "Logs Refreshed",
      description: "Audit logs have been refreshed.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-2">Track and monitor all system activities and user actions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todayLogs} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {((stats.severityDistribution.success / stats.totalLogs) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.severityDistribution.success} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.severityDistribution.warning}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.severityDistribution.error}</div>
              <p className="text-xs text-muted-foreground">
                Critical issues
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search logs by user, action, or entity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="USER_LOGIN">Login</SelectItem>
                  <SelectItem value="SETTINGS_UPDATED">Settings</SelectItem>
                  <SelectItem value="USER_CREATED">User Created</SelectItem>
                  <SelectItem value="PAYMENT_FAILED">Payment Failed</SelectItem>
                  <SelectItem value="PERMISSION_CHANGED">Permission</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
          <CardDescription>
            Detailed log of all system activities and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.userName}</div>
                        <div className="text-sm text-gray-500">{log.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="font-medium">{log.action.replace(/_/g, ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.entityType}</div>
                        <div className="text-sm text-gray-500">{log.entityId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSeverityColor(log.severity)}>
                        {getSeverityIcon(log.severity)}
                        <span className="ml-1">{log.severity}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Audit Log Details</DialogTitle>
                            <DialogDescription>
                              Detailed information about this audit log entry
                            </DialogDescription>
                          </DialogHeader>
                          {selectedLog && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Timestamp</Label>
                                  <p className="text-sm text-gray-600">{formatTimestamp(selectedLog.timestamp)}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Severity</Label>
                                  <Badge variant="outline" className={getSeverityColor(selectedLog.severity)}>
                                    {selectedLog.severity}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">User</Label>
                                  <p className="text-sm text-gray-600">{selectedLog.userName} ({selectedLog.userEmail})</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">IP Address</Label>
                                  <p className="text-sm text-gray-600">{selectedLog.ipAddress}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Action</Label>
                                <p className="text-sm text-gray-600">{selectedLog.action}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Entity</Label>
                                <p className="text-sm text-gray-600">{selectedLog.entityType} - {selectedLog.entityId}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Details</Label>
                                <pre className="text-sm bg-gray-50 p-3 rounded-md overflow-x-auto">
                                  {JSON.stringify(selectedLog.details, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">User Agent</Label>
                                <p className="text-sm text-gray-600 break-all">{selectedLog.userAgent}</p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}