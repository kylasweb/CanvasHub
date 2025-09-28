import { firestoreService } from '@/lib/firebase';
import { Project, ProjectFormData, ProjectFilters, ProjectStats, ProjectTimeline } from '../types';
import { Timestamp } from 'firebase/firestore';

export class ProjectService {
  private static instance: ProjectService;

  static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  async getProjects(tenantId: string, filters?: ProjectFilters): Promise<Project[]> {
    try {
      const baseFilters = [{ field: 'tenantId', operator: '==', value: tenantId }];

      if (filters?.clientId) {
        baseFilters.push({ field: 'clientId', operator: '==', value: filters.clientId });
      }

      if (filters?.status) {
        baseFilters.push({ field: 'status', operator: '==', value: filters.status });
      }

      const projects = await firestoreService.readAll('projects', baseFilters) as Project[];

      // Client-side filtering for search and tags
      let filteredProjects = projects;

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProjects = filteredProjects.filter(project =>
          project.name.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.tags && filters.tags.length > 0) {
        filteredProjects = filteredProjects.filter(project =>
          filters.tags!.some(tag => project.tags.includes(tag))
        );
      }

      if (filters?.dateRange) {
        filteredProjects = filteredProjects.filter(project => {
          if (!project.startDate || !project.endDate) return false;
          const startDate = new Date(project.startDate.seconds * 1000);
          const endDate = new Date(project.endDate.seconds * 1000);
          return startDate >= filters.dateRange!.start && endDate <= filters.dateRange!.end;
        });
      }

      return filteredProjects as Project[];
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProject(tenantId: string, projectId: string): Promise<Project | null> {
    try {
      const project = await firestoreService.read('projects', projectId);
      return project as Project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  async createProject(tenantId: string, projectData: ProjectFormData): Promise<string> {
    try {
      const project: Omit<Project, 'id'> = {
        tenantId,
        ...projectData,
        startDate: projectData.startDate ? Timestamp.fromDate(projectData.startDate) : undefined,
        endDate: projectData.endDate ? Timestamp.fromDate(projectData.endDate) : undefined,
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      };

      const projectId = await firestoreService.create('projects', project);

      // Create initial timeline items
      await this.createInitialTimeline(projectId, projectData);

      return projectId;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(tenantId: string, projectId: string, projectData: Partial<ProjectFormData>): Promise<void> {
    try {
      await firestoreService.update('projects', projectId, {
        ...projectData,
        updatedAt: new Date() as any
      });
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(tenantId: string, projectId: string): Promise<void> {
    try {
      // In a real app, you'd want to soft delete or handle related data
      console.log('Deleting project:', projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  async getProjectStats(tenantId: string): Promise<ProjectStats> {
    try {
      const projects = await this.getProjects(tenantId);

      const stats: ProjectStats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        cancelled: projects.filter(p => p.status === 'cancelled').length,
        totalRevenue: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
        averageProjectValue: 0,
        topTags: []
      };

      stats.averageProjectValue = stats.total > 0 ? stats.totalRevenue / stats.total : 0;

      // Calculate top tags
      const tagCounts: Record<string, number> = {};
      projects.forEach(project => {
        project.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      stats.topTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return stats;
    } catch (error) {
      console.error('Error fetching project stats:', error);
      throw error;
    }
  }

  async getProjectTimelines(tenantId: string, projectId: string): Promise<ProjectTimeline[]> {
    try {
      const timelines = await firestoreService.readAll('projectTimelines', [
        { field: 'tenantId', operator: '==', value: tenantId },
        { field: 'projectId', operator: '==', value: projectId }
      ]);

      return timelines as ProjectTimeline[];
    } catch (error) {
      console.error('Error fetching project timelines:', error);
      throw error;
    }
  }

  async createProjectTimeline(tenantId: string, timelineData: Omit<ProjectTimeline, 'id'>): Promise<string> {
    try {
      const timeline: Omit<ProjectTimeline, 'id'> = {
        ...timelineData
      };

      const timelineId = await firestoreService.create('projectTimelines', timeline);
      return timelineId;
    } catch (error) {
      console.error('Error creating project timeline:', error);
      throw error;
    }
  }

  private async createInitialTimeline(projectId: string, projectData: ProjectFormData): Promise<void> {
    try {
      const timelineItems: Omit<ProjectTimeline, 'id'>[] = [
        {
          projectId,
          title: 'Project Kickoff',
          description: 'Initial project meeting and planning session',
          status: 'planned',
          startDate: projectData.startDate || new Date(),
          endDate: new Date((projectData.startDate || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          projectId,
          title: 'Project Completion',
          description: 'Final delivery and project wrap-up',
          status: 'planned',
          startDate: projectData.endDate || new Date(),
          endDate: new Date((projectData.endDate || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000),
        }
      ];

      for (const timeline of timelineItems) {
        await this.createProjectTimeline('default-tenant', timeline);
      }
    } catch (error) {
      console.error('Error creating initial timeline:', error);
    }
  }
}