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
  FileText,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  MoreHorizontal,
  Eye,
  BarChart3,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate?: string;
  dueDate: string;
  progress: number;
  budget: number;
  spent: number;
  team: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ProjectManagement() {
  const router = useRouter();
  const { user, appUser, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Mock data for demonstration
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Wedding Portfolio',
      description: 'Complete wedding photography package for Sarah & John',
      client: {
        id: 'client-1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com'
      },
      status: 'in_progress',
      priority: 'high',
      startDate: '2024-01-01',
      dueDate: '2024-02-15',
      progress: 75,
      budget: 5000,
      spent: 3750,
      team: [
        { id: 'user-1', name: 'John Smith', role: 'Photographer' },
        { id: 'user-2', name: 'Emma Davis', role: 'Editor' }
      ],
      tags: ['wedding', 'photography', 'premium'],
      createdAt: '2023-12-15',
      updatedAt: '2024-01-14'
    },
    {
      id: '2',
      name: 'Corporate Branding',
      description: 'Complete corporate rebranding for TechCorp',
      client: {
        id: 'client-2',
        name: 'Mike Chen',
        email: 'mike@techcorp.com'
      },
      status: 'planning',
      priority: 'medium',
      startDate: '2024-01-20',
      dueDate: '2024-03-30',
      progress: 25,
      budget: 15000,
      spent: 2000,
      team: [
        { id: 'user-3', name: 'Alex Rodriguez', role: 'Designer' },
        { id: 'user-4', name: 'Lisa Wang', role: 'Project Manager' }
      ],
      tags: ['corporate', 'branding', 'design'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12'
    },
    {
      id: '3',
      name: 'Product Photography',
      description: 'E-commerce product shots for FashionStore',
      client: {
        id: 'client-3',
        name: 'Emma Davis',
        email: 'emma@fashionstore.com'
      },
      status: 'completed',
      priority: 'low',
      startDate: '2023-11-01',
      endDate: '2023-12-20',
      dueDate: '2023-12-15',
      progress: 100,
      budget: 3000,
      spent: 2800,
      team: [
        { id: 'user-1', name: 'John Smith', role: 'Photographer' }
      ],
      tags: ['product', 'e-commerce', 'photography'],
      createdAt: '2023-10-20',
      updatedAt: '2023-12-20'
    },
    {
      id: '4',
      name: 'Event Coverage',
      description: 'Corporate event photography and videography',
      client: {
        id: 'client-4',
        name: 'David Wilson',
        email: 'david@corp.com'
      },
      status: 'on_hold',
      priority: 'urgent',
      startDate: '2024-01-05',
      dueDate: '2024-01-25',
      progress: 40,
      budget: 8000,
      spent: 3200,
      team: [
        { id: 'user-5', name: 'Sarah Johnson', role: 'Photographer' },
        { id: 'user-6', name: 'Mike Chen', role: 'Videographer' }
      ],
      tags: ['event', 'corporate', 'video'],
      createdAt: '2023-12-28',
      updatedAt: '2024-01-10'
    },
    {
      id: '5',
      name: 'Portrait Session',
      description: 'Professional portrait photography session',
      client: {
        id: 'client-5',
        name: 'Lisa Brown',
        email: 'lisa@example.com'
      },
      status: 'cancelled',
      priority: 'medium',
      startDate: '2024-01-08',
      dueDate: '2024-01-12',
      progress: 20,
      budget: 500,
      spent: 100,
      team: [
        { id: 'user-1', name: 'John Smith', role: 'Photographer' }
      ],
      tags: ['portrait', 'photography'],
      createdAt: '2024-01-05',
      updatedAt: '2024-01-10'
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
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
      setLoadingProjects(false);
    }, 1000);
  }, [user, appUser, loading, router]);

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(project => project.priority === selectedPriority);
    }

    if (selectedClient !== 'all') {
      filtered = filtered.filter(project => project.client.name === selectedClient);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedStatus, selectedPriority, selectedClient]);

  const handleCreateProject = () => {
    toast({
      title: "Create Project",
      description: "Project creation form would open here",
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    toast({
      title: "Edit Project",
      description: `Edit form for ${project.name} would open here`,
    });
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && confirm(`Are you sure you want to delete ${project.name}?`)) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast({
        title: "Project Deleted",
        description: `${project.name} has been deleted`,
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <PauseCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'on_hold': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading || loadingProjects) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Projects...</p>
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
              You don't have permission to access project management.
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
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-2">Manage all projects across the platform</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a new project for a client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input id="project-name" placeholder="Enter project name" />
                </div>
                <div>
                  <Label htmlFor="project-client">Client</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client-1">Sarah Johnson</SelectItem>
                      <SelectItem value="client-2">Mike Chen</SelectItem>
                      <SelectItem value="client-3">Emma Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="project-description">Description</Label>
                <Input id="project-description" placeholder="Project description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="project-budget">Budget ($)</Label>
                  <Input id="project-budget" type="number" placeholder="0" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject}>
                  Create Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all clients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PauseCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(projects.reduce((acc, p) => acc + p.budget, 0) / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              Total project value
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
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {Array.from(new Set(projects.map(p => p.client.name))).map(client => (
                    <SelectItem key={client} value={client}>{client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {project.client.name}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Badge className={getStatusBadgeColor(project.status)}>
                    {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <Badge className={getPriorityBadgeColor(project.priority)}>
                    {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{project.description}</p>
              
              <div className="space-y-3">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Budget */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget</span>
                  <span className="font-medium">${project.budget.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Spent</span>
                  <span className="font-medium">${project.spent.toLocaleString()}</span>
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Due:</span>
                  <span className="font-medium">
                    {new Date(project.dueDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Team */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div className="flex -space-x-2">
                    {project.team.slice(0, 3).map((member, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600"
                        title={member.name}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {project.team.length > 3 && (
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600">
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditProject(project)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
              setSelectedPriority('all');
              setSelectedClient('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}