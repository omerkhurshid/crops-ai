import * as SQLite from 'expo-sqlite';
import { UserRole } from '@crops-ai/shared';

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastSync?: string;
}

export interface LocalFarm {
  id: string;
  name: string;
  ownerId: string;
  latitude: number;
  longitude: number;
  address?: string;
  region?: string;
  country: string;
  totalArea: number;
  createdAt: string;
  lastSync?: string;
  needsSync: boolean;
}

export interface LocalField {
  id: string;
  farmId: string;
  name: string;
  area: number;
  soilType?: string;
  createdAt: string;
  lastSync?: string;
  needsSync: boolean;
}

export interface LocalCrop {
  id: string;
  fieldId: string;
  cropType: string;
  variety?: string;
  plantingDate: string;
  expectedHarvestDate: string;
  actualHarvestDate?: string;
  status: 'PLANNED' | 'PLANTED' | 'GROWING' | 'READY_TO_HARVEST' | 'HARVESTED' | 'FAILED';
  yield?: number;
  createdAt: string;
  lastSync?: string;
  needsSync: boolean;
}

export interface LocalPhoto {
  id: string;
  farmId?: string;
  fieldId?: string;
  cropId?: string;
  uri: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  takenAt: string;
  uploaded: boolean;
  needsSync: boolean;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize() {
    try {
      this.db = await SQLite.openDatabaseAsync('crops_ai_local.db');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    // Users table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_sync TEXT
      );
    `);

    // Farms table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS farms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT,
        region TEXT,
        country TEXT DEFAULT 'US',
        total_area REAL NOT NULL,
        created_at TEXT NOT NULL,
        last_sync TEXT,
        needs_sync INTEGER DEFAULT 0,
        FOREIGN KEY (owner_id) REFERENCES users (id)
      );
    `);

    // Fields table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS fields (
        id TEXT PRIMARY KEY,
        farm_id TEXT NOT NULL,
        name TEXT NOT NULL,
        area REAL NOT NULL,
        soil_type TEXT,
        created_at TEXT NOT NULL,
        last_sync TEXT,
        needs_sync INTEGER DEFAULT 0,
        FOREIGN KEY (farm_id) REFERENCES farms (id)
      );
    `);

    // Crops table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS crops (
        id TEXT PRIMARY KEY,
        field_id TEXT NOT NULL,
        crop_type TEXT NOT NULL,
        variety TEXT,
        planting_date TEXT NOT NULL,
        expected_harvest_date TEXT NOT NULL,
        actual_harvest_date TEXT,
        status TEXT DEFAULT 'PLANNED',
        yield_amount REAL,
        created_at TEXT NOT NULL,
        last_sync TEXT,
        needs_sync INTEGER DEFAULT 0,
        FOREIGN KEY (field_id) REFERENCES fields (id)
      );
    `);

    // Photos table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        farm_id TEXT,
        field_id TEXT,
        crop_id TEXT,
        uri TEXT NOT NULL,
        description TEXT,
        latitude REAL,
        longitude REAL,
        taken_at TEXT NOT NULL,
        uploaded INTEGER DEFAULT 0,
        needs_sync INTEGER DEFAULT 1,
        FOREIGN KEY (farm_id) REFERENCES farms (id),
        FOREIGN KEY (field_id) REFERENCES fields (id),
        FOREIGN KEY (crop_id) REFERENCES crops (id)
      );
    `);

    // Sync queue table for tracking operations when offline
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        attempts INTEGER DEFAULT 0
      );
    `);
  }

  // User operations
  async saveUser(user: LocalUser): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT OR REPLACE INTO users (id, email, name, role, created_at, last_sync)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, user.name, user.role, user.createdAt, user.lastSync || null]
    );
  }

  async getUser(id: string): Promise<LocalUser | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (!result) return null;

    return {
      id: result.id,
      email: result.email,
      name: result.name,
      role: result.role,
      createdAt: result.created_at,
      lastSync: result.last_sync
    };
  }

  // Farm operations
  async saveFarm(farm: LocalFarm): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT OR REPLACE INTO farms 
       (id, name, owner_id, latitude, longitude, address, region, country, total_area, created_at, last_sync, needs_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        farm.id,
        farm.name,
        farm.ownerId,
        farm.latitude,
        farm.longitude,
        farm.address || null,
        farm.region || null,
        farm.country,
        farm.totalArea,
        farm.createdAt,
        farm.lastSync || null,
        farm.needsSync ? 1 : 0
      ]
    );
  }

  async getFarms(userId: string): Promise<LocalFarm[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM farms WHERE owner_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return results.map(row => ({
      id: row.id,
      name: row.name,
      ownerId: row.owner_id,
      latitude: row.latitude,
      longitude: row.longitude,
      address: row.address,
      region: row.region,
      country: row.country,
      totalArea: row.total_area,
      createdAt: row.created_at,
      lastSync: row.last_sync,
      needsSync: row.needs_sync === 1
    }));
  }

  // Field operations
  async saveField(field: LocalField): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT OR REPLACE INTO fields 
       (id, farm_id, name, area, soil_type, created_at, last_sync, needs_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        field.id,
        field.farmId,
        field.name,
        field.area,
        field.soilType || null,
        field.createdAt,
        field.lastSync || null,
        field.needsSync ? 1 : 0
      ]
    );
  }

  async getFields(farmId: string): Promise<LocalField[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM fields WHERE farm_id = ? ORDER BY created_at DESC',
      [farmId]
    );

    return results.map(row => ({
      id: row.id,
      farmId: row.farm_id,
      name: row.name,
      area: row.area,
      soilType: row.soil_type,
      createdAt: row.created_at,
      lastSync: row.last_sync,
      needsSync: row.needs_sync === 1
    }));
  }

  // Photo operations
  async savePhoto(photo: LocalPhoto): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT OR REPLACE INTO photos 
       (id, farm_id, field_id, crop_id, uri, description, latitude, longitude, taken_at, uploaded, needs_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        photo.id,
        photo.farmId || null,
        photo.fieldId || null,
        photo.cropId || null,
        photo.uri,
        photo.description || null,
        photo.latitude || null,
        photo.longitude || null,
        photo.takenAt,
        photo.uploaded ? 1 : 0,
        photo.needsSync ? 1 : 0
      ]
    );
  }

  async getPhotos(filters: { farmId?: string; fieldId?: string; cropId?: string }): Promise<LocalPhoto[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM photos WHERE 1=1';
    const params: any[] = [];

    if (filters.farmId) {
      query += ' AND farm_id = ?';
      params.push(filters.farmId);
    }
    if (filters.fieldId) {
      query += ' AND field_id = ?';
      params.push(filters.fieldId);
    }
    if (filters.cropId) {
      query += ' AND crop_id = ?';
      params.push(filters.cropId);
    }

    query += ' ORDER BY taken_at DESC';

    const results = await this.db.getAllAsync<any>(query, params);

    return results.map(row => ({
      id: row.id,
      farmId: row.farm_id,
      fieldId: row.field_id,
      cropId: row.crop_id,
      uri: row.uri,
      description: row.description,
      latitude: row.latitude,
      longitude: row.longitude,
      takenAt: row.taken_at,
      uploaded: row.uploaded === 1,
      needsSync: row.needs_sync === 1
    }));
  }

  // Sync queue operations
  async addToSyncQueue(operation: string, tableName: string, recordId: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT INTO sync_queue (operation, table_name, record_id, data, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [operation, tableName, recordId, JSON.stringify(data), new Date().toISOString()]
    );
  }

  async getSyncQueue(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM sync_queue ORDER BY created_at ASC'
    );

    return results.map(row => ({
      id: row.id,
      operation: row.operation,
      tableName: row.table_name,
      recordId: row.record_id,
      data: JSON.parse(row.data),
      createdAt: row.created_at,
      attempts: row.attempts
    }));
  }

  async removeSyncQueueItem(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();