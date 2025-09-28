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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Users,
  Mail,
  Phone,
  Calendar,
  Shield,
  Zap,
  UserCheck,
  UserX,
  MoreHorizontal,
  Eye,
  FileText,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'user' | 'editor';
  status: 'active' | 'inactive' | 'suspended';
  tenantId: string;
  createdAt: string;
  lastLogin?: string;
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
  projectsCount: number;
  storageUsed: number;
}

export default function UserManagement() {
  const router = useRouter();
  const { user, appUser, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Mock data for demonstration
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1-555-0123',
      role: 'admin',
      status: 'active',
      tenantId: 'tenant-1',
      createdAt: '2023-01-15',
      lastLogin: '2024-01-15T10:30:00Z',
      subscriptionTier: 'enterprise',
      projectsCount: 45,
      storageUsed: 15.5
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@photography.com',
      phone: '+1-555-0124',
      role: 'user',
      status: 'active',
      tenantId: 'tenant-2',
      createdAt: '2023-03-20',
      lastLogin: '2024-01-14T15:45:00Z',
      subscriptionTier: 'professional',
      projectsCount: 23,
      storageUsed: 8.2
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@design.com',
      role: 'manager',
      status: 'active',
      tenantId: 'tenant-3',
      createdAt: '2023-02-10',
      lastLogin: '2024-01-13T09:20:00Z',
      subscriptionTier: 'professional',
      projectsCount: 67,
      storageUsed: 22.1
    },
    {
      id: '4',
      name: 'Emma Davis',
      email: 'emma@studio.com',
      role: 'user',
      status: 'inactive',
      tenantId: 'tenant-4',
      createdAt: '2023-04-05',
      lastLogin: '2023-12-20T14:15:00Z',
      subscriptionTier: 'starter',
      projectsCount: 8,
      storageUsed: 2.3
    },
    {
      id: '5',
      name: 'Alex Rodriguez',
      email: 'alex@creative.com',
      role: 'editor',
      status: 'suspended',
      tenantId: 'tenant-5',
      createdAt: '2023-05-12',
      lastLogin: '2024-01-10T11:30:00Z',
      subscriptionTier: 'professional',
      projectsCount: 34,
      storageUsed: 12.7
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
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setLoadingUsers(false);
    }, 1000);
  }, [user, appUser, loading, router]);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    if (selectedTier !== 'all') {
      filtered = filtered.filter(user => user.subscriptionTier === selectedTier);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, selectedStatus, selectedTier]);

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            status: user.status === 'active' ? 'inactive' : 'active' 
          }
        : user
    ));
    
    const user = users.find(u => u.id === userId);
    if (user) {
      toast({
        title: `User ${user.status === 'active' ? 'Deactivated' : 'Activated'}`,
        description: `${user.name} has been ${user.status === 'active' ? 'deactivated' : 'activated'}`,
      });
    }
  };

  const handleCreateUser = () => {
    toast({
      title: "Create User",
      description: "User creation form would open here",
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    toast({
      title: "Edit User",
      description: `Edit form for ${user.name} would open here`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({
        title: "User Deleted",
        description: `${user.name} has been deleted`,
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'editor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || loadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Users...</p>
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
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access user management.
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all user accounts and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-name">Full Name</Label>
                  <Input id="user-name" placeholder="Enter full name" />
                </div>
                <div>
                  <Label htmlFor="user-email">Email Address</Label>
                  <Input id="user-email" type="email" placeholder="Enter email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-phone">Phone Number</Label>
                  <Input id="user-phone" placeholder="Enter phone number" />
                </div>
                <div>
                  <Label htmlFor="user-role">Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-tier">Subscription Tier</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="user-plan">SAAS Plan</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free-trial">Free Trial</SelectItem>
                      <SelectItem value="starter">Starter Plan</SelectItem>
                      <SelectItem value="professional">Professional Plan</SelectItem>
                      <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>
                  Create User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">
              With admin access
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((acc, user) => acc + user.storageUsed, 0).toFixed(1)}GB
            </div>
            <p className="text-xs text-muted-foreground">
              Total storage
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enterprise Users</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.subscriptionTier === 'enterprise').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Enterprise tier
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.length > 0 ? Math.round(users.reduce((acc, user) => acc + user.projectsCount, 0) / users.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per user
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Subscription</th>
                  <th className="text-left p-4 font-medium">Projects</th>
                  <th className="text-left p-4 font-medium">Storage</th>
                  <th className="text-left p-4 font-medium">Joined</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phone && (
                            <div className="text-xs text-gray-400">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBadgeColor(user.status)}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getTierBadgeColor(user.subscriptionTier)}>
                        {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{user.projectsCount}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{user.storageUsed}GB</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedRole('all');
                setSelectedStatus('all');
                setSelectedTier('all');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}