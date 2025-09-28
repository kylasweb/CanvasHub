import { useState, useEffect, useCallback } from 'react'
import { webDesignerService } from '../services/web-designer-service'
import { 
  WebDesignerTemplate, 
  WebDesignerCreateTemplateRequest, 
  WebDesignerUpdateTemplateRequest,
  WebDesignerTemplatesResponse 
} from '../types'

export function useWebDesignerTemplates() {
  const [templates, setTemplates] = useState<WebDesignerTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })

  const fetchTemplates = useCallback(async (params?: {
    page?: number
    limit?: number
    category?: string
    type?: string
    search?: string
    isFeatured?: boolean
    isPremium?: boolean
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response: WebDesignerTemplatesResponse = await webDesignerService.getTemplates({
        page: params?.page || pagination.page,
        limit: params?.limit || pagination.limit,
        ...params
      })
      
      setTemplates(response.templates)
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit])

  const createTemplate = useCallback(async (data: WebDesignerCreateTemplateRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const newTemplate = await webDesignerService.createTemplate(data)
      setTemplates(prev => [newTemplate, ...prev])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
      return newTemplate
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTemplate = useCallback(async (id: string, data: WebDesignerUpdateTemplateRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedTemplate = await webDesignerService.updateTemplate(id, data)
      setTemplates(prev => prev.map(template => 
        template.id === id ? updatedTemplate : template
      ))
      return updatedTemplate
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTemplate = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await webDesignerService.deleteTemplate(id)
      setTemplates(prev => prev.filter(template => template.id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return {
    templates,
    loading,
    error,
    pagination,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
}