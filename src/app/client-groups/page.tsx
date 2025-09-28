"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Users, 
  Settings,
  Tag,
  Calendar,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock client groups data
const mockGroups = [
  {
    id: '1',
    name: 'Premium Clients',
    description: 'High-value clients with premium services',
    color: '#8b5cf6',
    clientCount: 45,
    totalRevenue: 125000,
    criteria: 'Total spent > $10,000',
    createdAt: '2023-01-15',
    clients: [
      { id: '1', name: 'John Doe', email: 'john@example.com', avatar: '/avatars/john.jpg' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: '/avatars/jane.jpg' }
    ]
  },
  {
    id: '2',
    name: 'New Clients',
    description: 'Clients joined in the last 30 days',
    color: '#10b981',
    clientCount: 23,
    totalRevenue: 15000,
    criteria: 'Join date < 30 days',
    createdAt: '2023-06-01',
    clients: [
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', avatar: '/avatars/bob.jpg' }
    ]
  },
  {
    id: '3',
    name: 'Inactive Clients',
    description: 'Clients with no recent activity',
    color: '#f59e0b',
    clientCount: 12,
    totalRevenue: 8000,
    criteria: 'No activity in last 90 days',
    createdAt: '2023-03-10',
    clients: []
  }
];

export default function ClientGroups() {
  const [groups, setGroups] = useState(mockGroups);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const { toast } = useToast();

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddGroup = (groupData: any) => {
    const newGroup = {
      ...groupData,
      id: Date.now().toString(),
      clientCount: 0,
      totalRevenue: 0,
      clients: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setGroups([...groups, newGroup]);
    setIsAddDialogOpen(false);
    toast({
      title: "Group Created",
      description: `${groupData.name} has been created successfully.`,
    });
  };

  const handleEditGroup = (groupData: any) => {
    setGroups(groups.map(group => 
      group.id === groupData.id ? groupData : group
    ));
    setEditingGroup(null);
    toast({
      title: "Group Updated",
      description: `${groupData.name} has been updated successfully.`,
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId));
    toast({
      title: "Group Deleted",
      description: "Client group has been removed successfully.",
    });
  };

  const GroupForm = ({ group, onSubmit, onCancel }: any) => {
    const [formData, setFormData] = useState(group || {
      name: '',
      description: '',
      color: '#6366f1',
      criteria: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const colorOptions = [
      { name: 'Indigo', value: '#6366f1' },
      { name: 'Purple', value: '#8b5cf6' },
      { name: 'Pink', value: '#ec4899' },
      { name: 'Red', value: '#ef4444' },
      { name: 'Orange', value: '#f97316' },
      { name: 'Yellow', value: '#eab308' },
      { name: 'Green', value: '#22c55e' },
      { name: 'Blue', value: '#3b82f6' }
    ];

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Group Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Describe the purpose of this group..."
          />
        </div>
        <div>
          <Label htmlFor="criteria">Criteria</Label>
          <Input
            id="criteria"
            value={formData.criteria}
            onChange={(e) => setFormData({...formData, criteria: e.target.value})}
            placeholder="e.g., Total spent > $10,000"
          />
        </div>
        <div>
          <Label>Color</Label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`w-full h-8 rounded border-2 ${
                  formData.color === color.value ? 'border-primary' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => setFormData({...formData, color: color.value})}
                title={color.name}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {group ? 'Update Group' : 'Create Group'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Groups</h1>
          <p className="text-muted-foreground">
            Organize and categorize your clients into groups
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a new client group for better organization
              </DialogDescription>
            </DialogHeader>
            <GroupForm
              onSubmit={handleAddGroup}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Groups</p>
                <p className="text-2xl font-bold">{groups.length}</p>
              </div>
              <Tag className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{groups.reduce((sum, g) => sum + g.clientCount, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Group Revenue</p>
                <p className="text-2xl font-bold">${groups.reduce((sum, g) => sum + g.totalRevenue, 0).toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Group Size</p>
                <p className="text-2xl font-bold">{(groups.reduce((sum, g) => sum + g.clientCount, 0) / groups.length).toFixed(1)}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Groups Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Client Groups</CardTitle>
          <CardDescription>Manage your client categorization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={() => setEditingGroup(group)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Group</DialogTitle>
                              <DialogDescription>
                                Update group information
                              </DialogDescription>
                            </DialogHeader>
                            <GroupForm
                              group={editingGroup}
                              onSubmit={handleEditGroup}
                              onCancel={() => setEditingGroup(null)}
                            />
                          </DialogContent>
                        </Dialog>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Clients</p>
                      <p className="font-semibold">{group.clientCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-semibold">${group.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Criteria</p>
                    <Badge variant="outline" className="text-xs">
                      {group.criteria}
                    </Badge>
                  </div>

                  {group.clients.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Sample Clients</p>
                      <div className="space-y-2">
                        {group.clients.slice(0, 3).map((client) => (
                          <div key={client.id} className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={client.avatar} />
                              <AvatarFallback className="text-xs">
                                {client.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{client.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                            </div>
                          </div>
                        ))}
                        {group.clients.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{group.clients.length - 3} more clients
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}