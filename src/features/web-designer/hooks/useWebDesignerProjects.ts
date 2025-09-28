import { useState, useEffect, useCallback } from 'react'
import { webDesignerService } from '../services/web-designer-service'
import { 
  WebDesignerProject, 
  WebDesignerCreateProjectRequest, 
  WebDesignerUpdateProjectRequest, 
  WebDesignerPublishProjectRequest,
  WebDesignerProjectsResponse 
} from '../types'

export function useWebDesignerProjects() {
  const [projects, setProjects] = useState<WebDesignerProject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })

  const fetchProjects = useCallback(async (params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
    search?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response: WebDesignerProjectsResponse = await webDesignerService.getProjects({
        page: params?.page || pagination.page,
        limit: params?.limit || pagination.limit,
        ...params
      })
      
      setProjects(response.projects)
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit])

  const createProject = useCallback(async (data: WebDesignerCreateProjectRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const newProject = await webDesignerService.createProject(data)
      setProjects(prev => [newProject, ...prev])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
      return newProject
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProject = useCallback(async (id: string, data: WebDesignerUpdateProjectRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedProject = await webDesignerService.updateProject(id, data)
      setProjects(prev => prev.map(project => 
        project.id === id ? updatedProject : project
      ))
      return updatedProject
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteProject = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await webDesignerService.deleteProject(id)
      setProjects(prev => prev.filter(project => project.id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const publishProject = useCallback(async (id: string, data: WebDesignerPublishProjectRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const publishedProject = await webDesignerService.publishProject(id, data)
      setProjects(prev => prev.map(project => 
        project.id === id ? publishedProject : project
      ))
      return publishedProject
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish project')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const duplicateProject = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const duplicatedProject = await webDesignerService.duplicateProject(id)
      setProjects(prev => [duplicatedProject, ...prev])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
      return duplicatedProject
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate project')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    loading,
    error,
    pagination,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    publishProject,
    duplicateProject
  }
}