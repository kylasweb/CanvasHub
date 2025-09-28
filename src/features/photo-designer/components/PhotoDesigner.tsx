'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Edit, 
  Plus, 
  FolderOpen, 
  ImageIcon, 
  Settings, 
  Filter, 
  Settings2,
  Save,
  Download,
  Share,
  History,
  Layers,
  PanelLeft,
  PanelRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crop,
  Sun,
  Circle,
  Droplets,
  Eye,
  Trash2,
  MoreHorizontal,
  Palette,
  Wrench,
  Sparkles
} from 'lucide-react';
import { PhotoDesignerService } from '../services/photo-designer-service';
import { PhotoProject, PhotoFile, Preset, Workspace, ProjectAnalytics } from '../types/photo-designer';
import { useAuth } from '@/contexts/AuthContext';

export default function PhotoDesigner() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PhotoProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PhotoProject | null>(null);
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoFile | null>(null);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    settings: PhotoDesignerService.createDefaultProjectSettings()
  });

  useEffect(() => {
    if (user?.tenantId) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectData();
    }
  }, [selectedProject]);

  const loadData = async () => {
    if (!user?.tenantId) return;
    try {
      setLoading(true);
      const [projectList, presetList] = await Promise.all([
        PhotoDesignerService.getProjectsByClient(user.tenantId),
        PhotoDesignerService.getPresetsByTenant(user.tenantId)
      ]);
      
      setProjects(projectList);
      setPresets(presetList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectData = async () => {
    if (!selectedProject) return;
    try {
      const [photoList, analyticsData] = await Promise.all([
        PhotoDesignerService.getPhotosByProject(selectedProject.id),
        PhotoDesignerService.getProjectAnalytics(selectedProject.id)
      ]);
      
      setPhotos(photoList);
      setAnalytics(analyticsData);

      // Load workspace
      const workspaceData = await PhotoDesignerService.getWorkspaceByProject(selectedProject.id);
      if (workspaceData) {
        setWorkspace(workspaceData);
      } else {
        const defaultWorkspace = PhotoDesignerService.createDefaultWorkspace(selectedProject.id);
        const savedWorkspace = await PhotoDesignerService.saveWorkspace(defaultWorkspace);
        setWorkspace(savedWorkspace);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!user?.tenantId) return;
    try {
      const projectData = await PhotoDesignerService.createProject({
        tenant_id: user.tenantId,
        client_id: user.tenantId,
        name: newProject.name,
        description: newProject.description,
        photos: [],
        settings: newProject.settings,
        status: 'draft'
      });

      setProjects([projectData, ...projects]);
      setShowCreateDialog(false);
      setNewProject({
        name: '',
        description: '',
        settings: PhotoDesignerService.createDefaultProjectSettings()
      });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleAddPhotos = async (projectId: string, photoFiles: File[]) => {
    try {
      for (const file of photoFiles) {
        const metadata = await extractPhotoMetadata(file);
        await PhotoDesignerService.addPhotoToProject(projectId, {
          original_url: URL.createObjectURL(file),
          thumbnail_url: '', // Would be generated
          metadata,
          edits: [],
          filters: [],
          adjustments: []
        });
      }
      await loadProjectData();
    } catch (error) {
      console.error('Error adding photos:', error);
    }
  };

  const handleApplyPreset = async (presetId: string) => {
    if (!selectedPhoto) return;
    try {
      await PhotoDesignerService.applyPreset(selectedPhoto.id, presetId);
      await loadProjectData();
    } catch (error) {
      console.error('Error applying preset:', error);
    }
  };

  const extractPhotoMetadata = async (file: File): Promise<any> => {
    // This would extract EXIF data and other metadata
    // For now, returning basic metadata
    return {
      title: file.name,
      description: '',
      dimensions: {
        width: 0,
        height: 0
      },
      size: file.size,
      format: file.type.split('/')[1],
      camera: undefined,
      settings: undefined,
      location: undefined,
      date_taken: new Date()
    };
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'draft': 'outline',
      'in_progress': 'secondary',
      'completed': 'default',
      'archived': 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading photo designer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Photo Designer</h1>
          <p className="text-muted-foreground">
            Professional photo editing and enhancement tools
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new photo editing project
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="col-span-1">Project Name</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="col-span-1">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateProject}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedProject(project)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {getStatusBadge(project.status)}
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Photos</span>
                      <span>{project.photos.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span>{project.created_at.toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          {selectedProject ? (
            <div className="grid grid-cols-12 gap-4">
              {/* Left Panel - Tools */}
              <div className="col-span-1 bg-muted rounded-lg p-2">
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Select
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Crop className="h-4 w-4 mr-2" />
                    Crop
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Rotate
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Sun className="h-4 w-4 mr-2" />
                    Brightness
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Circle className="h-4 w-4 mr-2" />
                    Contrast
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Droplets className="h-4 w-4 mr-2" />
                    Saturation
                  </Button>
                </div>
              </div>

              {/* Center Panel - Photo Grid */}
              <div className="col-span-8">
                <div className="bg-background rounded-lg border">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold">{selectedProject.name}</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Photos
                        </Button>
                        <Button variant="outline" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      {photos.map(photo => (
                        <div key={photo.id} className="relative group">
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                            <img
                              src={photo.thumbnail_url}
                              alt={photo.metadata.title || 'Photo'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/20"
                              onClick={() => setSelectedPhoto(photo)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Adjustments */}
              <div className="col-span-3 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Quick Adjustments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs">Brightness</Label>
                      <Slider
                        defaultValue={[0]}
                        max={100}
                        min={-100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Contrast</Label>
                      <Slider
                        defaultValue={[0]}
                        max={100}
                        min={-100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Saturation</Label>
                      <Slider
                        defaultValue={[0]}
                        max={100}
                        min={-100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Presets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {presets.slice(0, 5).map(preset => (
                        <Button
                          key={preset.id}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleApplyPreset(preset.id)}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No Project Selected</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select a project to start editing
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {presets.map(preset => (
              <Card key={preset.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{preset.name}</CardTitle>
                    <Badge variant="outline">{preset.category}</Badge>
                  </div>
                  <CardDescription>{preset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Filters</span>
                      <span>{preset.filters.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Adjustments</span>
                      <span>{preset.adjustments.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Usage</span>
                      <span>{preset.usage_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && selectedProject ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.total_photos}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Operations</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.operations_count}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Exports</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.exports_count}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
                  <History className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.last_activity.toLocaleDateString()}</div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <PanelLeft className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No Analytics Available</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select a project to view analytics
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}