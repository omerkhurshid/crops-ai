import { NextRequest } from 'next/server';
import { z } from 'zod';
import { weatherService } from '../../../lib/weather/service';
import { weatherAlerts } from '../../../lib/weather/alerts';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../lib/api/middleware';

const alertsSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: z.enum(['basic', 'advanced', 'field', 'multi-location']).optional(),
  // For field analysis
  fieldBoundary: z.array(z.object({
    latitude: z.number(),
    longitude: z.number()
  })).optional(),
  // For multi-location monitoring
  locations: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    name: z.string().optional()
  })).optional(),
  // Custom thresholds
  thresholds: z.object({
    frost: z.object({
      temperature: z.number().optional(),
      humidity: z.number().optional(),
      windSpeed: z.number().optional()
    }).optional(),
    heat: z.object({
      temperature: z.number().optional(),
      duration: z.number().optional(),
      heatIndex: z.number().optional()
    }).optional(),
    wind: z.object({
      speed: z.number().optional(),
      gustSpeed: z.number().optional(),
      duration: z.number().optional()
    }).optional(),
    precipitation: z.object({
      intensity: z.number().optional(),
      total: z.number().optional(),
      duration: z.number().optional()
    }).optional(),
    drought: z.object({
      precipitationDays: z.number().optional(),
      soilMoisture: z.number().optional(),
      temperature: z.number().optional()
    }).optional()
  }).optional()
});

// Helper functions for calculating statistics
function calculateSeverityBreakdown(alerts: any[]) {
  const breakdown = { minor: 0, moderate: 0, severe: 0, extreme: 0 };
  alerts.forEach(alert => {
    breakdown[alert.severity as keyof typeof breakdown]++;
  });
  return breakdown;
}

function calculateAlertTypeBreakdown(alerts: any[]) {
  const breakdown: Record<string, number> = {};
  alerts.forEach(alert => {
    breakdown[alert.alertType] = (breakdown[alert.alertType] || 0) + 1;
  });
  return breakdown;
}

// GET /api/weather/alerts?latitude=40.7128&longitude=-74.0060&type=advanced
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      
      const latitude = parseFloat(searchParams.get('latitude') || '');
      const longitude = parseFloat(searchParams.get('longitude') || '');
      const type = searchParams.get('type') || 'basic';
      
      // Parse field boundary if provided
      const fieldBoundaryParam = searchParams.get('fieldBoundary');
      let fieldBoundary;
      if (fieldBoundaryParam) {
        try {
          fieldBoundary = JSON.parse(fieldBoundaryParam);
        } catch {
          throw new ValidationError('Invalid fieldBoundary format. Must be valid JSON array.');
        }
      }

      // Parse locations if provided
      const locationsParam = searchParams.get('locations');
      let locations;
      if (locationsParam) {
        try {
          locations = JSON.parse(locationsParam);
        } catch {
          throw new ValidationError('Invalid locations format. Must be valid JSON array.');
        }
      }

      // Parse custom thresholds if provided
      const thresholdsParam = searchParams.get('thresholds');
      let thresholds;
      if (thresholdsParam) {
        try {
          thresholds = JSON.parse(thresholdsParam);
        } catch {
          throw new ValidationError('Invalid thresholds format. Must be valid JSON object.');
        }
      }

      // Validate input
      const validation = alertsSchema.safeParse({
        latitude,
        longitude,
        type,
        fieldBoundary,
        locations,
        thresholds
      });

      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
      }

      let result;

      switch (type) {
        case 'basic':
          // Use original weather service alerts for backward compatibility
          result = await weatherService.getWeatherAlerts(latitude, longitude);
          break;

        case 'advanced':
          result = await weatherAlerts.monitorWeatherConditions(
            latitude,
            longitude,
            thresholds
          );
          break;

        case 'field':
          if (!fieldBoundary || !Array.isArray(fieldBoundary) || fieldBoundary.length < 3) {
            throw new ValidationError('Field boundary must be an array of at least 3 coordinate points');
          }
          result = await weatherAlerts.getFieldAlerts(fieldBoundary);
          break;

        case 'multi-location':
          if (!locations || !Array.isArray(locations) || locations.length === 0) {
            throw new ValidationError('Locations must be an array with at least one location');
          }
          result = await weatherAlerts.getMultiLocationAlerts(locations);
          break;

        default:
          throw new ValidationError('Invalid alert monitoring type');
      }

      // Calculate summary statistics for advanced alerts
      const summary = (type === 'advanced' || type === 'field') && Array.isArray(result)
        ? {
            totalAlerts: result.length,
            activeAlertsCount: result.filter((alert: any) => alert.isActive).length,
            severityBreakdown: calculateSeverityBreakdown(result),
            alertTypeBreakdown: calculateAlertTypeBreakdown(result),
            highestPriority: result.length > 0 ? Math.max(...result.map((alert: any) => alert.priority)) : 0
          }
        : type === 'multi-location' && Array.isArray(result)
        ? {
            totalLocations: result.length,
            totalAlerts: result.reduce((sum, loc: any) => sum + loc.alerts.length, 0),
            severityBreakdown: calculateSeverityBreakdown(
              result.flatMap((loc: any) => loc.alerts)
            ),
            alertTypeBreakdown: calculateAlertTypeBreakdown(
              result.flatMap((loc: any) => loc.alerts)
            )
          }
        : {
            activeAlertsCount: Array.isArray(result) ? result.filter((alert: any) => alert.isActive).length : 0
          };

      return createSuccessResponse({
        alerts: result,
        summary,
        type,
        location: { latitude, longitude },
        parameters: {
          customThresholds: !!thresholds,
          fieldPoints: type === 'field' ? fieldBoundary?.length : undefined,
          locationCount: type === 'multi-location' ? locations?.length : undefined
        },
        message: `Weather alerts (${type}) retrieved successfully`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);