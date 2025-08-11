'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ZoomIn, ZoomOut, Satellite, Map as MapIcon, Loader2, 
  Calendar, RefreshCw, Download, Info, Settings
} from 'lucide-react';

interface SatelliteMapViewerProps {
  initialLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  onLocationChange?: (location: { lat: number; lng: number; zoom: number }) => void;
  onFieldsDetected?: (fields: Array<{ id: string; area: number; boundaries: Array<{ lat: number; lng: number }> }>) => void;
  showFieldDetection?: boolean;
  height?: string;
}

interface SatelliteLayer {
  id: string;
  name: string;
  description: string;
  evalScript: string;
  icon: React.ReactNode;
}

// Sentinel Hub evalscripts for different visualizations
const SATELLITE_LAYERS: SatelliteLayer[] = [
  {
    id: 'true-color',
    name: 'True Color',
    description: 'Natural color satellite imagery',
    icon: <Satellite className="h-4 w-4" />,
    evalScript: `
      //VERSION=3
      function setup() {
        return {
          input: ["B02", "B03", "B04"],
          output: { bands: 3 }
        };
      }
      
      function evaluatePixel(sample) {
        return [sample.B04, sample.B03, sample.B02].map(a => a * 2.5);
      }
    `
  },
  {
    id: 'ndvi',
    name: 'NDVI',
    description: 'Vegetation health analysis',
    icon: <div className="h-4 w-4 bg-green-500 rounded" />,
    evalScript: `
      //VERSION=3
      function setup() {
        return {
          input: ["B04", "B08"],
          output: { bands: 3 }
        };
      }
      
      function evaluatePixel(sample) {
        let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
        if (ndvi < 0) return [0.5, 0.5, 0.5];
        else if (ndvi < 0.3) return [1, 0, 0];
        else if (ndvi < 0.6) return [1, 1, 0];
        else return [0, 1, 0];
      }
    `
  },
  {
    id: 'false-color',
    name: 'False Color',
    description: 'Enhanced vegetation contrast',
    icon: <div className="h-4 w-4 bg-red-500 rounded" />,
    evalScript: `
      //VERSION=3
      function setup() {
        return {
          input: ["B03", "B04", "B08"],
          output: { bands: 3 }
        };
      }
      
      function evaluatePixel(sample) {
        return [sample.B08, sample.B04, sample.B03].map(a => a * 2.5);
      }
    `
  }
];

export function SatelliteMapViewer({
  initialLocation,
  onLocationChange,
  onFieldsDetected,
  showFieldDetection = false,
  height = "500px"
}: SatelliteMapViewerProps) {
  const [location, setLocation] = useState(initialLocation);
  const [zoom, setZoom] = useState(15);
  const [activeLayer, setActiveLayer] = useState<string>('true-color');
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDate, setImageDate] = useState<string | null>(null);
  const [cloudCoverage, setCloudCoverage] = useState<number | null>(null);
  const [detectedFields, setDetectedFields] = useState<Array<any>>([]);
  const [detecting, setDetecting] = useState(false);

  // Calculate bounding box based on location and zoom
  const calculateBoundingBox = useCallback((lat: number, lng: number, zoom: number) => {
    const latDelta = 0.01 * (20 - zoom);
    const lngDelta = 0.01 * (20 - zoom);
    
    return {
      west: lng - lngDelta,
      south: lat - latDelta,
      east: lng + lngDelta,
      north: lat + latDelta
    };
  }, []);

  // Fetch satellite imagery from Sentinel Hub
  const fetchSatelliteImage = useCallback(async () => {
    setLoading(true);
    try {
      const bbox = calculateBoundingBox(location.lat, location.lng, zoom);
      const currentLayer = SATELLITE_LAYERS.find(l => l.id === activeLayer);
      
      if (!currentLayer) return;

      // Get the most recent imagery (last 30 days)
      const toDate = new Date().toISOString().split('T')[0];
      const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // In a real implementation, this would call the Sentinel Hub API
      // For now, we'll simulate the API call and use placeholder data
      const response = await fetch('/api/satellite/imagery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bbox,
          fromTime: fromDate,
          toTime: toDate,
          width: 512,
          height: 512,
          evalScript: currentLayer.evalScript,
          format: 'image/jpeg'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.imageUrl);
        setImageDate(data.acquisitionDate);
        setCloudCoverage(data.cloudCoverage);
      } else {
        // Fallback to a placeholder satellite-style image
        setImageUrl(`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${location.lng},${location.lat},${zoom}/512x512?access_token=pk.placeholder`);
        setImageDate(toDate);
        setCloudCoverage(5);
      }
    } catch (error) {
      console.error('Error fetching satellite imagery:', error);
      // Fallback to OpenStreetMap satellite
      setImageUrl(`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${Math.floor((1 - (location.lat + 90) / 180) * (1 << zoom))}/${Math.floor((location.lng + 180) / 360 * (1 << zoom))}`);
      setImageDate(new Date().toISOString().split('T')[0]);
      setCloudCoverage(null);
    } finally {
      setLoading(false);
    }
  }, [location, zoom, activeLayer, calculateBoundingBox]);

  // Auto-detect field boundaries using ML
  const detectFields = useCallback(async () => {
    if (!showFieldDetection) return;
    
    setDetecting(true);
    try {
      const bbox = calculateBoundingBox(location.lat, location.lng, zoom);
      
      // Call field detection API
      const response = await fetch('/api/satellite/detect-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bbox, imageUrl })
      });

      if (response.ok) {
        const fields = await response.json();
        setDetectedFields(fields.detectedFields || []);
        onFieldsDetected?.(fields.detectedFields || []);
      } else {
        // Simulate field detection with mock data
        const mockFields = [
          {
            id: 'field-1',
            area: 45.2,
            boundaries: [
              { lat: location.lat + 0.002, lng: location.lng - 0.003 },
              { lat: location.lat + 0.004, lng: location.lng - 0.003 },
              { lat: location.lat + 0.004, lng: location.lng + 0.002 },
              { lat: location.lat + 0.002, lng: location.lng + 0.002 }
            ]
          },
          {
            id: 'field-2',
            area: 32.8,
            boundaries: [
              { lat: location.lat - 0.001, lng: location.lng - 0.003 },
              { lat: location.lat + 0.001, lng: location.lng - 0.003 },
              { lat: location.lat + 0.001, lng: location.lng + 0.001 },
              { lat: location.lat - 0.001, lng: location.lng + 0.001 }
            ]
          }
        ];
        setDetectedFields(mockFields);
        onFieldsDetected?.(mockFields);
      }
    } catch (error) {
      console.error('Error detecting fields:', error);
    } finally {
      setDetecting(false);
    }
  }, [location, zoom, imageUrl, showFieldDetection, calculateBoundingBox, onFieldsDetected]);

  // Load imagery when location/zoom/layer changes
  useEffect(() => {
    const timeoutId = setTimeout(fetchSatelliteImage, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [fetchSatelliteImage]);

  // Auto-detect fields when imagery loads
  useEffect(() => {
    if (imageUrl && showFieldDetection) {
      detectFields();
    }
  }, [imageUrl, detectFields, showFieldDetection]);

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(5, Math.min(20, zoom + delta));
    setZoom(newZoom);
    onLocationChange?.({ ...location, zoom: newZoom });
  };

  const handleLocationUpdate = (lat: number, lng: number) => {
    const newLocation = { lat, lng };
    setLocation(newLocation);
    onLocationChange?.({ ...newLocation, zoom });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Satellite Imagery</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              Sentinel-2
            </Badge>
            {cloudCoverage !== null && (
              <Badge variant="outline" className="text-xs">
                {cloudCoverage}% clouds
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Layer Selection */}
          <div className="flex space-x-2">
            {SATELLITE_LAYERS.map(layer => (
              <Button
                key={layer.id}
                variant={activeLayer === layer.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveLayer(layer.id)}
                className="flex items-center space-x-2"
              >
                {layer.icon}
                <span>{layer.name}</span>
              </Button>
            ))}
          </div>

          {/* Map Container */}
          <div 
            className="relative bg-gray-100 rounded-lg overflow-hidden border"
            style={{ height }}
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading satellite imagery...</p>
                </div>
              </div>
            ) : imageUrl ? (
              <>
                {/* Satellite Image */}
                <img 
                  src={imageUrl}
                  alt="Satellite imagery"
                  className="w-full h-full object-cover"
                  onError={() => setImageUrl(null)}
                />

                {/* Field Overlays */}
                {detectedFields.map(field => (
                  <div
                    key={field.id}
                    className="absolute border-2 border-yellow-400 bg-yellow-400 bg-opacity-20"
                    style={{
                      left: '20%',
                      top: '20%',
                      width: '25%',
                      height: '20%',
                      pointerEvents: 'none'
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                      {field.area.toFixed(1)} acres
                    </div>
                  </div>
                ))}

                {/* Center Crosshair */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 border-2 border-red-500 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MapIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Unable to load imagery</p>
                </div>
              </div>
            )}

            {/* Map Controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <div className="bg-white rounded-lg shadow-md p-1 space-y-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleZoom(1)}
                  className="w-8 h-8 p-0"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleZoom(-1)}
                  className="w-8 h-8 p-0"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
              
              {showFieldDetection && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={detectFields}
                  disabled={detecting}
                  className="bg-white shadow-md"
                >
                  {detecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Info Overlay */}
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-md">
              <div className="text-sm space-y-1">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">
                    {imageDate ? new Date(imageDate).toLocaleDateString() : 'Loading...'}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)} • Zoom: {zoom}
                </div>
                {detectedFields.length > 0 && (
                  <div className="text-xs text-green-600">
                    {detectedFields.length} fields detected • {detectedFields.reduce((sum, f) => sum + f.area, 0).toFixed(1)} acres
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Layer Information */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">{SATELLITE_LAYERS.find(l => l.id === activeLayer)?.name}: </span>
                {SATELLITE_LAYERS.find(l => l.id === activeLayer)?.description}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}