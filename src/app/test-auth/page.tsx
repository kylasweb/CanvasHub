"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function TestAuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authStatus, setAuthStatus] = useState('Not checked');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loginData, setLoginData] = useState({
    email: 'admin@test.com', // Test admin email
    password: 'password123'
  });
  
  const router = useRouter();

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setAuthStatus('Authenticated');
        setUserInfo(data.user);
      } else {
        setAuthStatus('Not Authenticated');
        setUserInfo(null);
      }
    } catch (error) {
      setAuthStatus('Error checking auth');
      setUserInfo(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        setError('');
        await checkAuthStatus();
      } else {
        setError(data.error || 'Failed to sign in');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setAuthStatus('Not Authenticated');
      setUserInfo(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const testAdminAccess = async () => {
    try {
      const response = await fetch('/admin');
      if (response.ok) {
        alert('Admin access granted!');
      } else {
        alert('Admin access denied');
      }
    } catch (error) {
      alert('Error testing admin access');
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Authentication Test Page
          </h1>
          <p className="text-gray-600">
            Test the authentication system and admin access
          </p>
        </div>

        {/* Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>
              Current authentication status and user information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge variant={authStatus === 'Authenticated' ? 'default' : 'destructive'}>
                  {authStatus}
                </Badge>
              </div>
              
              {userInfo && (
                <div className="space-y-2">
                  <div><strong>User ID:</strong> {userInfo.id}</div>
                  <div><strong>Email:</strong> {userInfo.email}</div>
                  <div><strong>Name:</strong> {userInfo.name}</div>
                  <div><strong>Role:</strong> {userInfo.role}</div>
                  <div><strong>Email Verified:</strong> {userInfo.emailVerified ? 'Yes' : 'No'}</div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={checkAuthStatus} variant="outline">
                  Check Status
                </Button>
                {userInfo && (
                  <Button onClick={handleLogout} variant="destructive">
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Test Login</CardTitle>
            <CardDescription>
              Login with test credentials (admin@test.com / password123)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin Access Test */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Test</CardTitle>
            <CardDescription>
              Test access to admin pages (requires admin role)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Note: For admin access, use an email containing "admin" (e.g., admin@test.com)
              </p>
              <div className="flex gap-2">
                <Button onClick={testAdminAccess} variant="outline">
                  Test Admin Access
                </Button>
                <Button onClick={() => router.push('/admin')} variant="outline">
                  Go to Admin Dashboard
                </Button>
                <Button onClick={() => router.push('/dashboard')} variant="outline">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}