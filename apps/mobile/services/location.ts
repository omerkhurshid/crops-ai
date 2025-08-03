import * as Location from 'expo-location';

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface FieldBoundary {
  id: string;
  fieldId: string;
  coordinates: GeoPosition[];
  area: number; // in hectares
  createdAt: string;
}

class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private isTracking = false;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return false;
      }

      // Request background location for field mapping
      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus.status !== 'granted') {
        console.log('Background location permission denied');
        // Background permission is not critical, continue with foreground
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentPosition(): Promise<GeoPosition | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000, // 10 seconds
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current position:', error);
      return null;
    }
  }

  async startTracking(onLocationUpdate: (position: GeoPosition) => void): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      if (this.isTracking) {
        await this.stopTracking();
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 2, // Update every 2 meters
        },
        (location) => {
          const position: GeoPosition = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            altitude: location.coords.altitude || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
            timestamp: location.timestamp,
          };
          onLocationUpdate(position);
        }
      );

      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  async stopTracking(): Promise<void> {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
    this.isTracking = false;
  }

  getTrackingStatus(): boolean {
    return this.isTracking;
  }

  // Calculate distance between two points in meters
  calculateDistance(pos1: GeoPosition, pos2: GeoPosition): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = pos1.latitude * Math.PI / 180;
    const φ2 = pos2.latitude * Math.PI / 180;
    const Δφ = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const Δλ = (pos2.longitude - pos1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Calculate area of a polygon in square meters using shoelace formula
  calculatePolygonArea(coordinates: GeoPosition[]): number {
    if (coordinates.length < 3) return 0;

    let area = 0;
    const R = 6371000; // Earth's radius in meters

    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      
      const lat1 = coordinates[i].latitude * Math.PI / 180;
      const lat2 = coordinates[j].latitude * Math.PI / 180;
      const lon1 = coordinates[i].longitude * Math.PI / 180;
      const lon2 = coordinates[j].longitude * Math.PI / 180;

      area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = Math.abs(area) * R * R / 2.0;
    return area; // Returns area in square meters
  }

  // Convert square meters to hectares
  squareMetersToHectares(sqMeters: number): number {
    return sqMeters / 10000;
  }

  // Check if a point is inside a polygon (for field boundary detection)
  isPointInPolygon(point: GeoPosition, polygon: GeoPosition[]): boolean {
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].latitude;
      const yi = polygon[i].longitude;
      const xj = polygon[j].latitude;
      const yj = polygon[j].longitude;
      
      if (((yi > point.longitude) !== (yj > point.longitude)) &&
          (point.latitude < (xj - xi) * (point.longitude - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  // Get approximate address from coordinates (reverse geocoding)
  async getAddressFromCoordinates(position: GeoPosition): Promise<string | null> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: position.latitude,
        longitude: position.longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const parts = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.postalCode,
          address.country
        ].filter(Boolean);
        
        return parts.join(', ');
      }

      return null;
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      return null;
    }
  }

  // Get coordinates from address (geocoding)
  async getCoordinatesFromAddress(address: string): Promise<GeoPosition | null> {
    try {
      const locations = await Location.geocodeAsync(address);
      
      if (locations.length > 0) {
        const location = locations[0];
        return {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting coordinates from address:', error);
      return null;
    }
  }

  // Simplify GPS track (reduce number of points while maintaining accuracy)
  simplifyTrack(coordinates: GeoPosition[], tolerance: number = 5): GeoPosition[] {
    if (coordinates.length <= 2) return coordinates;

    // Douglas-Peucker algorithm implementation
    let maxDistance = 0;
    let maxIndex = 0;

    for (let i = 1; i < coordinates.length - 1; i++) {
      const distance = this.distanceToLine(
        coordinates[i],
        coordinates[0],
        coordinates[coordinates.length - 1]
      );
      
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    if (maxDistance > tolerance) {
      const left = this.simplifyTrack(coordinates.slice(0, maxIndex + 1), tolerance);
      const right = this.simplifyTrack(coordinates.slice(maxIndex), tolerance);
      
      return [...left.slice(0, -1), ...right];
    } else {
      return [coordinates[0], coordinates[coordinates.length - 1]];
    }
  }

  // Calculate perpendicular distance from point to line
  private distanceToLine(point: GeoPosition, lineStart: GeoPosition, lineEnd: GeoPosition): number {
    const A = point.latitude - lineStart.latitude;
    const B = point.longitude - lineStart.longitude;
    const C = lineEnd.latitude - lineStart.latitude;
    const D = lineEnd.longitude - lineStart.longitude;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return this.calculateDistance(point, lineStart);

    const param = dot / lenSq;
    
    let closestPoint: GeoPosition;
    if (param < 0) {
      closestPoint = lineStart;
    } else if (param > 1) {
      closestPoint = lineEnd;
    } else {
      closestPoint = {
        latitude: lineStart.latitude + param * C,
        longitude: lineStart.longitude + param * D,
        timestamp: point.timestamp,
      };
    }

    return this.calculateDistance(point, closestPoint);
  }
}

export const locationService = new LocationService();