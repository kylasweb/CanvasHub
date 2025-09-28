import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectService } from '../services/projectService';
import { Project, ProjectFilters, ProjectStats } from '../types';

export function useProjects(filters?: ProjectFilters) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { appUser } = useAuth();

  useEffect(() => {
    if (!appUser?.tenantId) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const projectService = ProjectService.getInstance();
        const fetchedProjects = await projectService.getProjects(appUser.tenantId!, filters);

        setProjects(fetchedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [appUser?.tenantId, filters]);

  return { projects, loading, error, refetch: () => { } };
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { appUser } = useAuth();

  useEffect(() => {
    if (!appUser?.tenantId || !projectId) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const projectService = ProjectService.getInstance();
        const fetchedProject = await projectService.getProject(appUser.tenantId!, projectId);

        setProject(fetchedProject);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to fetch project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [appUser?.tenantId, projectId]);

  return { project, loading, error };
}

export function useProjectStats() {
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    averageProjectValue: 0,
    topTags: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { appUser } = useAuth();

  useEffect(() => {
    if (!appUser?.tenantId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const projectService = ProjectService.getInstance();
        const fetchedStats = await projectService.getProjectStats(appUser.tenantId!);

        setStats(fetchedStats);
      } catch (err) {
        console.error('Error fetching project stats:', err);
        setError('Failed to fetch project stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [appUser?.tenantId]);

  return { stats, loading, error };
}