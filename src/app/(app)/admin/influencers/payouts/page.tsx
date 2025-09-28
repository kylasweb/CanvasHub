"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Filter,
  Users,
  DollarSign,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  CreditCard,
  Banknote,
  Smartphone,
  Calendar,
  TrendingUp,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Payout {
  id: string;
  influencerId: string;
  influencerName: string;
  influencerEmail: string;
  amount: number;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  payoutMethod: 'Bank Transfer' | 'PayPal' | 'Stripe' | 'Wise';
  transactionId?: string;
  processedAt?: string;
  createdAt: string;
  requestedAt: string;
  notes?: string;
}

export default function AdminPayoutManagement() {
  const router = useRouter();
  const { user, appUser, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [filteredPayouts, setFilteredPayouts] = useState<Payout[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  // Mock data for demonstration
  const mockPayouts: Payout[] = [
    {
      id: '1',
      influencerId: '1',
      influencerName: 'John Smith',
      influencerEmail: 'john@example.com',
      amount: 150.00,
      status: 'PROCESSED',
      payoutMethod: 'Bank Transfer',
      transactionId: 'TXN123456789',
      processedAt: '2024-01-10T10:00:00Z',
      createdAt: '2024-01-05T12:00:00Z',
      requestedAt: '2024-01-05T12:00:00Z',
      notes: 'Monthly commission payout'
    },
    {
      id: '2',
      influencerId: '2',
      influencerName: 'Sarah Johnson',
      influencerEmail: 'sarah@photography.com',
      amount: 89.50,
      status: 'PENDING',
      payoutMethod: 'PayPal',
      createdAt: '2024-01-20T14:00:00Z',
      requestedAt: '2024-01-20T14:00:00Z',
      notes: 'Bi-weekly commission'
    },
    {
      id: '3',
      influencerId: '4',
      influencerName: 'Emma Davis',
      influencerEmail: 'emma@studio.com',
      amount: 210.00,
      status: 'PENDING',
      payoutMethod: 'Stripe',
      createdAt: '2024-01-18T16:30:00Z',
      requestedAt: '2024-01-18T16:30:00Z',
      notes: 'Q4 bonus payout'
    },
    {
      id: '4',
      influencerId: '5',
      influencerName: 'Alex Rodriguez',
      influencerEmail: 'alex@creative.com',
      amount: 125.75,
      status: 'FAILED',
      payoutMethod: 'Wise',
      transactionId: 'WISE987654321',
      createdAt: '2024-01-15T09:15:00Z',
      requestedAt: '2024-01-15T09:15:00Z',
      processedAt: '2024-01-16T11:20:00Z',
      notes: 'Failed due to incorrect account details'
    },
    {
      id: '5',
      influencerId: '1',
      influencerName: 'John Smith',
      influencerEmail: 'john@example.com',
      amount: 95.25,
      status: 'PROCESSED',
      payoutMethod: 'Bank Transfer',
      transactionId: 'TXN987654321',
      processedAt: '2024-01-08T14:30:00Z',
      createdAt: '2024-01-03T10:00:00Z',
      requestedAt: '2024-01-03T10:00:00Z',
      notes: 'Special campaign bonus'
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
      setPayouts(mockPayouts);
      setFilteredPayouts(mockPayouts);
      setLoadingPayouts(false);
    }, 1000);
  }, [user, appUser, loading, router]);

  useEffect(() => {
    let filtered = payouts;

    if (searchTerm) {
      filtered = filtered.filter(payout =>
        payout.influencerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payout.influencerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payout.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(payout => payout.status === selectedStatus);
    }

    if (selectedMethod !== 'all') {
      filtered = filtered.filter(payout => payout.payoutMethod === selectedMethod);
    }

    setFilteredPayouts(filtered);
  }, [payouts, searchTerm, selectedStatus, selectedMethod]);

  const handleProcessPayout = (payoutId: string) => {
    const payout = payouts.find(p => p.id === payoutId);
    if (payout) {
      setSelectedPayout(payout);
      setIsProcessDialogOpen(true);
    }
  };

  const confirmProcessPayout = () => {
    if (selectedPayout) {
      setPayouts(prev => prev.map(payout => 
        payout.id === selectedPayout.id 
          ? { 
              ...payout, 
              status: 'PROCESSED' as const,
              processedAt: new Date().toISOString(),
              transactionId: `TXN${Date.now()}`
            }
          : payout
      ));
      
      toast({
        title: "Payout Processed",
        description: `Payout of $${selectedPayout.amount.toFixed(2)} has been processed successfully`,
      });
      
      setIsProcessDialogOpen(false);
      setSelectedPayout(null);
    }
  };

  const handleRetryPayout = (payoutId: string) => {
    setPayouts(prev => prev.map(payout => 
      payout.id === payoutId 
        ? { ...payout, status: 'PENDING' as const, processedAt: undefined }
        : payout
    ));
    
    const payout = payouts.find(p => p.id === payoutId);
    if (payout) {
      toast({
        title: "Payout Retry Initiated",
        description: `Payout for ${payout.influencerName} has been queued for retry`,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Processed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Bank Transfer':
        return <Banknote className="w-4 h-4" />;
      case 'PayPal':
        return <CreditCard className="w-4 h-4" />;
      case 'Stripe':
        return <CreditCard className="w-4 h-4" />;
      case 'Wise':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  if (loading || loadingPayouts) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Payouts...</p>
        </div>
      </div>
    );
  }

  if (!user || appUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access payout management.
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

  const totalPayouts = payouts.length;
  const pendingPayouts = payouts.filter(p => p.status === 'PENDING').length;
  const processedPayouts = payouts.filter(p => p.status === 'PROCESSED').length;
  const failedPayouts = payouts.filter(p => p.status === 'FAILED').length;
  const totalAmount = payouts.reduce((acc, p) => acc + p.amount, 0);
  const pendingAmount = payouts.filter(p => p.status === 'PENDING').reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/admin/influencers')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Back to Influencers
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payout Management</h1>
            <p className="text-gray-600 mt-2">Process and track influencer payouts</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayouts}</div>
            <p className="text-xs text-muted-foreground">
              All time payouts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayouts}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedPayouts}</div>
            <p className="text-xs text-muted-foreground">
              Successfully paid
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedPayouts}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total processed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search payouts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSED">Processed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Stripe">Stripe</SelectItem>
                  <SelectItem value="Wise">Wise</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payouts</CardTitle>
          <CardDescription>
            Manage all influencer payout requests and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayouts.map((payout) => (
              <div key={payout.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{payout.influencerName}</h3>
                          {getStatusBadge(payout.status)}
                        </div>
                        <p className="text-sm text-gray-600">{payout.influencerEmail}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getMethodIcon(payout.payoutMethod)}
                          <span className="text-xs text-gray-500">{payout.payoutMethod}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">${payout.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Amount</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {new Date(payout.requestedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">Requested</div>
                    </div>
                    {payout.processedAt && (
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {new Date(payout.processedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">Processed</div>
                      </div>
                    )}
                    {payout.transactionId && (
                      <div className="text-right">
                        <div className="text-sm font-mono">{payout.transactionId}</div>
                        <div className="text-xs text-gray-500">Transaction ID</div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {payout.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleProcessPayout(payout.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Process
                        </Button>
                      )}
                      {payout.status === 'FAILED' && (
                        <Button
                          size="sm"
                          onClick={() => handleRetryPayout(payout.id)}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Retry
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {payout.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {payout.notes}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Process Payout Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>
              Confirm payout processing for {selectedPayout?.influencerName}
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Influencer</Label>
                  <p className="text-sm text-gray-600">{selectedPayout.influencerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-sm font-medium">${selectedPayout.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Method</Label>
                  <p className="text-sm text-gray-600">{selectedPayout.payoutMethod}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Requested</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedPayout.requestedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This action will process the payout and generate a transaction ID. 
                  Make sure all details are correct before proceeding.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmProcessPayout}>
              Process Payout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}