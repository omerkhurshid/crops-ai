import NetInfo from '@react-native-community/netinfo';
import { databaseService, LocalFarm, LocalField, LocalCrop, LocalPhoto } from './database';
import { authService } from './auth';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync?: string;
  pendingUploads: number;
  pendingDownloads: number;
  errors: SyncError[];
}

export interface SyncError {
  id: string;
  type: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'STORAGE_ERROR';
  message: string;
  timestamp: Date;
  details?: any;
}

interface DownloadQueueItem {
  id: string;
  type: 'farm' | 'field' | 'crop' | 'photo';
  resourceId: string;
  priority: number;
  retryCount: number;
  lastAttempt?: Date;
}

export interface SyncQueueItem {
  id: number;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  tableName: string;
  recordId: string;
  data: any;
  createdAt: string;
  attempts: number;
}

class SyncService {
  private readonly API_BASE_URL = 'http://localhost:3000';
  private isOnline = false;
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 30000; // 30 seconds
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private downloadQueue: DownloadQueueItem[] = [];
  private syncErrors: SyncError[] = [];

  constructor() {
    this.setupNetworkListener();
    this.startPeriodicSync();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected || false;

      if (!wasOnline && this.isOnline) {
        console.log('Network restored, starting sync...');
        this.syncAll();
      }
    });
  }

  private startPeriodicSync() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncAll();
      }
    }, this.SYNC_INTERVAL_MS);
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const syncQueue = await databaseService.getSyncQueue();
    const networkState = await NetInfo.fetch();

    return {
      isOnline: networkState.isConnected || false,
      isSyncing: this.isSyncing,
      lastSync: await this.getLastSyncTime(),
      pendingUploads: syncQueue.length,
      pendingDownloads: this.downloadQueue.length,
      errors: this.syncErrors
    };
  }

  async syncAll(): Promise<boolean> {
    if (this.isSyncing || !this.isOnline) {
      return false;
    }

    this.isSyncing = true;

    try {
      console.log('Starting full sync...');

      // 1. Upload pending changes
      await this.uploadPendingChanges();

      // 2. Download latest data
      await this.downloadLatestData();

      // 3. Update last sync time
      await this.setLastSyncTime(new Date().toISOString());

      console.log('Full sync completed successfully');
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  private async uploadPendingChanges(): Promise<void> {
    const syncQueue = await databaseService.getSyncQueue();

    for (const item of syncQueue) {
      try {
        await this.processSyncQueueItem(item);
        await databaseService.removeSyncQueueItem(item.id);
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        
        // Update attempt count
        if (item.attempts >= this.MAX_RETRY_ATTEMPTS) {
          console.error(`Max retry attempts reached for item ${item.id}, removing from queue`);
          await databaseService.removeSyncQueueItem(item.id);
        }
      }
    }
  }

  private async processSyncQueueItem(item: SyncQueueItem): Promise<void> {
    const endpoint = this.getApiEndpoint(item.tableName);
    
    switch (item.operation) {
      case 'CREATE':
        await this.uploadCreate(endpoint, item.data);
        break;
      case 'UPDATE':
        await this.uploadUpdate(endpoint, item.recordId, item.data);
        break;
      case 'DELETE':
        await this.uploadDelete(endpoint, item.recordId);
        break;
    }
  }

  private async uploadCreate(endpoint: string, data: any): Promise<void> {
    const response = await authService.makeAuthenticatedRequest(`${this.API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Upload create failed: ${response.statusText}`);
    }
  }

  private async uploadUpdate(endpoint: string, id: string, data: any): Promise<void> {
    const response = await authService.makeAuthenticatedRequest(`${this.API_BASE_URL}${endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Upload update failed: ${response.statusText}`);
    }
  }

  private async uploadDelete(endpoint: string, id: string): Promise<void> {
    const response = await authService.makeAuthenticatedRequest(`${this.API_BASE_URL}${endpoint}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Upload delete failed: ${response.statusText}`);
    }
  }

  private async downloadLatestData(): Promise<void> {
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Download farms
    await this.downloadFarms(user.id);
    
    // Download fields for each farm
    const farms = await databaseService.getFarms(user.id);
    for (const farm of farms) {
      await this.downloadFields(farm.id);
    }

    // Download photos
    await this.downloadPhotos();
  }

  private async downloadFarms(userId: string): Promise<void> {
    const response = await authService.makeAuthenticatedRequest(`${this.API_BASE_URL}/api/farms`);
    
    if (!response.ok) {
      throw new Error('Failed to download farms');
    }

    const farms = await response.json();
    
    for (const farm of farms.data || []) {
      const localFarm: LocalFarm = {
        id: farm.id,
        name: farm.name,
        ownerId: farm.ownerId,
        latitude: farm.latitude,
        longitude: farm.longitude,
        address: farm.address,
        region: farm.region,
        country: farm.country,
        totalArea: farm.totalArea,
        createdAt: farm.createdAt,
        lastSync: new Date().toISOString(),
        needsSync: false,
      };

      await databaseService.saveFarm(localFarm);
    }
  }

  private async downloadFields(farmId: string): Promise<void> {
    const response = await authService.makeAuthenticatedRequest(`${this.API_BASE_URL}/api/farms/${farmId}/fields`);
    
    if (!response.ok) {
      throw new Error('Failed to download fields');
    }

    const fields = await response.json();
    
    for (const field of fields.data || []) {
      const localField: LocalField = {
        id: field.id,
        farmId: field.farmId,
        name: field.name,
        area: field.area,
        soilType: field.soilType,
        createdAt: field.createdAt,
        lastSync: new Date().toISOString(),
        needsSync: false,
      };

      await databaseService.saveField(localField);
    }
  }

  private async downloadPhotos(): Promise<void> {
    const response = await authService.makeAuthenticatedRequest(`${this.API_BASE_URL}/api/photos`);
    
    if (!response.ok) {
      throw new Error('Failed to download photos metadata');
    }

    const photos = await response.json();
    
    for (const photo of photos.data || []) {
      const localPhoto: LocalPhoto = {
        id: photo.id,
        farmId: photo.farmId,
        fieldId: photo.fieldId,
        cropId: photo.cropId,
        uri: photo.uri, // This would be a cloud URL
        description: photo.description,
        latitude: photo.latitude,
        longitude: photo.longitude,
        takenAt: photo.takenAt,
        uploaded: true,
        needsSync: false,
      };

      await databaseService.savePhoto(localPhoto);
    }
  }

  // Upload photo file
  async uploadPhotoFile(photo: LocalPhoto): Promise<string | null> {
    try {
      if (!this.isOnline) {
        console.log('Offline: Photo will be uploaded when connection is restored');
        return null;
      }

      const formData = new FormData();
      formData.append('photo', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `${photo.id}.jpg`,
      } as any);

      if (photo.farmId) formData.append('farmId', photo.farmId);
      if (photo.fieldId) formData.append('fieldId', photo.fieldId);
      if (photo.cropId) formData.append('cropId', photo.cropId);
      if (photo.description) formData.append('description', photo.description);
      if (photo.latitude) formData.append('latitude', photo.latitude.toString());
      if (photo.longitude) formData.append('longitude', photo.longitude.toString());
      formData.append('takenAt', photo.takenAt);

      const response = await authService.makeAuthenticatedRequest(`${this.API_BASE_URL}/api/photos/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Photo upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update local photo record
      await databaseService.savePhoto({
        ...photo,
        uploaded: true,
        needsSync: false,
      });

      return result.url;
    } catch (error) {
      console.error('Photo upload error:', error);
      return null;
    }
  }

  // Queue operations for offline sync
  async queueCreate(tableName: string, recordId: string, data: any): Promise<void> {
    await databaseService.addToSyncQueue('CREATE', tableName, recordId, data);
  }

  async queueUpdate(tableName: string, recordId: string, data: any): Promise<void> {
    await databaseService.addToSyncQueue('UPDATE', tableName, recordId, data);
  }

  async queueDelete(tableName: string, recordId: string): Promise<void> {
    await databaseService.addToSyncQueue('DELETE', tableName, recordId, {});
  }

  // Force sync specific items
  async forceSyncFarm(farmId: string): Promise<boolean> {
    try {
      const farms = await databaseService.getFarms(await this.getCurrentUserId());
      const farm = farms.find(f => f.id === farmId);
      
      if (farm && farm.needsSync) {
        await this.queueUpdate('farms', farmId, farm);
        return await this.syncAll();
      }
      
      return true;
    } catch (error) {
      console.error('Force sync farm failed:', error);
      return false;
    }
  }

  private getApiEndpoint(tableName: string): string {
    switch (tableName) {
      case 'farms': return '/api/farms';
      case 'fields': return '/api/fields';
      case 'crops': return '/api/crops';
      case 'photos': return '/api/photos';
      default: throw new Error(`Unknown table: ${tableName}`);
    }
  }

  private async getLastSyncTime(): Promise<string | undefined> {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      return await AsyncStorage.getItem('lastSyncTime') || undefined;
    } catch (error) {
      this.addSyncError('STORAGE_ERROR', 'Failed to retrieve sync time', error);
      return undefined;
    }
  }

  private async setLastSyncTime(time: string): Promise<void> {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem('lastSyncTime', time);
    } catch (error) {
      this.addSyncError('STORAGE_ERROR', 'Failed to save sync time', error);
    }
  }

  // Cleanup and destroy
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Get sync statistics
  async getSyncStatistics(): Promise<{
    totalRecords: number;
    syncedRecords: number;
    pendingRecords: number;
    erroredRecords: number;
  }> {
    try {
      const syncQueue = await databaseService.getSyncQueue();
      const totalRecords = await databaseService.getTotalRecordsCount();
      const syncedRecords = totalRecords - syncQueue.length;
      
      return {
        totalRecords,
        syncedRecords,
        pendingRecords: syncQueue.length,
        erroredRecords: this.syncErrors.length,
      };
    } catch (error) {
      this.addSyncError('STORAGE_ERROR', 'Failed to calculate sync statistics', error);
      return {
        totalRecords: 0,
        syncedRecords: 0,
        pendingRecords: 0,
        erroredRecords: this.syncErrors.length,
      };
    }
  }

  // Manual conflict resolution
  async resolveConflict(localData: any, serverData: any, strategy: 'local' | 'server' | 'merge'): Promise<any> {
    switch (strategy) {
      case 'local':
        return localData;
      case 'server':
        return serverData;
      case 'merge':
        // Simple merge strategy - server wins for conflicts
        return { ...localData, ...serverData };
      default:
        return serverData;
    }
  }

  // Error tracking methods
  private addSyncError(type: SyncError['type'], message: string, details?: any): void {
    const error: SyncError = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date(),
      details
    };
    
    this.syncErrors.push(error);
    
    // Keep only last 50 errors to prevent memory bloat
    if (this.syncErrors.length > 50) {
      this.syncErrors = this.syncErrors.slice(-50);
    }
  }

  clearSyncErrors(): void {
    this.syncErrors = [];
  }

  // Download queue management
  addToDownloadQueue(type: DownloadQueueItem['type'], resourceId: string, priority: number = 1): void {
    const existingItem = this.downloadQueue.find(item => item.resourceId === resourceId && item.type === type);
    
    if (!existingItem) {
      this.downloadQueue.push({
        id: `${Date.now()}-${Math.random()}`,
        type,
        resourceId,
        priority,
        retryCount: 0
      });
      
      // Sort by priority (higher number = higher priority)
      this.downloadQueue.sort((a, b) => b.priority - a.priority);
    }
  }

  private async processDownloadQueue(): Promise<void> {
    while (this.downloadQueue.length > 0 && this.isOnline) {
      const item = this.downloadQueue.shift();
      if (!item) break;

      try {
        await this.downloadResource(item);
      } catch (error) {
        item.retryCount++;
        item.lastAttempt = new Date();
        
        if (item.retryCount < this.MAX_RETRY_ATTEMPTS) {
          // Re-add to queue for retry
          this.downloadQueue.push(item);
        } else {
          this.addSyncError('NETWORK_ERROR', `Failed to download ${item.type} ${item.resourceId}`, error);
        }
      }
    }
  }

  private async downloadResource(item: DownloadQueueItem): Promise<void> {
    const endpoint = this.getApiEndpoint(item.type + 's'); // Convert to plural
    const response = await fetch(`${this.API_BASE_URL}${endpoint}/${item.resourceId}`, {
      headers: {
        'Authorization': `Bearer ${await authService.getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Store downloaded data locally
    switch (item.type) {
      case 'farm':
        await databaseService.updateFarm(data);
        break;
      case 'field':
        await databaseService.updateField(data);
        break;
      case 'crop':
        await databaseService.updateCrop(data);
        break;
      case 'photo':
        await databaseService.updatePhoto(data);
        break;
    }
  }

  private async getCurrentUserId(): Promise<string> {
    try {
      const user = await authService.getCurrentUser();
      return user?.id || 'anonymous';
    } catch (error) {
      this.addSyncError('VALIDATION_ERROR', 'Failed to get current user ID', error);
      return 'anonymous';
    }
  }
}

export const syncService = new SyncService();