import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { locationService, GeoPosition } from './location';

export interface PhotoMetadata {
  id: string;
  uri: string;
  width: number;
  height: number;
  location?: GeoPosition;
  description?: string;
  takenAt: string;
  farmId?: string;
  fieldId?: string;
  cropId?: string;
}

export interface CameraPermissions {
  camera: boolean;
  mediaLibrary: boolean;
}

class CameraService {
  async requestPermissions(): Promise<CameraPermissions> {
    try {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();

      return {
        camera: cameraPermission.status === 'granted',
        mediaLibrary: mediaLibraryPermission.status === 'granted',
      };
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return {
        camera: false,
        mediaLibrary: false,
      };
    }
  }

  async takePicture(
    cameraRef: Camera.CameraView,
    options: {
      quality?: number;
      base64?: boolean;
      skipProcessing?: boolean;
      farmId?: string;
      fieldId?: string;
      cropId?: string;
      description?: string;
    } = {}
  ): Promise<PhotoMetadata | null> {
    try {
      const permissions = await this.requestPermissions();
      if (!permissions.camera) {
        throw new Error('Camera permission not granted');
      }

      const photo = await cameraRef.takePictureAsync({
        quality: options.quality || 0.8,
        base64: options.base64 || false,
        skipProcessing: options.skipProcessing || false,
      });

      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      // Get current location
      const location = await locationService.getCurrentPosition();

      // Generate unique ID
      const id = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Save to media library if permission granted
      if (permissions.mediaLibrary) {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
      }

      const photoMetadata: PhotoMetadata = {
        id,
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        location: location || undefined,
        description: options.description,
        takenAt: new Date().toISOString(),
        farmId: options.farmId,
        fieldId: options.fieldId,
        cropId: options.cropId,
      };

      return photoMetadata;
    } catch (error) {
      console.error('Error taking picture:', error);
      return null;
    }
  }

  async pickImage(options: {
    allowsEditing?: boolean;
    quality?: number;
    farmId?: string;
    fieldId?: string;
    cropId?: string;
    description?: string;
  } = {}): Promise<PhotoMetadata | null> {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        throw new Error('Media library permission not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing || true,
        aspect: [4, 3],
        quality: options.quality || 0.8,
        exif: true,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];
      const id = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Try to extract location from EXIF data
      let location: GeoPosition | undefined;
      if (asset.exif?.GPSLatitude && asset.exif?.GPSLongitude) {
        location = {
          latitude: asset.exif.GPSLatitude,
          longitude: asset.exif.GPSLongitude,
          timestamp: Date.now(),
        };
      } else {
        // If no GPS data in image, use current location
        location = (await locationService.getCurrentPosition()) || undefined;
      }

      const photoMetadata: PhotoMetadata = {
        id,
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        location,
        description: options.description,
        takenAt: new Date().toISOString(),
        farmId: options.farmId,
        fieldId: options.fieldId,
        cropId: options.cropId,
      };

      return photoMetadata;
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  }

  async compressImage(uri: string, quality: number = 0.7): Promise<string | null> {
    try {
      // Using ImagePicker's built-in compression
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality,
        base64: false,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return null;
    }
  }

  async deletePhoto(uri: string): Promise<boolean> {
    try {
      const permissions = await this.requestPermissions();
      if (!permissions.mediaLibrary) {
        console.warn('Media library permission not granted, cannot delete from gallery');
        return false;
      }

      // Get asset info
      const asset = await MediaLibrary.getAssetInfoAsync(uri);
      if (asset) {
        await MediaLibrary.deleteAssetsAsync([asset]);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  }

  generateThumbnail(uri: string, size: { width: number; height: number }): string {
    // For now, return the original URI
    // In a production app, you might want to use a library like expo-image-manipulator
    // to create actual thumbnails
    return uri;
  }

  async getImageDimensions(uri: string): Promise<{ width: number; height: number } | null> {
    try {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = uri;
      });
    } catch (error) {
      console.error('Error getting image dimensions:', error);
      return null;
    }
  }

  async validateImageUri(uri: string): Promise<boolean> {
    try {
      const response = await fetch(uri, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Extract metadata from image
  async extractMetadata(uri: string): Promise<any> {
    try {
      const asset = await MediaLibrary.getAssetInfoAsync(uri);
      return asset ? asset.exif : null;
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return null;
    }
  }

  // Create photo with AI analysis placeholder
  async analyzePhoto(uri: string): Promise<{
    cropHealth?: 'healthy' | 'stressed' | 'diseased';
    pestDetection?: string[];
    growthStage?: string;
    recommendations?: string[];
  } | null> {
    try {
      // Placeholder for AI analysis
      // In production, this would call an AI service
      return {
        cropHealth: 'healthy',
        pestDetection: [],
        growthStage: 'vegetative',
        recommendations: ['Continue current care routine'],
      };
    } catch (error) {
      console.error('Error analyzing photo:', error);
      return null;
    }
  }

  // Batch operations
  async takeMultiplePhotos(
    cameraRef: Camera.CameraView,
    count: number,
    interval: number = 1000,
    options: {
      farmId?: string;
      fieldId?: string;
      cropId?: string;
      description?: string;
    } = {}
  ): Promise<PhotoMetadata[]> {
    const photos: PhotoMetadata[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const photo = await this.takePicture(cameraRef, {
          ...options,
          description: `${options.description || 'Batch photo'} ${i + 1}/${count}`,
        });

        if (photo) {
          photos.push(photo);
        }

        // Wait for interval before next photo (except for last photo)
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      } catch (error) {
        console.error(`Error taking photo ${i + 1}:`, error);
      }
    }

    return photos;
  }

  // Time-lapse functionality
  async startTimeLapse(
    cameraRef: Camera.CameraView,
    duration: number, // in milliseconds
    interval: number = 5000, // 5 seconds
    options: {
      farmId?: string;
      fieldId?: string;
      cropId?: string;
      description?: string;
    } = {}
  ): Promise<PhotoMetadata[]> {
    const photos: PhotoMetadata[] = [];
    const startTime = Date.now();
    const endTime = startTime + duration;

    while (Date.now() < endTime) {
      try {
        const photo = await this.takePicture(cameraRef, {
          ...options,
          description: `${options.description || 'Time-lapse'} - ${new Date().toISOString()}`,
        });

        if (photo) {
          photos.push(photo);
        }

        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        console.error('Error in time-lapse capture:', error);
      }
    }

    return photos;
  }
}

export const cameraService = new CameraService();