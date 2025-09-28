'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Camera,
  MapPin,
  User,
  Building,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

interface KYCData {
  verificationType: 'BASIC' | 'STANDARD' | 'ENHANCED' | 'BUSINESS'
  status: 'PENDING' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
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
  documents: Array<{
    type: string
    fileName: string
    status: string
    uploadedAt: string
  }>
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  submittedAt?: string
  reviewedAt?: string
  rejectionReason?: string
}

export default function KYCVerificationPage() {
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<'BASIC' | 'STANDARD' | 'ENHANCED' | 'BUSINESS'>('STANDARD')
  const [currentTab, setCurrentTab] = useState('personal')
  const [kycData, setKYCData] = useState<KYCData>({
    verificationType: 'STANDARD',
    status: 'PENDING',
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      idNumber: ''
    },
    addressInfo: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    documents: [],
    riskLevel: 'LOW'
  })

  const verificationTypes = [
    {
      type: 'BASIC' as const,
      title: 'Basic Verification',
      description: 'ID verification only',
      requirements: ['Government-issued ID'],
      processingTime: '1-2 business days',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      type: 'STANDARD' as const,
      title: 'Standard Verification',
      description: 'ID + Address verification',
      requirements: ['Government-issued ID', 'Proof of address'],
      processingTime: '2-3 business days',
      color: 'bg-green-100 text-green-800'
    },
    {
      type: 'ENHANCED' as const,
      title: 'Enhanced Verification',
      description: 'Full verification with additional documents',
      requirements: ['Government-issued ID', 'Proof of address', 'Additional documents'],
      processingTime: '3-5 business days',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      type: 'BUSINESS' as const,
      title: 'Business Verification',
      description: 'Business entity verification',
      requirements: ['Business registration', 'Director IDs', 'Proof of address'],
      processingTime: '5-7 business days',
      color: 'bg-orange-100 text-orange-800'
    }
  ]

  const documentTypes = [
    { value: 'ID_CARD', label: 'ID Card', icon: FileText },
    { value: 'PASSPORT', label: 'Passport', icon: FileText },
    { value: 'DRIVERS_LICENSE', label: 'Driver\'s License', icon: FileText },
    { value: 'UTILITY_BILL', label: 'Utility Bill', icon: FileText },
    { value: 'BANK_STATEMENT', label: 'Bank Statement', icon: FileText },
    { value: 'BUSINESS_LICENSE', label: 'Business License', icon: Building },
    { value: 'SELFIE', label: 'Selfie with ID', icon: Camera }
  ]

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setKYCData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo } }))
      setCurrentTab('address')
      toast.success('Personal information saved!')
    } catch (error) {
      toast.error('Failed to save personal information')
    } finally {
      setLoading(false)
    }
  }

  const handleAddressInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setKYCData(prev => ({ ...prev, addressInfo: { ...prev.addressInfo } }))
      setCurrentTab('documents')
      toast.success('Address information saved!')
    } catch (error) {
      toast.error('Failed to save address information')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newDocument = {
        type: documentType,
        fileName: file.name,
        status: 'PENDING',
        uploadedAt: new Date().toISOString()
      }
      
      setKYCData(prev => ({
        ...prev,
        documents: [...prev.documents, newDocument]
      }))
      
      toast.success('Document uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitKYC = async () => {
    setLoading(true)
    
    try {
      // Simulate KYC submission
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setKYCData(prev => ({
        ...prev,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString()
      }))
      
      toast.success('KYC verification submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit KYC verification')
    } finally {
      setLoading(false)
    }
  }

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
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
      case 'HIGH':
        return <Badge className="bg-orange-100 text-orange-800">High Risk</Badge>
      case 'CRITICAL':
        return <Badge variant="destructive">Critical Risk</Badge>
      default:
        return <Badge variant="secondary">{riskLevel}</Badge>
    }
  }

  if (kycData.status === 'APPROVED') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <CardTitle className="text-2xl">KYC Verification Approved!</CardTitle>
            <CardDescription>
              Your identity verification has been successfully completed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div>
                <Label className="text-sm font-medium">Verification Type</Label>
                <p className="text-lg font-semibold">{kycData.verificationType}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Risk Level</Label>
                <div>{getRiskBadge(kycData.riskLevel)}</div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Approved Date</Label>
              <p className="text-lg">
                {kycData.reviewedAt ? new Date(kycData.reviewedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (kycData.status === 'REJECTED') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-red-600" />
            <CardTitle className="text-2xl">KYC Verification Rejected</CardTitle>
            <CardDescription>
              Your identity verification was not approved. Please review the reason below and try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Reason for rejection:</strong> {kycData.rejectionReason || 'No specific reason provided.'}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={() => {
                setKYCData(prev => ({ ...prev, status: 'PENDING', rejectionReason: undefined }))
                setCurrentTab('personal')
              }}>
                Try Again
              </Button>
              <Button variant="outline">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Identity Verification (KYC)</h1>
        <p className="text-muted-foreground">
          Complete your identity verification to access all platform features
        </p>
      </div>

      {/* Verification Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="mt-1">{getStatusBadge(kycData.status)}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Verification Type</Label>
              <p className="text-lg font-semibold mt-1">{kycData.verificationType}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Risk Level</Label>
              <div className="mt-1">{getRiskBadge(kycData.riskLevel)}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Submitted</Label>
              <p className="text-sm mt-1">
                {kycData.submittedAt ? new Date(kycData.submittedAt).toLocaleDateString() : 'Not submitted'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Type Selection */}
      {kycData.status === 'PENDING' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Verification Type</CardTitle>
            <CardDescription>
              Choose the verification level that best suits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {verificationTypes.map((type) => (
                <Card 
                  key={type.type}
                  className={`cursor-pointer transition-all ${
                    selectedType === type.type 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedType(type.type)}
                >
                  <CardHeader className="text-center">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs font-medium">Requirements:</Label>
                        <ul className="text-xs space-y-1 mt-1">
                          {type.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Processing Time:</Label>
                        <p className="text-xs font-medium">{type.processingTime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KYC Form */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Verification</CardTitle>
          <CardDescription>
            Please provide the required information for your {selectedType} verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="address">Address Information</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      value={kycData.personalInfo.firstName}
                      onChange={(e) => setKYCData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, firstName: e.target.value }
                      }))}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      value={kycData.personalInfo.lastName}
                      onChange={(e) => setKYCData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, lastName: e.target.value }
                      }))}
                      required 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input 
                    id="dateOfBirth" 
                    type="date"
                    value={kycData.personalInfo.dateOfBirth}
                    onChange={(e) => setKYCData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
                    }))}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Select 
                    value={kycData.personalInfo.nationality}
                    onValueChange={(value) => setKYCData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, nationality: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="idNumber">ID Number *</Label>
                  <Input 
                    id="idNumber" 
                    value={kycData.personalInfo.idNumber}
                    onChange={(e) => setKYCData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, idNumber: e.target.value }
                    }))}
                    required 
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Continue to Address'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <form onSubmit={handleAddressInfoSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input 
                    id="street" 
                    value={kycData.addressInfo.street}
                    onChange={(e) => setKYCData(prev => ({
                      ...prev,
                      addressInfo: { ...prev.addressInfo, street: e.target.value }
                    }))}
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input 
                      id="city" 
                      value={kycData.addressInfo.city}
                      onChange={(e) => setKYCData(prev => ({
                        ...prev,
                        addressInfo: { ...prev.addressInfo, city: e.target.value }
                      }))}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province *</Label>
                    <Input 
                      id="state" 
                      value={kycData.addressInfo.state}
                      onChange={(e) => setKYCData(prev => ({
                        ...prev,
                        addressInfo: { ...prev.addressInfo, state: e.target.value }
                      }))}
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                    <Input 
                      id="zipCode" 
                      value={kycData.addressInfo.zipCode}
                      onChange={(e) => setKYCData(prev => ({
                        ...prev,
                        addressInfo: { ...prev.addressInfo, zipCode: e.target.value }
                      }))}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select 
                      value={kycData.addressInfo.country}
                      onValueChange={(value) => setKYCData(prev => ({
                        ...prev,
                        addressInfo: { ...prev.addressInfo, country: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Continue to Documents'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentTab('personal')}
                  >
                    Back
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documentTypes
                      .filter(docType => {
                        if (selectedType === 'BASIC') {
                          return ['ID_CARD', 'PASSPORT', 'DRIVERS_LICENSE'].includes(docType.value)
                        } else if (selectedType === 'STANDARD') {
                          return ['ID_CARD', 'PASSPORT', 'DRIVERS_LICENSE', 'UTILITY_BILL', 'BANK_STATEMENT'].includes(docType.value)
                        } else if (selectedType === 'ENHANCED') {
                          return true
                        } else if (selectedType === 'BUSINESS') {
                          return ['BUSINESS_LICENSE', 'ID_CARD', 'PASSPORT', 'UTILITY_BILL'].includes(docType.value)
                        }
                        return true
                      })
                      .map((docType) => {
                        const Icon = docType.icon
                        const uploadedDoc = kycData.documents.find(doc => doc.type === docType.value)
                        
                        return (
                          <Card key={docType.value}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Icon className="h-5 w-5" />
                                {docType.label}
                                {uploadedDoc && (
                                  <Badge variant={uploadedDoc.status === 'APPROVED' ? 'default' : 'secondary'}>
                                    {uploadedDoc.status}
                                  </Badge>
                                )}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {!uploadedDoc ? (
                                <div>
                                  <input
                                    type="file"
                                    id={`file-${docType.value}`}
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleFileUpload(e, docType.value)}
                                  />
                                  <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => document.getElementById(`file-${docType.value}`)?.click()}
                                    disabled={loading}
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Document
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">{uploadedDoc.fileName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Uploaded: {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById(`file-${docType.value}`)?.click()}
                                  >
                                    Replace
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitKYC} 
                    disabled={loading || kycData.documents.length === 0}
                  >
                    {loading ? 'Submitting...' : 'Submit Verification'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentTab('address')}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}