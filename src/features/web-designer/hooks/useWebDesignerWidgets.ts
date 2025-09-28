import { useState, useEffect, useCallback } from 'react'
import { webDesignerService } from '../services/web-designer-service'
import { 
  WebDesignerWidget, 
  WebDesignerCreateWidgetRequest, 
  WebDesignerUpdateWidgetRequest,
  WebDesignerWidgetsResponse 
} from '../types'

export function useWebDesignerWidgets() {
  const [widgets, setWidgets] = useState<WebDesignerWidget[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })

  const fetchWidgets = useCallback(async (params?: {
    page?: number
    limit?: number
    category?: string
    type?: string
    search?: string
    isPremium?: boolean
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response: WebDesignerWidgetsResponse = await webDesignerService.getWidgets({
        page: params?.page || pagination.page,
        limit: params?.limit || pagination.limit,
        ...params
      })
      
      setWidgets(response.widgets)
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch widgets')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit])

  const createWidget = useCallback(async (data: WebDesignerCreateWidgetRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const newWidget = await webDesignerService.createWidget(data)
      setWidgets(prev => [newWidget, ...prev])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
      return newWidget
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create widget')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateWidget = useCallback(async (id: string, data: WebDesignerUpdateWidgetRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedWidget = await webDesignerService.updateWidget(id, data)
      setWidgets(prev => prev.map(widget => 
        widget.id === id ? updatedWidget : widget
      ))
      return updatedWidget
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update widget')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteWidget = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await webDesignerService.deleteWidget(id)
      setWidgets(prev => prev.filter(widget => widget.id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete widget')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWidgets()
  }, [fetchWidgets])

  return {
    widgets,
    loading,
    error,
    pagination,
    fetchWidgets,
    createWidget,
    updateWidget,
    deleteWidget
  }
}