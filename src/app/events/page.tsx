"use client";

import EventManagement from '@/features/event-photo-management/components/EventManagement';

export default function Events() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
        <p className="text-muted-foreground">
          Plan and coordinate your events
        </p>
      </div>
      <EventManagement />
    </div>
  );
}