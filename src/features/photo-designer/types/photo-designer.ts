export interface PhotoProject {
  id: string;
  tenant_id: string;
  client_id: string;
  name: string;
  description?: string;
  photos: PhotoFile[];
  settings: ProjectSettings;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  created_at: Date;
  updated_at: Date;
}

export interface PhotoFile {
  id: string;
  project_id: string;
  original_url: string;
  thumbnail_url: string;
  edited_url?: string;
  metadata: PhotoMetadata;
  edits: PhotoEdit[];
  filters: PhotoFilter[];
  adjustments: PhotoAdjustment[];
  created_at: Date;
}

export interface PhotoMetadata {
  title?: string;
  description?: string;
  dimensions: {
    width: number;
    height: number;
  };
  size: number;
  format: string;
  camera?: {
    make: string;
    model: string;
    lens?: string;
  };
  settings?: {
    aperture?: string;
    shutter_speed?: string;
    iso?: number;
    focal_length?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
  };
  date_taken?: Date;
}

export interface PhotoEdit {
  id: string;
  type: 'crop' | 'rotate' | 'resize' | 'flip' | 'perspective';
  parameters: any;
  applied_at: Date;
}

export interface PhotoFilter {
  id: string;
  type: 'brightness' | 'contrast' | 'saturation' | 'vignette' | 'blur' | 'sharpen' | 'noise';
  value: number;
  enabled: boolean;
}

export interface PhotoAdjustment {
  id: string;
  type: 'exposure' | 'highlights' | 'shadows' | 'whites' | 'blacks' | 'clarity' | 'vibrance' | 'saturation';
  value: number;
  enabled: boolean;
}

export interface ProjectSettings {
  auto_save: boolean;
  save_interval: number; // in seconds
  max_undo_steps: number;
  default_filters: PhotoFilter[];
  quality_presets: QualityPreset[];
  export_settings: ExportSettings;
}

export interface QualityPreset {
  id: string;
  name: string;
  quality: number; // 1-100
  compression: 'lossless' | 'lossy';
  max_dimensions?: {
    width: number;
    height: number;
  };
}

export interface ExportSettings {
  format: 'jpg' | 'png' | 'webp' | 'tiff';
  quality: number;
  color_profile: 'sRGB' | 'AdobeRGB' | 'ProPhoto';
  metadata: 'all' | 'basic' | 'none';
  watermark?: WatermarkSettings;
}

export interface WatermarkSettings {
  enabled: boolean;
  text?: string;
  image_url?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  size: number;
}

export interface BatchOperation {
  id: string;
  project_id: string;
  type: 'resize' | 'filter' | 'adjustment' | 'export' | 'watermark';
  settings: any;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  affected_photos: string[];
  created_at: Date;
  completed_at?: Date;
}

export interface Preset {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  category: 'filter' | 'adjustment' | 'color' | 'effect';
  filters: PhotoFilter[];
  adjustments: PhotoAdjustment[];
  is_public: boolean;
  usage_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Tool {
  id: string;
  name: string;
  type: 'selection' | 'brush' | 'eraser' | 'clone' | 'healing' | 'patch' | 'red_eye' | 'whiten';
  icon: string;
  settings: ToolSettings[];
  enabled: boolean;
}

export interface ToolSettings {
  name: string;
  type: 'number' | 'boolean' | 'string' | 'choice';
  default_value: any;
  options?: any[];
  description?: string;
}

export interface Workspace {
  id: string;
  project_id: string;
  layout: WorkspaceLayout;
  tools: Tool[];
  panels: Panel[];
  zoom_level: number;
  pan_position: { x: number; y: number };
  settings: WorkspaceSettings;
}

export interface WorkspaceLayout {
  main_panel: 'grid' | 'list' | 'filmstrip';
  side_panels: PanelPosition[];
  tool_panel: 'left' | 'right' | 'top' | 'bottom' | 'hidden';
}

export interface PanelPosition {
  panel: 'history' | 'layers' | 'adjustments' | 'presets' | 'metadata' | 'tools';
  position: 'docked' | 'floating' | 'hidden';
  size?: { width: number; height: number };
}

export interface Panel {
  id: string;
  type: 'history' | 'layers' | 'adjustments' | 'presets' | 'metadata' | 'tools';
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  state: any;
}

export interface WorkspaceSettings {
  show_grid: boolean;
  snap_to_grid: boolean;
  grid_size: number;
  show_rulers: boolean;
  show_guides: boolean;
  auto_save: boolean;
  performance_mode: 'quality' | 'balanced' | 'performance';
}

export interface ProjectAnalytics {
  project_id: string;
  total_photos: number;
  editing_time: number; // in seconds
  operations_count: number;
  filters_used: { filter: string; count: number }[];
  exports_count: number;
  last_activity: Date;
}