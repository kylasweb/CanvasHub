import {
  WebDesignerProject,
  WebDesignerTemplate,
  WebDesignerWidget,
  WebDesignerAsset,
  WebDesignerCreateProjectRequest,
  WebDesignerUpdateProjectRequest,
  WebDesignerPublishProjectRequest,
  WebDesignerCreateTemplateRequest,
  WebDesignerUpdateTemplateRequest,
  WebDesignerCreateWidgetRequest,
  WebDesignerUpdateWidgetRequest,
  WebDesignerUploadAssetRequest,
  WebDesignerUpdateAssetRequest,
  WebDesignerProjectsResponse,
  WebDesignerTemplatesResponse,
  WebDesignerWidgetsResponse,
  WebDesignerAssetsResponse,
  WebDesignerAnalyticsResponse,
  WebDesignerMonitoringResponse
} from '../types'

class WebDesignerService {
  private readonly baseUrl = '/api/v1/web-designer'

  // Projects
  async getProjects(params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
    search?: string
  }): Promise<WebDesignerProjectsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.type) searchParams.append('type', params.type)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.search) searchParams.append('search', params.search)

    const response = await fetch(`${this.baseUrl}/projects?${searchParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch projects')
    }
    return response.json()
  }

  async getProject(id: string): Promise<WebDesignerProject> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch project')
    }
    return response.json()
  }

  async createProject(data: WebDesignerCreateProjectRequest): Promise<WebDesignerProject> {
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('Failed to create project')
    }
    return response.json()
  }

  async updateProject(id: string, data: WebDesignerUpdateProjectRequest): Promise<WebDesignerProject> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('Failed to update project')
    }
    return response.json()
  }

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Failed to delete project')
    }
  }

  async publishProject(id: string, data: WebDesignerPublishProjectRequest): Promise<WebDesignerProject> {
    const response = await fetch(`${this.baseUrl}/projects/${id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('Failed to publish project')
    }
    return response.json()
  }

  async duplicateProject(id: string): Promise<WebDesignerProject> {
    const response = await fetch(`${this.baseUrl}/projects/${id}/duplicate`, {
      method: 'POST'
    })
    if (!response.ok) {
      throw new Error('Failed to duplicate project')
    }
    return response.json()
  }

  // Templates
  async getTemplates(params?: {
    page?: number
    limit?: number
    category?: string
    type?: string
    search?: string
    isFeatured?: boolean
    isPremium?: boolean
  }): Promise<WebDesignerTemplatesResponse> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.category) searchParams.append('category', params.category)
    if (params?.type) searchParams.append('type', params.type)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.isFeatured !== undefined) searchParams.append('isFeatured', params.isFeatured.toString())
    if (params?.isPremium !== undefined) searchParams.append('isPremium', params.isPremium.toString())

    const response = await fetch(`${this.baseUrl}/templates?${searchParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch templates')
    }
    return response.json()
  }

  async getTemplate(id: string): Promise<WebDesignerTemplate> {
    const response = await fetch(`${this.baseUrl}/templates/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch template')
    }
    return response.json()
  }

  async createTemplate(data: WebDesignerCreateTemplateRequest): Promise<WebDesignerTemplate> {
    const response = await fetch(`${this.baseUrl}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('Failed to create template')
    }
    return response.json()
  }

  async updateTemplate(id: string, data: WebDesignerUpdateTemplateRequest): Promise<WebDesignerTemplate> {
    const response = await fetch(`${this.baseUrl}/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('Failed to update template')
    }
    return response.json()
  }

  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/templates/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Failed to delete template')
    }
  }

  // Widgets
  async getWidgets(params?: {
    page?: number
    limit?: number
    category?: string
    type?: string
    search?: string
    isPremium?: boolean
  }): Promise<WebDesignerWidgetsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.category) searchParams.append('category', params.category)
    if (params?.type) searchParams.append('type', params.type)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.isPremium !== undefined) searchParams.append('isPremium', params.isPremium.toString())

    const response = await fetch(`${this.baseUrl}/widgets?${searchParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch widgets')
    }
    return response.json()
  }

  async getWidget(id: string): Promise<WebDesignerWidget> {
    const response = await fetch(`${this.baseUrl}/widgets/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch widget')
    }
    return response.json()
  }

  async createWidget(data: WebDesignerCreateWidgetRequest): Promise<WebDesignerWidget> {
    const response = await fetch(`${this.baseUrl}/widgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('Failed to create widget')
    }
    return response.json()
  }

  async updateWidget(id: string, data: WebDesignerUpdateWidgetRequest): Promise<WebDesignerWidget> {
    const response = await fetch(`${this.baseUrl}/widgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('Failed to update widget')
    }
    return response.json()
  }

  async deleteWidget(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/widgets/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Failed to delete widget')
    }
  }

  // Assets
  async getAssets(params?: {
    page?: number
    limit?: number
    type?: string
    search?: string
    tags?: string[]
  }): Promise<WebDesignerAssetsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.type) searchParams.append('type', params.type)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.tags) searchParams.append('tags', params.tags.join(','))

    const response = await fetch(`${this.baseUrl}/assets?${searchParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch assets')
    }
    return response.json()
  }

  async getAsset(id: string): Promise<WebDesignerAsset> {
    const response = await fetch(`${this.baseUrl}/assets/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch asset')
    }
    return response.json()
  }

  async uploadAsset(data: WebDesignerUploadAssetRequest): Promise<WebDesignerAsset> {
    const formData = new FormData()
    formData.append('file', data.file)
    if (data.name) formData.append('name', data.name)
    if (data.alt) formData.append('alt', data.alt)
    if (data.tags) formData.append('tags', JSON.stringify(data.tags))
    formData.append('isPublic', data.isPublic.toString())

    const response = await fetch(`${this.baseUrl}/assets`, {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      throw new Error('Failed to upload asset')
    }
    return response.json()
  }

  async updateAsset(id: string, data: WebDesignerUpdateAssetRequest): Promise<WebDesignerAsset> {
    const response = await fetch(`${this.baseUrl}/assets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('Failed to update asset')
    }
    return response.json()
  }

  async deleteAsset(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/assets/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Failed to delete asset')
    }
  }

  // Analytics and Monitoring (Admin only)
  async getAnalytics(): Promise<WebDesignerAnalyticsResponse> {
    const response = await fetch(`${this.baseUrl}/admin/analytics`)
    if (!response.ok) {
      throw new Error('Failed to fetch analytics')
    }
    return response.json()
  }

  async getMonitoring(): Promise<WebDesignerMonitoringResponse> {
    const response = await fetch(`${this.baseUrl}/admin/monitoring`)
    if (!response.ok) {
      throw new Error('Failed to fetch monitoring data')
    }
    return response.json()
  }
}

export const webDesignerService = new WebDesignerService()