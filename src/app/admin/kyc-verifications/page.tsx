'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Shield, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Search,
  Filter,
  Download,
  FileText,
  User,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  FileCheck,
  FileX
} from 'lucide-react'
import { toast } from 'sonner'

interface KYCVerification {
  id: string
  userId: string
  userName: string
  userEmail: string
  status: 'PENDING' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'SUSPENDED'
  verificationType: 'BASIC' | 'STANDARD' | 'ENHANCED' | 'BUSINESS'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  submittedAt?: string
  reviewedAt?: string
  reviewerId?: string
  reviewerName?: string
  rejectionReason?: string
  documents: Array<{
    id: string
    type: string
    fileName: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'NEEDS_REVIEW'
    uploadedAt: string
    verifiedAt?: string
  }>
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    nationality: string
    idNumber: string
  }
  addressInfo: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

interface KYCStats {
  total: number
  pending: number
  submitted: number
  underReview: number
  approved: number
  rejected: number
  expired: number
  suspended: number
  averageProcessingTime: number
  highRiskCount: number
}

export default function AdminKYCVerificationsPage() {
  const [loading, setLoading] = useState(false)
  const [selectedKYC, setSelectedKYC] = useState<KYCVerification | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [rejectionReason, setRejectionReason] = useState('')
  const [stats, setStats] = useState<KYCStats>({
    total: 0,
    pending: 0,
    submitted: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
    suspended: 0,
    averageProcessingTime: 0,
    highRiskCount: 0
  })

  // Mock data for demonstration
  const mockKYCVerifications: KYCVerification[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      status: 'SUBMITTED',
      verificationType: 'STANDARD',
      riskLevel: 'LOW',
      submittedAt: '2024-01-15T10:30:00Z',
      documents: [
        {
          id: 'doc1',
          type: 'PASSPORT',
          fileName: 'passport.pdf',
          status: 'PENDING',
          uploadedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 'doc2',
          type: 'UTILITY_BILL',
          fileName: 'utility_bill.pdf',
          status: 'PENDING',
          uploadedAt: '2024-01-15T10:30:00Z'
        }
      ],
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        nationality: 'US',
        idNumber: '123456789'
      },
      addressInfo: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US'
      }
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      status: 'UNDER_REVIEW',
      verificationType: 'ENHANCED',
      riskLevel: 'MEDIUM',
      submittedAt: '2024-01-14T14:20:00Z',
      reviewedAt: '2024-01-15T09:00:00Z',
      reviewerId: 'admin1',
      reviewerName: 'Admin User',
      documents: [
        {
          id: 'doc3',
          type: 'ID_CARD',
          fileName: 'id_card.jpg',
          status: 'APPROVED',
          uploadedAt: '2024-01-14T14:20:00Z',
          verifiedAt: '2024-01-15T09:00:00Z'
        },
        {
          id: 'doc4',
          type: 'BANK_STATEMENT',
          fileName: 'bank_statement.pdf',
          status: 'NEEDS_REVIEW',
          uploadedAt: '2024-01-14T14:20:00Z'
        }
      ],
      personalInfo: {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1985-05-15',
        nationality: 'UK',
        idNumber: 'AB123456'
      },
      addressInfo: {
        street: '456 Park Ave',
        city: 'London',
        state: 'England',
        zipCode: 'SW1A 1AA',
        country: 'UK'
      }
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Bob Johnson',
      userEmail: 'bob@example.com',
      status: 'APPROVED',
      verificationType: 'BASIC',
      riskLevel: 'LOW',
      submittedAt: '2024-01-10T11:00:00Z',
      reviewedAt: '2024-01-12T15:30:00Z',
      reviewerId: 'admin1',
      reviewerName: 'Admin User',
      documents: [
        {
          id: 'doc5',
          type: 'DRIVERS_LICENSE',
          fileName: 'license.jpg',
          status: 'APPROVED',
          uploadedAt: '2024-01-10T11:00:00Z',
          verifiedAt: '2024-01-12T15:30:00Z'
        }
      ],
      personalInfo: {
        firstName: 'Bob',
        lastName: 'Johnson',
        dateOfBirth: '1988-08-20',
        nationality: 'CA',
        idNumber: 'DL123456'
      },
      addressInfo: {
        street: '789 Oak St',
        city: 'Toronto',
        state: 'Ontario',
        zipCode: 'M5H 2N2',
        country: 'CA'
      }
    }
  ]

  const [kycVerifications, setKYCVerifications] = useState<KYCVerification[]>(mockKYCVerifications)

  useEffect(() => {
    // Calculate stats
    const newStats: KYCStats = {
      total: kycVerifications.length,
      pending: kycVerifications.filter(k => k.status === 'PENDING').length,
      submitted: kycVerifications.filter(k => k.status === 'SUBMITTED').length,
      underReview: kycVerifications.filter(k => k.status === 'UNDER_REVIEW').length,
      approved: kycVerifications.filter(k => k.status === 'APPROVED').length,
      rejected: kycVerifications.filter(k => k.status === 'REJECTED').length,
      expired: kycVerifications.filter(k => k.status === 'EXPIRED').length,
      suspended: kycVerifications.filter(k => k.status === 'SUSPENDED').length,
      averageProcessingTime: 2.5, // Mock value
      highRiskCount: kycVerifications.filter(k => k.riskLevel === 'HIGH' || k.riskLevel === 'CRITICAL').length
    }
    setStats(newStats)
  }, [kycVerifications])

  const filteredVerifications = kycVerifications.filter(kyc => {
    const matchesSearch = searchTerm === '' || 
      kyc.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kyc.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kyc.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || kyc.status === statusFilter
    const matchesType = typeFilter === 'all' || kyc.verificationType === typeFilter
    const matchesRisk = riskFilter === 'all' || kyc.riskLevel === riskFilter
    
    return matchesSearch && matchesStatus && matchesType && matchesRisk
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>
      case 'SUBMITTED':
        return <Badge variant="default">Submitted</Badge>
      case 'UNDER_REVIEW':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      case 'EXPIRED':
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>
      case 'SUSPENDED':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case 'HIGH':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case 'CRITICAL':
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="secondary">{riskLevel}</Badge>
    }
  }

  const handleApproveKYC = async (kycId: string) => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setKYCVerifications(prev => prev.map(kyc => 
        kyc.id === kycId 
          ? { 
              ...kyc, 
              status: 'APPROVED' as const,
              reviewedAt: new Date().toISOString(),
              reviewerId: 'admin1',
              reviewerName: 'Admin User',
              documents: kyc.documents.map(doc => ({ ...doc, status: 'APPROVED' as const }))
            }
          : kyc
      ))
      
      toast.success('KYC verification approved successfully!')
      setSelectedKYC(null)
    } catch (error) {
      toast.error('Failed to approve KYC verification')
    } finally {
      setLoading(false)
    }
  }

  const handleRejectKYC = async (kycId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setKYCVerifications(prev => prev.map(kyc => 
        kyc.id === kycId 
          ? { 
              ...kyc, 
              status: 'REJECTED' as const,
              rejectionReason,
              reviewedAt: new Date().toISOString(),
              reviewerId: 'admin1',
              reviewerName: 'Admin User'
            }
          : kyc
      ))
      
      toast.success('KYC verification rejected successfully!')
      setSelectedKYC(null)
      setRejectionReason('')
    } catch (error) {
      toast.error('Failed to reject KYC verification')
    } finally {
      setLoading(false)
    }
  }

  const handleStartReview = async (kycId: string) => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setKYCVerifications(prev => prev.map(kyc => 
        kyc.id === kycId 
          ? { 
              ...kyc, 
              status: 'UNDER_REVIEW' as const,
              reviewedAt: new Date().toISOString(),
              reviewerId: 'admin1',
              reviewerName: 'Admin User'
            }
          : kyc
      ))
      
      toast.success('Review started successfully!')
    } catch (error) {
      toast.error('Failed to start review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">KYC Verification Management</h1>
        <p className="text-muted-foreground">
          Manage and review user identity verification requests
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.approved / stats.total) * 100).toFixed(1)}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.underReview}</div>
            <p className="text-xs text-muted-foreground">
              {stats.submitted} submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.highRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Verification Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="ENHANCED">Enhanced</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="risk">Risk Level</Label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Verifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification Requests</CardTitle>
          <CardDescription>
            {filteredVerifications.length} verification requests found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVerifications.map((kyc) => (
                <TableRow key={kyc.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{kyc.userName}</div>
                      <div className="text-sm text-muted-foreground">{kyc.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{kyc.verificationType}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(kyc.status)}</TableCell>
                  <TableCell>{getRiskBadge(kyc.riskLevel)}</TableCell>
                  <TableCell>
                    {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedKYC(kyc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>KYC Verification Details</DialogTitle>
                            <DialogDescription>
                              Review verification request for {kyc.userName}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedKYC && (
                            <div className="space-y-6">
                              {/* User Information */}
                              <div className="grid grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                      <User className="h-5 w-5" />
                                      Personal Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div>
                                      <Label className="text-sm font-medium">Full Name</Label>
                                      <p>{selectedKYC.personalInfo.firstName} {selectedKYC.personalInfo.lastName}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Date of Birth</Label>
                                      <p>{selectedKYC.personalInfo.dateOfBirth}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Nationality</Label>
                                      <p>{selectedKYC.personalInfo.nationality}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">ID Number</Label>
                                      <p>{selectedKYC.personalInfo.idNumber}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                      <MapPin className="h-5 w-5" />
                                      Address Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div>
                                      <Label className="text-sm font-medium">Street</Label>
                                      <p>{selectedKYC.addressInfo.street}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">City</Label>
                                      <p>{selectedKYC.addressInfo.city}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">State/Province</Label>
                                      <p>{selectedKYC.addressInfo.state}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">ZIP/Postal Code</Label>
                                      <p>{selectedKYC.addressInfo.zipCode}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Country</Label>
                                      <p>{selectedKYC.addressInfo.country}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Documents */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5" />
                                    Uploaded Documents
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedKYC.documents.map((doc) => (
                                      <Card key={doc.id}>
                                        <CardHeader>
                                          <CardTitle className="text-base flex items-center justify-between">
                                            {doc.type.replace('_', ' ')}
                                            {getStatusBadge(doc.status)}
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <p className="text-sm font-medium">{doc.fileName}</p>
                                          <p className="text-xs text-muted-foreground">
                                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                          </p>
                                          {doc.verifiedAt && (
                                            <p className="text-xs text-muted-foreground">
                                              Verified: {new Date(doc.verifiedAt).toLocaleDateString()}
                                            </p>
                                          )}
                                          <div className="flex gap-2 mt-2">
                                            <Button variant="outline" size="sm">
                                              <Eye className="h-4 w-4 mr-1" />
                                              View
                                            </Button>
                                            <Button variant="outline" size="sm">
                                              <Download className="h-4 w-4 mr-1" />
                                              Download
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Review Actions */}
                              <Card>
                                <CardHeader>
                                  <CardTitle>Review Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {selectedKYC.status === 'SUBMITTED' && (
                                      <Button
                                        onClick={() => handleStartReview(selectedKYC.id)}
                                        disabled={loading}
                                      >
                                        {loading ? 'Starting Review...' : 'Start Review'}
                                      </Button>
                                    )}
                                    
                                    {selectedKYC.status === 'UNDER_REVIEW' && (
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => handleApproveKYC(selectedKYC.id)}
                                          disabled={loading}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          {loading ? 'Approving...' : 'Approve'}
                                        </Button>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="destructive" disabled={loading}>
                                              {loading ? 'Rejecting...' : 'Reject'}
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Reject KYC Verification</DialogTitle>
                                              <DialogDescription>
                                                Please provide a reason for rejecting this verification.
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <div>
                                                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                                                <Textarea
                                                  id="rejectionReason"
                                                  value={rejectionReason}
                                                  onChange={(e) => setRejectionReason(e.target.value)}
                                                  placeholder="Please explain why this verification is being rejected..."
                                                  rows={4}
                                                />
                                              </div>
                                              <div className="flex gap-2">
                                                <Button
                                                  onClick={() => handleRejectKYC(selectedKYC.id)}
                                                  disabled={loading || !rejectionReason.trim()}
                                                >
                                                  Confirm Rejection
                                                </Button>
                                                <Button variant="outline">
                                                  Cancel
                                                </Button>
                                              </div>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    )}
                                    
                                    {selectedKYC.rejectionReason && (
                                      <Alert>
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                          <strong>Rejection Reason:</strong> {selectedKYC.rejectionReason}
                                        </AlertDescription>
                                      </Alert>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {kyc.status === 'SUBMITTED' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartReview(kyc.id)}
                          disabled={loading}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      )}
                      
                      {kyc.status === 'UNDER_REVIEW' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleApproveKYC(kyc.id)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="destructive" disabled={loading}>
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject KYC Verification</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting this verification.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                                  <Textarea
                                    id="rejectionReason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Please explain why this verification is being rejected..."
                                    rows={4}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleRejectKYC(kyc.id)}
                                    disabled={loading || !rejectionReason.trim()}
                                  >
                                    Confirm Rejection
                                  </Button>
                                  <Button variant="outline">
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}