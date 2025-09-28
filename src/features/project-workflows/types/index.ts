import { Project } from '@/lib/firebase';

export interface ProjectFormData {
  clientId: string;
  name: string;
  description?: string;
  status: 'inquiry' | 'active' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  tags: string[];
  notes?: string;
}

export interface ProjectFilters {
  search?: string;
  clientId?: string;
  status?: Project['status'];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  averageProjectValue: number;
  topTags: Array<{ tag: string; count: number }>;
}

export interface ProjectTimeline {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  startDate: Date;
  endDate: Date;
  assignedTo?: string;
  dependencies?: string[];
}

export type { Project };