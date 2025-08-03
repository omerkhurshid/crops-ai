import NetInfo from '@react-native-community/netinfo';
import { databaseService, LocalFarm, LocalField, LocalCrop, LocalPhoto } from './database';
import { authService } from './auth';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync?: string;
  pendingUploads: number;
  pendingDownloads: number;
  errors: string[];
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
      pendingDownloads: 0, // TODO: Implement download queue
      errors: [], // TODO: Implement error tracking
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
      const farms = await databaseService.getFarms('current_user_id'); // TODO: Get actual user ID
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
    // TODO: Implement with AsyncStorage or database
    return undefined;
  }

  private async setLastSyncTime(time: string): Promise<void> {
    // TODO: Implement with AsyncStorage or database
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
    // TODO: Implement statistics calculation
    return {
      totalRecords: 0,
      syncedRecords: 0,
      pendingRecords: 0,
      erroredRecords: 0,
    };
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
}

export const syncService = new SyncService();