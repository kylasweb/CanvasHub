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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Camera, 
  QrCode, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Share,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import { EventManagementService } from '../services/event-management-service';
import { PhotoEvent, EventRegistration, EventPhoto, EventAnalytics } from '../types/event-management';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function EventManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<PhotoEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<PhotoEvent | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('events');

  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    status: 'upcoming' as const,
    settings: EventManagementService.createDefaultEventSettings()
  });

  useEffect(() => {
    if (user?.tenantId) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedEvent) {
      loadEventData();
    }
  }, [selectedEvent]);

  const loadData = async () => {
    if (!user?.tenantId) return;
    try {
      setLoading(true);
      const eventList = await EventManagementService.getEventsByTenant(user.tenantId);
      setEvents(eventList);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEventData = async () => {
    if (!selectedEvent) return;
    try {
      const [registrationList, photoList, analyticsData] = await Promise.all([
        EventManagementService.getRegistrationsByEvent(selectedEvent.id),
        EventManagementService.getPhotosByEvent(selectedEvent.id),
        EventManagementService.getEventAnalytics(selectedEvent.id)
      ]);
      
      setRegistrations(registrationList);
      setPhotos(photoList);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading event data:', error);
    }
  };

  const handleCreateEvent = async () => {
    if (!user?.tenantId) return;
    try {
      await EventManagementService.createEvent({
        tenant_id: user.tenantId,
        name: newEvent.name,
        description: newEvent.description,
        location: newEvent.location,
        start_date: new Date(newEvent.startDate),
        end_date: new Date(newEvent.endDate),
        max_participants: parseInt(newEvent.maxParticipants),
        current_participants: 0,
        status: newEvent.status,
        settings: newEvent.settings,
        registration_code: EventManagementService.generateRegistrationCode()
      });

      setNewEvent({
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        maxParticipants: '',
        status: 'upcoming',
        settings: EventManagementService.createDefaultEventSettings()
      });
      setShowCreateDialog(false);
      loadData();
      toast({
        title: "Success",
        description: "Event created successfully"
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
    }
  };

  const handleGenerateQR = async (eventId: string) => {
    try {
      const qrCode = await EventManagementService.generateQRCode(eventId);
      // In a real app, this would download or display the QR code
      toast({
        title: "QR Code Generated",
        description: "QR code for event registration has been generated"
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'upcoming': 'outline',
      'active': 'default',
      'completed': 'secondary',
      'cancelled': 'destructive'
    };

    const icons = {
      'upcoming': <Clock className="h-3 w-3" />,
      'active': <CheckCircle className="h-3 w-3" />,
      'completed': <CheckCircle className="h-3 w-3" />,
      'cancelled': <XCircle className="h-3 w-3" />
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="flex items-center gap-1">
        {icons[status as keyof typeof icons]}
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const getRegistrationStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'registered': 'default',
      'checked_in': 'secondary',
      'cancelled': 'destructive'
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
          <p className="text-muted-foreground">Loading event management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
          <p className="text-muted-foreground">
            Manage photo events, registrations, and automatic photo delivery
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Set up a new photo event with registration and photo delivery
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="col-span-1">Event Name</Label>
                  <Input
                    id="name"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="col-span-1">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="col-span-1">Location</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="col-span-1">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="col-span-1">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maxParticipants" className="col-span-1">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={newEvent.maxParticipants}
                    onChange={(e) => setNewEvent({...newEvent, maxParticipants: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="col-span-1">Status</Label>
                  <Select value={newEvent.status} onValueChange={(value: any) => setNewEvent({...newEvent, status: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateEvent}>Create Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map(event => (
              <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedEvent(event)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    {getStatusBadge(event.status)}
                  </div>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Location</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Dates</span>
                      <span>{event.start_date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Participants</span>
                      <span>{event.current_participants}/{event.max_participants}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Registration Code</span>
                      <Badge variant="outline">{event.registration_code}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4">
          {selectedEvent ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Registrations for {selectedEvent.name}</h2>
                <Button onClick={() => setShowQRDialog(true)}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>All Registrations ({registrations.length})</CardTitle>
                  <CardDescription>
                    Event participants and their registration status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {registrations.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No registrations yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Generate a QR code to start accepting registrations
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Participant</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Registration Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registrations.map(registration => (
                          <TableRow key={registration.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {registration.participant_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{registration.participant_name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ID: {registration.participant_id}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {registration.email}
                                </div>
                                {registration.phone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3 w-3" />
                                    {registration.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {registration.registration_date.toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {getRegistrationStatusBadge(registration.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select an Event</h3>
              <p className="text-muted-foreground">
                Choose an event to view its registrations
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          {selectedEvent ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Photos for {selectedEvent.name}</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <Card key={photo.id} className="overflow-hidden">
                    <div className="aspect-square bg-muted">
                      <img
                        src={photo.thumbnail_url}
                        alt={photo.title || 'Event photo'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{photo.title || 'Untitled'}</div>
                        <div className="text-xs text-muted-foreground">
                          {photo.upload_date.toLocaleDateString()}
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">
                            {photo.category || 'general'}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select an Event</h3>
              <p className="text-muted-foreground">
                Choose an event to view its photos
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {selectedEvent && analytics ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Analytics for {selectedEvent.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.total_registrations}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.checked_in_count} checked in
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Photos Uploaded</CardTitle>
                    <Camera className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.total_photos}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.unique_participants_with_photos} participants
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((analytics.checked_in_count / analytics.total_registrations) * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Check-in rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Photo Downloads</CardTitle>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.total_downloads}</div>
                    <p className="text-xs text-muted-foreground">
                      Total downloads
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select an Event</h3>
              <p className="text-muted-foreground">
                Choose an event to view its analytics
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}