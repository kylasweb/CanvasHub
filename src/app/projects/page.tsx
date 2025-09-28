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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  FolderOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock project data
const mockProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    client: 'Acme Corp',
    clientId: '1',
    status: 'in-progress',
    priority: 'high',
    budget: 15000,
    spent: 8500,
    startDate: '2023-06-01',
    endDate: '2023-08-15',
    progress: 65,
    team: [
      { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' },
      { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
    ],
    tasks: [
      { id: '1', title: 'Design mockups', completed: true },
      { id: '2', title: 'Frontend development', completed: false },
      { id: '3', title: 'Backend integration', completed: false }
    ]
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android',
    client: 'Tech Solutions',
    clientId: '2',
    status: 'planning',
    priority: 'medium',
    budget: 25000,
    spent: 2000,
    startDate: '2023-07-01',
    endDate: '2023-12-15',
    progress: 15,
    team: [
      { id: '3', name: 'Bob Johnson', avatar: '/avatars/bob.jpg' }
    ],
    tasks: [
      { id: '1', title: 'Requirements gathering', completed: true },
      { id: '2', title: 'UI/UX design', completed: false }
    ]
  },
  {
    id: '3',
    name: 'Brand Identity Package',
    description: 'Complete brand identity including logo and guidelines',
    client: 'Startup Inc',
    clientId: '3',
    status: 'completed',
    priority: 'low',
    budget: 5000,
    spent: 4800,
    startDate: '2023-05-01',
    endDate: '2023-06-30',
    progress: 100,
    team: [
      { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' }
    ],
    tasks: [
      { id: '1', title: 'Logo design', completed: true },
      { id: '2', title: 'Brand guidelines', completed: true },
      { id: '3', title: 'Business cards', completed: true }
    ]
  }
];

const statusOptions = [
  { value: 'planning', label: 'Planning', color: 'bg-blue-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'review', label: 'Review', color: 'bg-purple-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'on-hold', label: 'On Hold', color: 'bg-red-500' }
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' }
];

export default function Projects() {
  const [projects, setProjects] = useState(mockProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const { toast } = useToast();

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddProject = (projectData: any) => {
    const newProject = {
      ...projectData,
      id: Date.now().toString(),
      spent: 0,
      progress: 0,
      team: [],
      tasks: []
    };
    setProjects([...projects, newProject]);
    setIsAddDialogOpen(false);
    toast({
      title: "Project Created",
      description: `${projectData.name} has been created successfully.`,
    });
  };

  const handleEditProject = (projectData: any) => {
    setProjects(projects.map(project => 
      project.id === projectData.id ? projectData : project
    ));
    setEditingProject(null);
    toast({
      title: "Project Updated",
      description: `${projectData.name} has been updated successfully.`,
    });
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(project => project.id !== projectId));
    toast({
      title: "Project Deleted",
      description: "Project has been removed successfully.",
    });
  };

  const ProjectForm = ({ project, onSubmit, onCancel }: any) => {
    const [formData, setFormData] = useState(project || {
      name: '',
      description: '',
      client: '',
      clientId: '',
      status: 'planning',
      priority: 'medium',
      budget: 0,
      startDate: '',
      endDate: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Project Name *</Label>
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
            placeholder="Describe the project scope and objectives..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              value={formData.client}
              onChange={(e) => setFormData({...formData, client: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="budget">Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return (
      <Badge variant="secondary" className="text-xs">
        {statusOption?.label || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityOption = priorityOptions.find(opt => opt.value === priority);
    return (
      <Badge variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
        {priorityOption?.label || priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and track progress
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Set up a new project with details and timeline
              </DialogDescription>
            </DialogHeader>
            <ProjectForm
              onSubmit={handleAddProject}
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
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{projects.filter(p => p.status === 'in-progress').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{projects.filter(p => p.status === 'completed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Project Portfolio</CardTitle>
          <CardDescription>View and manage all your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="mt-1">{project.client}</CardDescription>
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
                            <DropdownMenuItem onSelect={() => setEditingProject(project)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Project</DialogTitle>
                              <DialogDescription>
                                Update project information and details
                              </DialogDescription>
                            </DialogHeader>
                            <ProjectForm
                              project={editingProject}
                              onSubmit={handleEditProject}
                              onCancel={() => setEditingProject(null)}
                            />
                          </DialogContent>
                        </Dialog>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      {getStatusBadge(project.status)}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Priority</p>
                      {getPriorityBadge(project.priority)}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-semibold">${project.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Spent</p>
                      <p className="font-semibold">${project.spent.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Progress</p>
                      <p className="text-sm text-muted-foreground">{project.progress}%</p>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  {project.team.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Team</p>
                      <div className="flex -space-x-2">
                        {project.team.map((member) => (
                          <Avatar key={member.id} className="w-6 h-6 border-2 border-background">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}