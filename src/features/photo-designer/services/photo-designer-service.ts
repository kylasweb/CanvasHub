import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  PhotoProject,
  PhotoFile,
  BatchOperation,
  Preset,
  Workspace,
  ProjectAnalytics,
  ProjectSettings,
  PhotoMetadata,
  QualityPreset,
  ExportSettings,
  PhotoFilter,
  PhotoAdjustment
} from '../types/photo-designer';

export class PhotoDesignerService {
  // Project Management
  static async createProject(projectData: Omit<PhotoProject, 'id' | 'created_at' | 'updated_at'>): Promise<PhotoProject> {
    try {
      const projectRef = await addDoc(collection(db, 'photo_projects'), {
        ...projectData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      const projectDoc = await getDoc(projectRef);
      const data = projectDoc.data();
      return {
        id: projectDoc.id,
        ...data,
        created_at: data?.created_at?.toDate(),
        updated_at: data?.updated_at?.toDate()
      } as PhotoProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  static async getProjectsByClient(clientId: string): Promise<PhotoProject[]> {
    try {
      const q = query(
        collection(db, 'photo_projects'),
        where('client_id', '==', clientId),
        orderBy('updated_at', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data?.created_at?.toDate(),
          updated_at: data?.updated_at?.toDate()
        } as PhotoProject;
      });
    } catch (error) {
      console.error('Error getting projects:', error);
      throw new Error('Failed to get projects');
    }
  }

  static async updateProject(projectId: string, updates: Partial<PhotoProject>): Promise<void> {
    try {
      const projectRef = doc(db, 'photo_projects', projectId);
      await updateDoc(projectRef, {
        ...updates,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  }

  // Photo Management
  static async addPhotoToProject(projectId: string, photoData: Omit<PhotoFile, 'id' | 'project_id' | 'created_at'>): Promise<PhotoFile> {
    try {
      const photoRef = await addDoc(collection(db, 'photo_files'), {
        ...photoData,
        project_id: projectId,
        created_at: serverTimestamp()
      });

      const photoDoc = await getDoc(photoRef);
      const data = photoDoc.data();
      return {
        id: photoDoc.id,
        ...data,
        created_at: data?.created_at?.toDate()
      } as PhotoFile;
    } catch (error) {
      console.error('Error adding photo:', error);
      throw new Error('Failed to add photo');
    }
  }

  static async getPhotosByProject(projectId: string): Promise<PhotoFile[]> {
    try {
      const q = query(
        collection(db, 'photo_files'),
        where('project_id', '==', projectId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data?.created_at?.toDate()
        } as PhotoFile;
      });
    } catch (error) {
      console.error('Error getting photos:', error);
      throw new Error('Failed to get photos');
    }
  }

  static async updatePhotoEdits(photoId: string, edits: any[], filters: PhotoFilter[], adjustments: PhotoAdjustment[]): Promise<void> {
    try {
      const photoRef = doc(db, 'photo_files', photoId);
      await updateDoc(photoRef, {
        edits: edits,
        filters: filters,
        adjustments: adjustments
      });
    } catch (error) {
      console.error('Error updating photo edits:', error);
      throw new Error('Failed to update photo edits');
    }
  }

  // Batch Operations
  static async createBatchOperation(operationData: Omit<BatchOperation, 'id' | 'created_at'>): Promise<BatchOperation> {
    try {
      const operationRef = await addDoc(collection(db, 'batch_operations'), {
        ...operationData,
        created_at: serverTimestamp()
      });

      const operationDoc = await getDoc(operationRef);
      const data = operationDoc.data();
      return {
        id: operationDoc.id,
        ...data,
        created_at: data?.created_at?.toDate(),
        completed_at: data?.completed_at?.toDate()
      } as BatchOperation;
    } catch (error) {
      console.error('Error creating batch operation:', error);
      throw new Error('Failed to create batch operation');
    }
  }

  static async getBatchOperationsByProject(projectId: string): Promise<BatchOperation[]> {
    try {
      const q = query(
        collection(db, 'batch_operations'),
        where('project_id', '==', projectId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data?.created_at?.toDate(),
          completed_at: data?.completed_at?.toDate()
        } as BatchOperation;
      });
    } catch (error) {
      console.error('Error getting batch operations:', error);
      throw new Error('Failed to get batch operations');
    }
  }

  // Presets Management
  static async createPreset(presetData: Omit<Preset, 'id' | 'created_at' | 'updated_at'>): Promise<Preset> {
    try {
      const presetRef = await addDoc(collection(db, 'presets'), {
        ...presetData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      const presetDoc = await getDoc(presetRef);
      const data = presetDoc.data();
      return {
        id: presetDoc.id,
        ...data,
        created_at: data?.created_at?.toDate(),
        updated_at: data?.updated_at?.toDate()
      } as Preset;
    } catch (error) {
      console.error('Error creating preset:', error);
      throw new Error('Failed to create preset');
    }
  }

  static async getPresetsByTenant(tenantId: string): Promise<Preset[]> {
    try {
      const q = query(
        collection(db, 'presets'),
        where('tenant_id', '==', tenantId),
        orderBy('usage_count', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data?.created_at?.toDate(),
          updated_at: data?.updated_at?.toDate()
        } as Preset;
      });
    } catch (error) {
      console.error('Error getting presets:', error);
      throw new Error('Failed to get presets');
    }
  }

  static async applyPreset(photoId: string, presetId: string): Promise<void> {
    try {
      const presetDoc = await getDoc(doc(db, 'presets', presetId));
      const preset = presetDoc.data() as Preset;

      const photoRef = doc(db, 'photo_files', photoId);
      await updateDoc(photoRef, {
        filters: preset.filters,
        adjustments: preset.adjustments
      });

      // Increment usage count
      await updateDoc(doc(db, 'presets', presetId), {
        usage_count: (preset.usage_count || 0) + 1,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error applying preset:', error);
      throw new Error('Failed to apply preset');
    }
  }

  // Workspace Management
  static async saveWorkspace(workspaceData: Omit<Workspace, 'id'>): Promise<Workspace> {
    try {
      const workspaceRef = await addDoc(collection(db, 'workspaces'), workspaceData);
      const workspaceDoc = await getDoc(workspaceRef);
      const data = workspaceDoc.data();
      return {
        id: workspaceDoc.id,
        ...data
      } as Workspace;
    } catch (error) {
      console.error('Error saving workspace:', error);
      throw new Error('Failed to save workspace');
    }
  }

  static async getWorkspaceByProject(projectId: string): Promise<Workspace | null> {
    try {
      const q = query(
        collection(db, 'workspaces'),
        where('project_id', '==', projectId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return null;

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Workspace;
    } catch (error) {
      console.error('Error getting workspace:', error);
      throw new Error('Failed to get workspace');
    }
  }

  // Analytics
  static async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics> {
    try {
      const photosQuery = query(
        collection(db, 'photo_files'),
        where('project_id', '==', projectId)
      );
      const photosSnapshot = await getDocs(photosQuery);
      const photos = photosSnapshot.docs.map(doc => doc.data());

      const batchOpsQuery = query(
        collection(db, 'batch_operations'),
        where('project_id', '==', projectId)
      );
      const batchOpsSnapshot = await getDocs(batchOpsQuery);
      const batchOps = batchOpsSnapshot.docs.map(doc => doc.data());

      const totalPhotos = photos.length;
      const operationsCount = photos.reduce((sum, photo) => sum + (photo.edits?.length || 0), 0);
      const exportsCount = batchOps.filter(op => op.type === 'export').length;

      // Calculate filter usage
      const filterUsage: { [key: string]: number } = {};
      photos.forEach(photo => {
        photo.filters?.forEach(filter => {
          filterUsage[filter.type] = (filterUsage[filter.type] || 0) + 1;
        });
      });

      const filtersUsed = Object.entries(filterUsage)
        .map(([filter, count]) => ({ filter, count }))
        .sort((a, b) => b.count - a.count);

      return {
        project_id: projectId,
        total_photos: totalPhotos,
        editing_time: 0, // Would need to track actual editing time
        operations_count: operationsCount,
        filters_used: filtersUsed,
        exports_count: exportsCount,
        last_activity: new Date()
      };
    } catch (error) {
      console.error('Error getting project analytics:', error);
      throw new Error('Failed to get project analytics');
    }
  }

  // Default Settings
  static createDefaultProjectSettings(): ProjectSettings {
    return {
      auto_save: true,
      save_interval: 30,
      max_undo_steps: 50,
      default_filters: [
        { id: 'brightness', type: 'brightness', value: 0, enabled: false },
        { id: 'contrast', type: 'contrast', value: 0, enabled: false },
        { id: 'saturation', type: 'saturation', value: 0, enabled: false }
      ],
      quality_presets: [
        {
          id: 'low',
          name: 'Low Quality',
          quality: 50,
          compression: 'lossy'
        },
        {
          id: 'medium',
          name: 'Medium Quality',
          quality: 80,
          compression: 'lossy'
        },
        {
          id: 'high',
          name: 'High Quality',
          quality: 95,
          compression: 'lossy'
        },
        {
          id: 'original',
          name: 'Original Quality',
          quality: 100,
          compression: 'lossless'
        }
      ],
      export_settings: {
        format: 'jpg',
        quality: 90,
        color_profile: 'sRGB',
        metadata: 'basic'
      }
    };
  }

  static createDefaultWorkspace(projectId: string): Workspace {
    return {
      id: '',
      project_id: projectId,
      layout: {
        main_panel: 'grid',
        side_panels: [
          { panel: 'history', position: 'docked' },
          { panel: 'layers', position: 'docked' },
          { panel: 'adjustments', position: 'docked' }
        ],
        tool_panel: 'left'
      },
      tools: [],
      panels: [],
      zoom_level: 100,
      pan_position: { x: 0, y: 0 },
      settings: {
        show_grid: false,
        snap_to_grid: false,
        grid_size: 10,
        show_rulers: true,
        show_guides: true,
        auto_save: true,
        performance_mode: 'balanced'
      }
    };
  }
}