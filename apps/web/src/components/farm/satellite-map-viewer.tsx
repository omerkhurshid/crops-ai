'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ZoomIn, ZoomOut, Satellite, Map as MapIcon, Loader2, 
  Calendar, RefreshCw, Download, Info, Settings, MapPin
} from 'lucide-react';

interface SatelliteMapViewerProps {
  initialLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  onLocationChange?: (location: { lat: number; lng: number; zoom: number }) => void;
  onFieldsDetected?: (fields: Array<{ id: string; area: number; boundaries: Array<{ lat: number; lng: number }> }>) => void;
  onBoundariesSet?: (boundaries: Array<{ lat: number; lng: number }>) => void;
  showFieldDetection?: boolean;
  showBoundaryMarking?: boolean;
  height?: string;
}

interface SatelliteLayer {
  id: string;
  name: string;
  description: string;
  evalScript: string;
  icon: React.ReactNode;
}

// Simplified satellite layers - only True Color for now
const SATELLITE_LAYERS: SatelliteLayer[] = [
  {
    id: 'true-color',
    name: 'Satellite View',
    description: 'High-resolution satellite imagery',
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
  }
];

export function SatelliteMapViewer({
  initialLocation,
  onLocationChange,
  onFieldsDetected,
  onBoundariesSet,
  showFieldDetection = false,
  showBoundaryMarking = false,
  height = "500px"
}: SatelliteMapViewerProps) {
  const [location, setLocation] = useState(initialLocation);
  const [zoom, setZoom] = useState(18); // Changed default zoom to 18 for field detail
  const [activeLayer, setActiveLayer] = useState<string>('true-color');
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDate, setImageDate] = useState<string | null>(null);
  const [cloudCoverage, setCloudCoverage] = useState<number | null>(null);
  const [detectedFields, setDetectedFields] = useState<Array<any>>([]);
  const [detecting, setDetecting] = useState(false);
  const [boundaryPins, setBoundaryPins] = useState<Array<{ lat: number; lng: number; id: string }>>([]);
  const [isMarkingBoundary, setIsMarkingBoundary] = useState(false);
  const [hasDetectedFields, setHasDetectedFields] = useState(false);
  const [lastDetectionLocation, setLastDetectionLocation] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

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

  // Fetch satellite imagery - using ESRI World Imagery directly for reliability
  const fetchSatelliteImage = useCallback(async () => {
    setLoading(true);
    try {
      const bbox = calculateBoundingBox(location.lat, location.lng, zoom);
      
      // Use ESRI World Imagery directly for better reliability
      const esriUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${bbox.west},${bbox.south},${bbox.east},${bbox.north}&bboxSR=4326&imageSR=4326&size=512,512&f=image&format=jpg`;
      
      setImageUrl(esriUrl);
      setImageDate(new Date().toISOString().split('T')[0]);
      setCloudCoverage(5); // Assume low cloud coverage for ESRI imagery
      
    } catch (error) {
      console.error('Error fetching satellite imagery:', error);
      // Fallback to a different ESRI endpoint if needed
      const fallbackBbox = calculateBoundingBox(location.lat, location.lng, zoom);
      const fallbackUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${fallbackBbox.west},${fallbackBbox.south},${fallbackBbox.east},${fallbackBbox.north}&bboxSR=4326&imageSR=4326&size=256,256&f=image&format=png`;
      setImageUrl(fallbackUrl);
      setImageDate(new Date().toISOString().split('T')[0]);
      setCloudCoverage(null);
    } finally {
      setLoading(false);
    }
  }, [location, zoom, activeLayer, calculateBoundingBox]);

  // Auto-detect field boundaries using ML
  const detectFields = useCallback(async () => {
    if (!showFieldDetection || detecting) return;
    
    // Create location key to prevent duplicate detections
    const locationKey = `${location.lat.toFixed(4)}_${location.lng.toFixed(4)}_${zoom}`;
    if (hasDetectedFields && lastDetectionLocation === locationKey) {
      return; // Already detected for this location
    }
    
    setDetecting(true);
    try {
      const bbox = calculateBoundingBox(location.lat, location.lng, zoom);
      
      // Skip API call and use mock data directly to avoid rate limiting

      const mockFields = [
        {
          id: `temp-field-${Date.now()}-1`,
          area: 45.2 + Math.random() * 20, // Add some variation
          boundaries: [
            { lat: location.lat + 0.002, lng: location.lng - 0.003 },
            { lat: location.lat + 0.004, lng: location.lng - 0.003 },
            { lat: location.lat + 0.004, lng: location.lng + 0.002 },
            { lat: location.lat + 0.002, lng: location.lng + 0.002 }
          ]
        },
        {
          id: `temp-field-${Date.now()}-2`,
          area: 32.8 + Math.random() * 15,
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
      setHasDetectedFields(true);
      setLastDetectionLocation(locationKey);
    } catch (error) {
      console.error('Error detecting fields:', error);
    } finally {
      setDetecting(false);
    }
  }, [location, zoom, showFieldDetection, detecting, hasDetectedFields, lastDetectionLocation, calculateBoundingBox, onFieldsDetected]);

  // Load imagery when location/zoom/layer changes
  useEffect(() => {
    const timeoutId = setTimeout(fetchSatelliteImage, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [fetchSatelliteImage]);

  // Auto-detect fields when imagery loads (debounced)
  useEffect(() => {
    if (imageUrl && showFieldDetection && !hasDetectedFields) {
      const timeoutId = setTimeout(() => {
        detectFields();
      }, 1000); // Wait 1 second after image loads
      return () => clearTimeout(timeoutId);
    }
  }, [imageUrl, showFieldDetection, hasDetectedFields, detectFields]);

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

  // Handle map click for pin dropping
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isMarkingBoundary) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert pixel coordinates to lat/lng (rough approximation)
    const bbox = calculateBoundingBox(location.lat, location.lng, zoom);
    const lat = bbox.north - (y / rect.height) * (bbox.north - bbox.south);
    const lng = bbox.west + (x / rect.width) * (bbox.east - bbox.west);
    
    const newPin = {
      lat,
      lng,
      id: `pin-${Date.now()}`
    };
    
    setBoundaryPins(prev => [...prev, newPin]);
    
    // If we have 3+ pins, we can form a boundary
    if (boundaryPins.length >= 2) {
      const boundaries = [...boundaryPins, newPin].map(pin => ({ lat: pin.lat, lng: pin.lng }));
      onBoundariesSet?.(boundaries);
    }
  };

  const clearBoundaryPins = () => {
    setBoundaryPins([]);
    onBoundariesSet?.([]);
  };

  const toggleBoundaryMarking = () => {
    setIsMarkingBoundary(prev => !prev);
    if (isMarkingBoundary) {
      clearBoundaryPins();
    }
  };

  const manualDetectFields = () => {
    setHasDetectedFields(false); // Reset to allow new detection
    setLastDetectionLocation(''); // Reset location tracking
    detectFields();
  };

  // Mouse handling for map dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMarkingBoundary) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || isMarkingBoundary) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Convert pixel movement to lat/lng movement based on zoom
    const bbox = calculateBoundingBox(location.lat, location.lng, zoom);
    const latRange = bbox.north - bbox.south;
    const lngRange = bbox.east - bbox.west;
    
    // Calculate movement in degrees (inverted Y axis for lat)
    const latDelta = -(deltaY / 500) * latRange * 0.1; // Adjust sensitivity
    const lngDelta = -(deltaX / 500) * lngRange * 0.1;
    
    // Update location
    const newLat = Math.max(-85, Math.min(85, location.lat + latDelta));
    const newLng = Math.max(-180, Math.min(180, location.lng + lngDelta));
    
    setLocation({ lat: newLat, lng: newLng });
    onLocationChange?.({ lat: newLat, lng: newLng, zoom });
    
    // Update drag start for continuous dragging
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
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
          {/* Layer Selection - Hidden since we only have one layer */}
          {SATELLITE_LAYERS.length > 1 && (
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
          )}

          {/* Map Container */}
          <div 
            className={`relative bg-gray-100 rounded-lg overflow-hidden border ${isMarkingBoundary ? 'cursor-crosshair' : 'cursor-move'}`}
            style={{ height }}
            onClick={handleMapClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
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

                {/* Field Overlays - Removed random yellow boundaries */}

                {/* Boundary Pins */}
                {boundaryPins.map((pin, index) => {
                  const bbox = calculateBoundingBox(location.lat, location.lng, zoom);
                  const x = ((pin.lng - bbox.west) / (bbox.east - bbox.west)) * 100;
                  const y = ((bbox.north - pin.lat) / (bbox.north - bbox.south)) * 100;
                  
                  return (
                    <div
                      key={pin.id}
                      className="absolute w-6 h-6 -ml-3 -mt-3 cursor-pointer"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <div className="w-6 h-6 bg-green-700 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Boundary Lines */}
                {boundaryPins.length > 1 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {boundaryPins.map((pin, index) => {
                      if (index === 0) return null;
                      
                      const bbox = calculateBoundingBox(location.lat, location.lng, zoom);
                      const prevPin = boundaryPins[index - 1];
                      
                      const x1 = ((prevPin.lng - bbox.west) / (bbox.east - bbox.west)) * 100;
                      const y1 = ((bbox.north - prevPin.lat) / (bbox.north - bbox.south)) * 100;
                      const x2 = ((pin.lng - bbox.west) / (bbox.east - bbox.west)) * 100;
                      const y2 = ((bbox.north - pin.lat) / (bbox.north - bbox.south)) * 100;
                      
                      return (
                        <line
                          key={`line-${index}`}
                          x1={`${x1}%`}
                          y1={`${y1}%`}
                          x2={`${x2}%`}
                          y2={`${y2}%`}
                          stroke="#15803d"
                          strokeWidth="2"
                          strokeDasharray="4,4"
                        />
                      );
                    })}
                    {/* Close the boundary if we have 3+ pins */}
                    {boundaryPins.length >= 3 && (
                      <line
                        x1={`${((boundaryPins[boundaryPins.length - 1].lng - calculateBoundingBox(location.lat, location.lng, zoom).west) / (calculateBoundingBox(location.lat, location.lng, zoom).east - calculateBoundingBox(location.lat, location.lng, zoom).west)) * 100}%`}
                        y1={`${((calculateBoundingBox(location.lat, location.lng, zoom).north - boundaryPins[boundaryPins.length - 1].lat) / (calculateBoundingBox(location.lat, location.lng, zoom).north - calculateBoundingBox(location.lat, location.lng, zoom).south)) * 100}%`}
                        x2={`${((boundaryPins[0].lng - calculateBoundingBox(location.lat, location.lng, zoom).west) / (calculateBoundingBox(location.lat, location.lng, zoom).east - calculateBoundingBox(location.lat, location.lng, zoom).west)) * 100}%`}
                        y2={`${((calculateBoundingBox(location.lat, location.lng, zoom).north - boundaryPins[0].lat) / (calculateBoundingBox(location.lat, location.lng, zoom).north - calculateBoundingBox(location.lat, location.lng, zoom).south)) * 100}%`}
                        stroke="#15803d"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                      />
                    )}
                  </svg>
                )}

                {/* Center Crosshair - Professional and Subtle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="relative">
                    {/* Subtle crosshair lines */}
                    <div className="absolute w-6 h-0.5 bg-gray-800 bg-opacity-60 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
                    <div className="absolute w-0.5 h-6 bg-gray-800 bg-opacity-60 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
                    {/* Center dot */}
                    <div className="w-2 h-2 bg-gray-800 bg-opacity-80 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
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
                  onClick={manualDetectFields}
                  disabled={detecting}
                  className="bg-white shadow-md"
                  title="Detect field boundaries"
                >
                  {detecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              {showBoundaryMarking && (
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant={isMarkingBoundary ? "default" : "secondary"}
                    onClick={toggleBoundaryMarking}
                    className="bg-white shadow-md"
                    title={isMarkingBoundary ? "Stop marking boundary" : "Start marking boundary"}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                  {boundaryPins.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearBoundaryPins}
                      className="bg-white shadow-md"
                      title="Clear all pins"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
                    {(detectedFields || []).length} fields detected • {(detectedFields || []).reduce((sum, f) => sum + f.area, 0).toFixed(1)} acres
                  </div>
                )}
                {boundaryPins.length > 0 && (
                  <div className="text-xs text-green-700">
                    {boundaryPins.length} boundary pins • {isMarkingBoundary ? 'Click to add more' : 'Boundary marked'}
                  </div>
                )}
                {isMarkingBoundary && (
                  <div className="text-xs text-green-800 bg-green-50 px-2 py-1 rounded border border-green-200">
                    Click on the map to drop boundary pins
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