import { useState, useEffect, useCallback } from 'react'
import { webDesignerService } from '../services/web-designer-service'
import { 
  WebDesignerAsset, 
  WebDesignerUploadAssetRequest, 
  WebDesignerUpdateAssetRequest,
  WebDesignerAssetsResponse 
} from '../types'

export function useWebDesignerAssets() {
  const [assets, setAssets] = useState<WebDesignerAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })

  const fetchAssets = useCallback(async (params?: {
    page?: number
    limit?: number
    type?: string
    search?: string
    tags?: string[]
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response: WebDesignerAssetsResponse = await webDesignerService.getAssets({
        page: params?.page || pagination.page,
        limit: params?.limit || pagination.limit,
        ...params
      })
      
      setAssets(response.assets)
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit])

  const uploadAsset = useCallback(async (data: WebDesignerUploadAssetRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const newAsset = await webDesignerService.uploadAsset(data)
      setAssets(prev => [newAsset, ...prev])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
      return newAsset
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload asset')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAsset = useCallback(async (id: string, data: WebDesignerUpdateAssetRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedAsset = await webDesignerService.updateAsset(id, data)
      setAssets(prev => prev.map(asset => 
        asset.id === id ? updatedAsset : asset
      ))
      return updatedAsset
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update asset')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteAsset = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await webDesignerService.deleteAsset(id)
      setAssets(prev => prev.filter(asset => asset.id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  return {
    assets,
    loading,
    error,
    pagination,
    fetchAssets,
    uploadAsset,
    updateAsset,
    deleteAsset
  }
}