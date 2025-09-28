"use client";

import PhotoDesigner from '@/features/photo-designer/components/PhotoDesigner';

export default function Editor() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Photo Editor</h1>
        <p className="text-muted-foreground">
          Advanced photo editing tools
        </p>
      </div>
      <PhotoDesigner />
    </div>
  );
}