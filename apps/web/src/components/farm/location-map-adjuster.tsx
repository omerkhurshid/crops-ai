'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ZoomIn, ZoomOut, Maximize2, Move, MapPin, 
  Satellite, Map as MapIcon, Check, Info
} from 'lucide-react';

interface LocationMapAdjusterProps {
  initialLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  onLocationConfirm: (location: { lat: number; lng: number; zoom: number }) => void;
  onBack: () => void;
}

export function LocationMapAdjuster({ 
  initialLocation, 
  onLocationConfirm,
  onBack 
}: LocationMapAdjusterProps) {
  const [location, setLocation] = useState(initialLocation);
  const [zoom, setZoom] = useState(15); // Default zoom for farm-level view
  const [mapType, setMapType] = useState<'satellite' | 'hybrid' | 'terrain'>('satellite');
  const [isDragging, setIsDragging] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  // Simulated map bounds for demonstration
  const [mapBounds, setMapBounds] = useState({
    north: location.lat + 0.05,
    south: location.lat - 0.05,
    east: location.lng + 0.05,
    west: location.lng - 0.05
  });

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 5));
  };

  const handleMapTypeToggle = () => {
    const types: Array<'satellite' | 'hybrid' | 'terrain'> = ['satellite', 'hybrid', 'terrain'];
    const currentIndex = types.indexOf(mapType);
    setMapType(types[(currentIndex + 1) % types.length]);
  };

  const handleLocationUpdate = (lat: number, lng: number) => {
    setLocation({ ...location, lat, lng });
    setMapBounds({
      north: lat + (0.05 / Math.pow(2, zoom - 15)),
      south: lat - (0.05 / Math.pow(2, zoom - 15)),
      east: lng + (0.05 / Math.pow(2, zoom - 15)),
      west: lng - (0.05 / Math.pow(2, zoom - 15))
    });
  };

  const handleConfirm = () => {
    onLocationConfirm({ ...location, zoom });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch(e.key) {
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
        case '_':
          handleZoomOut();
          break;
        case 'ArrowUp':
          handleLocationUpdate(location.lat + 0.001, location.lng);
          break;
        case 'ArrowDown':
          handleLocationUpdate(location.lat - 0.001, location.lng);
          break;
        case 'ArrowLeft':
          handleLocationUpdate(location.lat, location.lng - 0.001);
          break;
        case 'ArrowRight':
          handleLocationUpdate(location.lat, location.lng + 0.001);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [location, zoom]);

  return (
    <div className="space-y-4">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl font-light">Adjust Your Farm Location</CardTitle>
          <p className="text-sm text-gray-600">
            Pan and zoom the map to center your farm. We&apos;ll automatically detect field boundaries from satellite imagery.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Map Container */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
            {/* Simulated Map View */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200">
              {/* Map Controls */}
              <div className="absolute top-4 right-4 space-y-2 z-10">
                <div className="bg-white rounded-lg shadow-md p-1 space-y-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleZoomIn}
                    className="w-10 h-10 p-0"
                    title="Zoom In (+ key)"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleZoomOut}
                    className="w-10 h-10 p-0"
                    title="Zoom Out (- key)"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleMapTypeToggle}
                  className="bg-white shadow-md"
                  title="Toggle Map Type"
                >
                  {mapType === 'satellite' && <Satellite className="h-4 w-4" />}
                  {mapType === 'hybrid' && <MapIcon className="h-4 w-4" />}
                  {mapType === 'terrain' && <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>

              {/* Center Marker */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <MapPin className="h-12 w-12 text-red-600 drop-shadow-lg" />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                    <Move className="h-3 w-3 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Simulated Satellite Imagery */}
              <div className="absolute inset-0 opacity-30">
                <div className="grid grid-cols-8 grid-rows-8 h-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`border border-green-300 ${
                        Math.random() > 0.7 ? 'bg-green-400' : 'bg-green-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Location Info Overlay */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
                <div className="text-sm space-y-1">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      Zoom: {zoom}x
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {mapType}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Help Tooltip */}
              {showHelp && (
                <div className="absolute top-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-xs">
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">Quick Tips:</p>
                      <ul className="space-y-0.5">
                        <li>• Click and drag to pan the map</li>
                        <li>• Use +/- keys or buttons to zoom</li>
                        <li>• Arrow keys for fine adjustment</li>
                        <li>• Switch between map types for clarity</li>
                      </ul>
                    </div>
                    <button
                      onClick={() => setShowHelp(false)}
                      className="text-blue-600 hover:text-blue-800 -mt-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drag Instruction */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
                Click and drag to move • Scroll to zoom
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Coverage Area</h4>
              <p className="text-sm text-gray-600">
                ~{Math.round(Math.pow(2, 20 - zoom) * 10)} acres visible
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Image Quality</h4>
              <p className="text-sm text-gray-600">
                {zoom >= 17 ? 'High Resolution' : zoom >= 15 ? 'Good' : 'Overview'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Last Updated</h4>
              <p className="text-sm text-gray-600">
                Satellite: 3 days ago
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                Position your farm in the center
              </span>
              <Button
                onClick={handleConfirm}
                className="bg-sage-600 hover:bg-sage-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm Location
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}