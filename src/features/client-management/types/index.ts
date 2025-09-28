import { Client } from '@/lib/firebase';

export interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  tags: string[];
  notes?: string;
}

export interface ClientFilters {
  search?: string;
  tags?: string[];
  status?: 'active' | 'inactive';
}

export interface ClientStats {
  total: number;
  active: number;
  newThisMonth: number;
  topTags: Array<{ tag: string; count: number }>;
}

export type { Client };