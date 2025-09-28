"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Download,
  Eye,
  Filter,
  Grid,
  List,
  Camera,
  Calendar,
  FolderOpen,
  Tag,
  Star,
  Heart,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock photo data
const mockPhotos = [
  {
    id: '1',
    title: 'Wedding Ceremony',
    description: 'Beautiful outdoor wedding ceremony',
    url: '/photos/wedding1.jpg',
    thumbnail: '/photos/wedding1-thumb.jpg',
    category: 'wedding',
    tags: ['wedding', 'ceremony', 'outdoor'],
    client: 'Sarah & John',
    clientId: '1',
    date: '2024-01-15',
    size: '4.2 MB',
    dimensions: '6000x4000',
    rating: 5,
    favorites: 24,
    views: 156,
    status: 'published'
  },
  {
    id: '2',
    title: 'Product Shot',
    description: 'Professional product photography',
    url: '/photos/product1.jpg',
    thumbnail: '/photos/product1-thumb.jpg',
    category: 'product',
    tags: ['product', 'commercial', 'studio'],
    client: 'Tech Corp',
    clientId: '2',
    date: '2024-01-12',
    size: '3.8 MB',
    dimensions: '5000x5000',
    rating: 4,
    favorites: 18,
    views: 89,
    status: 'published'
  },
  {
    id: '3',
    title: 'Portrait Session',
    description: 'Professional headshots',
    url: '/photos/portrait1.jpg',
    thumbnail: '/photos/portrait1-thumb.jpg',
    category: 'portrait',
    tags: ['portrait', 'headshot', 'professional'],
    client: 'Jane Smith',
    clientId: '3',
    date: '2024-01-10',
    size: '2.9 MB',
    dimensions: '4000x6000',
    rating: 5,
    favorites: 32,
    views: 203,
    status: 'published'
  },
  {
    id: '4',
    title: 'Landscape Sunset',
    description: 'Golden hour landscape photography',
    url: '/photos/landscape1.jpg',
    thumbnail: '/photos/landscape1-thumb.jpg',
    category: 'landscape',
    tags: ['landscape', 'sunset', 'nature'],
    client: 'Personal Project',
    clientId: 'personal',
    date: '2024-01-08',
    size: '5.1 MB',
    dimensions: '8000x4000',
    rating: 5,
    favorites: 45,
    views: 312,
    status: 'published'
  }
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'product', label: 'Product' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'event', label: 'Event' },
  { value: 'commercial', label: 'Commercial' }
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' }
];

export default function Photos() {
  const [photos, setPhotos] = useState(mockPhotos);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const { toast } = useToast();

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || photo.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || photo.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleUploadPhoto = (photoData: any) => {
    const newPhoto = {
      ...photoData,
      id: Date.now().toString(),
      favorites: 0,
      views: 0,
      rating: 0,
      status: 'draft'
    };
    setPhotos([...photos, newPhoto]);
    setIsUploadDialogOpen(false);
    toast({
      title: "Photo Uploaded",
      description: `${photoData.title} has been uploaded successfully.`,
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
    toast({
      title: "Photo Deleted",
      description: "Photo has been removed successfully.",
    });
  };

  const handleToggleFavorite = (photoId: string) => {
    setPhotos(photos.map(photo => 
      photo.id === photoId 
        ? { ...photo, favorites: photo.favorites + 1 }
        : photo
    ));
  };

  const PhotoUploadForm = ({ onSubmit, onCancel }: any) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      category: 'portrait',
      tags: '',
      client: '',
      clientId: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        date: new Date().toISOString().split('T')[0],
        url: '/photos/new-upload.jpg',
        thumbnail: '/photos/new-upload-thumb.jpg',
        size: '0 MB',
        dimensions: '0x0'
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Photo Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Describe the photo..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.slice(1).map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              value={formData.client}
              onChange={(e) => setFormData({...formData, client: e.target.value})}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            placeholder="e.g., wedding, outdoor, ceremony"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Upload Photo</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Photo Management</h1>
          <p className="text-muted-foreground">
            Organize and manage your photo library
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload New Photo</DialogTitle>
                <DialogDescription>
                  Add a new photo to your library
                </DialogDescription>
              </DialogHeader>
              <PhotoUploadForm
                onSubmit={handleUploadPhoto}
                onCancel={() => setIsUploadDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Photos</p>
                <p className="text-2xl font-bold">{photos.length}</p>
              </div>
              <Camera className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{photos.reduce((sum, p) => sum + p.views, 0)}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Favorites</p>
                <p className="text-2xl font-bold">{photos.reduce((sum, p) => sum + p.favorites, 0)}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length - 1}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Photo Library</CardTitle>
          <CardDescription>Browse and manage your photo collection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Photo Grid/List View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden group">
                  <div className="relative aspect-square">
                    <img
                      src={photo.thumbnail}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleToggleFavorite(photo.id)}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate">{photo.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{photo.client}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs">{photo.rating}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        <span>{photo.views}</span>
                        <Heart className="w-3 h-3" />
                        <span>{photo.favorites}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {photo.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {photo.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{photo.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPhotos.map((photo) => (
                <Card key={photo.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={photo.thumbnail}
                        alt={photo.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{photo.title}</h3>
                        <p className="text-sm text-muted-foreground">{photo.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{photo.client}</span>
                          <span>{photo.date}</span>
                          <span>{photo.size}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{photo.rating}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span>{photo.views}</span>
                          <Heart className="w-4 h-4" />
                          <span>{photo.favorites}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedPhoto(photo)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(photo.url, '_blank')}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFavorite(photo.id)}>
                              <Heart className="w-4 h-4 mr-2" />
                              Favorite
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo View Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.title}</DialogTitle>
            <DialogDescription>
              {selectedPhoto?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="max-w-full max-h-96 object-contain rounded"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedPhoto.client}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedPhoto.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dimensions</p>
                  <p className="font-medium">{selectedPhoto.dimensions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">{selectedPhoto.size}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPhoto.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{selectedPhoto.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{selectedPhoto.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{selectedPhoto.favorites}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}