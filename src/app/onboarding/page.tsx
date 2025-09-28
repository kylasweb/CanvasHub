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
import { CheckCircle, Circle, Clock, User, Mail, Phone, Shield, Settings, Star } from 'lucide-react'
import { toast } from 'sonner'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: any
  completed: boolean
  required: boolean
}

interface UserPreferences {
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  theme: string
  currency: string
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    theme: 'light',
    currency: 'USD'
  })

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Profile Setup',
      description: 'Complete your profile information',
      icon: User,
      completed: false,
      required: true
    },
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Verify your email address',
      icon: Mail,
      completed: false,
      required: true
    },
    {
      id: 'phone',
      title: 'Phone Verification',
      description: 'Add and verify your phone number',
      icon: Phone,
      completed: false,
      required: false
    },
    {
      id: 'kyc',
      title: 'Identity Verification',
      description: 'Complete KYC verification for enhanced security',
      icon: Shield,
      completed: false,
      required: false
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      icon: Settings,
      completed: false,
      required: false
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const progress = (completedSteps / steps.length) * 100

  const handleStepClick = (index: number) => {
    if (index <= completedSteps || !steps[index].required) {
      setCurrentStep(index)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      steps[0].completed = true
      toast.success('Profile updated successfully!')
      setCurrentStep(1)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailVerification = async () => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      steps[1].completed = true
      toast.success('Email verified successfully!')
      setCurrentStep(2)
    } catch (error) {
      toast.error('Failed to verify email')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneVerification = async () => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      steps[2].completed = true
      toast.success('Phone verified successfully!')
      setCurrentStep(3)
    } catch (error) {
      toast.error('Failed to verify phone')
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesSubmit = async () => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      steps[4].completed = true
      toast.success('Preferences saved successfully!')
      
      // Check if all required steps are completed
      const requiredCompleted = steps.filter(step => step.required).every(step => step.completed)
      if (requiredCompleted) {
        toast.success('Onboarding completed! 🎉')
      }
    } catch (error) {
      toast.error('Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  const skipStep = () => {
    if (!steps[currentStep].required) {
      setCurrentStep(currentStep + 1)
    }
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Tell us about yourself to personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Your Company" />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" placeholder="Your Position" />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself..." />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )

      case 'email':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Verify Your Email</CardTitle>
              <CardDescription>
                We've sent a verification code to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Check your inbox for a verification email. If you don't see it, check your spam folder.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button onClick={handleEmailVerification} disabled={loading}>
                  {loading ? 'Verifying...' : 'I Verified My Email'}
                </Button>
                <Button variant="outline" disabled={loading}>
                  Resend Email
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 'phone':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Add Phone Number</CardTitle>
              <CardDescription>
                Add your phone number for account security and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePhoneVerification} disabled={loading}>
                  {loading ? 'Sending Code...' : 'Send Verification Code'}
                </Button>
                {!steps[currentStep].required && (
                  <Button variant="outline" onClick={skipStep}>
                    Skip for Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'kyc':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Identity Verification (KYC)</CardTitle>
              <CardDescription>
                Complete identity verification to access all features and increase your account limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="text-center">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <CardTitle className="text-lg">Basic</CardTitle>
                    <CardDescription>ID verification only</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary">Required for most features</Badge>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow border-blue-500">
                  <CardHeader className="text-center">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <CardTitle className="text-lg">Standard</CardTitle>
                    <CardDescription>ID + Address verification</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="default">Recommended</Badge>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="text-center">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <CardTitle className="text-lg">Enhanced</CardTitle>
                    <CardDescription>Full verification with documents</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="outline">For business accounts</Badge>
                  </CardContent>
                </Card>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => window.location.href = '/kyc-verification'}>
                  Start Verification
                </Button>
                {!steps[currentStep].required && (
                  <Button variant="outline" onClick={skipStep}>
                    Skip for Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'preferences':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Customize Your Experience</CardTitle>
              <CardDescription>
                Set your preferences to personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={preferences.language} onValueChange={(value) => 
                      setPreferences({...preferences, language: value})
                    }>
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
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={preferences.timezone} onValueChange={(value) => 
                      setPreferences({...preferences, timezone: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="CST">Central Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={preferences.currency} onValueChange={(value) => 
                      setPreferences({...preferences, currency: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <input
                        id="email-notifications"
                        type="checkbox"
                        checked={preferences.notifications.email}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: {...preferences.notifications, email: e.target.checked}
                        })}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <input
                        id="push-notifications"
                        type="checkbox"
                        checked={preferences.notifications.push}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: {...preferences.notifications, push: e.target.checked}
                        })}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <input
                        id="sms-notifications"
                        type="checkbox"
                        checked={preferences.notifications.sms}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: {...preferences.notifications, sms: e.target.checked}
                        })}
                        className="rounded"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="appearance" className="space-y-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={preferences.theme} onValueChange={(value) => 
                      setPreferences({...preferences, theme: value})
                    }>
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
                </TabsContent>
              </Tabs>
              <div className="flex gap-2 mt-6">
                <Button onClick={handlePreferencesSubmit} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
                {!steps[currentStep].required && (
                  <Button variant="outline" onClick={skipStep}>
                    Skip for Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
        <p className="text-muted-foreground">Let's get you set up and ready to go!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Progress Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Onboarding Progress</CardTitle>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : step.completed
                    ? 'bg-green-50 text-green-700'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleStepClick(index)}
              >
                <div className="flex items-center gap-3">
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : index === currentStep ? (
                    <Circle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {step.title}
                      {step.required && <Star className="h-3 w-3 text-orange-500" />}
                    </div>
                    <div className="text-sm opacity-80">{step.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderStepContent()}
        </div>
      </div>
    </div>
  )
}