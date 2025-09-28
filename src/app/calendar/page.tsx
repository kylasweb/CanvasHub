"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Video,
  Phone,
  Coffee,
  Laptop,
  Camera,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock calendar data
const mockEvents = [
  {
    id: '1',
    title: 'Client Meeting - Acme Corp',
    description: 'Quarterly review and project planning',
    date: '2024-01-15',
    startTime: '10:00',
    endTime: '11:30',
    type: 'meeting',
    location: 'Conference Room A',
    attendees: [
      { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' },
      { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
    ],
    status: 'confirmed'
  },
  {
    id: '2',
    title: 'Photo Shoot - Wedding',
    description: 'Outdoor wedding photography session',
    date: '2024-01-18',
    startTime: '14:00',
    endTime: '18:00',
    type: 'photoshoot',
    location: 'Central Park',
    attendees: [
      { id: '3', name: 'Bob Johnson', avatar: '/avatars/bob.jpg' }
    ],
    status: 'confirmed'
  },
  {
    id: '3',
    title: 'Project Deadline - Website Redesign',
    description: 'Final delivery and client presentation',
    date: '2024-01-20',
    startTime: '15:00',
    endTime: '16:00',
    type: 'deadline',
    location: 'Virtual',
    attendees: [],
    status: 'upcoming'
  }
];

const eventTypes = [
  { value: 'meeting', label: 'Meeting', icon: Users, color: 'bg-blue-500' },
  { value: 'photoshoot', label: 'Photo Shoot', icon: Camera, color: 'bg-green-500' },
  { value: 'deadline', label: 'Deadline', icon: Clock, color: 'bg-red-500' },
  { value: 'consultation', label: 'Consultation', icon: Coffee, color: 'bg-purple-500' },
  { value: 'workshop', label: 'Workshop', icon: Laptop, color: 'bg-orange-500' },
  { value: 'design', label: 'Design Session', icon: Palette, color: 'bg-pink-500' }
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(mockEvents);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const { toast } = useToast();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleAddEvent = (eventData: any) => {
    const newEvent = {
      ...eventData,
      id: Date.now().toString(),
      status: 'confirmed'
    };
    setEvents([...events, newEvent]);
    setIsAddDialogOpen(false);
    toast({
      title: "Event Added",
      description: `${eventData.title} has been added to your calendar.`,
    });
  };

  const getEventTypeConfig = (type: string) => {
    return eventTypes.find(et => et.value === type) || eventTypes[0];
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    
    const days: React.ReactElement[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Add day names
    dayNames.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
          {day}
        </div>
      );
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-100 bg-gray-50"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const dateStr = date.toISOString().split('T')[0];
      
      days.push(
        <div 
          key={`day-${day}`}
          className={`p-2 border border-gray-100 min-h-24 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-200' : ''
          }`}
          onClick={() => setSelectedDate(dateStr)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
              {day}
            </span>
            {dateEvents.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {dateEvents.length}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {dateEvents.slice(0, 2).map((event) => {
              const typeConfig = getEventTypeConfig(event.type);
              return (
                <div
                  key={event.id}
                  className={`text-xs p-1 rounded text-white truncate ${typeConfig.color}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                  }}
                >
                  {event.title}
                </div>
              );
            })}
            {dateEvents.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{dateEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const EventForm = ({ onSubmit, onCancel }: any) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      date: selectedDate || new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      type: 'meeting',
      location: '',
      attendees: []
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Event Title *</Label>
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
            placeholder="Event description and details..."
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time *</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Event Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Event location or virtual"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Event</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Schedule and manage your appointments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Add a new event to your calendar
              </DialogDescription>
            </DialogHeader>
            <EventForm
              onSubmit={handleAddEvent}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {eventTypes.map((type) => (
                <div key={type.value} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${type.color}`}></div>
                  <span className="text-xs text-muted-foreground">{type.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0 border rounded-lg overflow-hidden">
            {renderCalendar()}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              {selectedEvent?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <Badge variant="secondary">{getEventTypeConfig(selectedEvent.type).label}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={selectedEvent.status === 'confirmed' ? 'default' : 'secondary'}>
                    {selectedEvent.status}
                  </Badge>
                </div>
              </div>
              
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.attendees.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Attendees</p>
                  <div className="flex -space-x-2">
                    {selectedEvent.attendees.map((attendee: any) => (
                      <Avatar key={attendee.id} className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback className="text-xs">
                          {attendee.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}