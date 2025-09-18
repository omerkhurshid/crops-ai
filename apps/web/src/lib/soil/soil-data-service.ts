/**
 * Real Soil Data Service
 * Integrates with multiple soil data sources including USDA SSURGO, 
 * IoT sensors, and laboratory analysis systems
 */

import { prisma } from '../prisma'
import { Logger } from '@crops-ai/shared'

export interface SoilProfile {
  fieldId: string
  location: {
    latitude: number
    longitude: number
  }
  soilSeries: string
  soilType: string
  depth: number // cm
  layers: SoilLayer[]
  metadata: {
    source: 'SSURGO' | 'sensor' | 'laboratory' | 'estimated'
    lastUpdated: Date
    confidence: number
  }
}

export interface SoilLayer {
  depth_top: number // cm
  depth_bottom: number // cm
  ph: number
  organic_matter: number // %
  nitrogen: number // ppm
  phosphorus: number // ppm
  potassium: number // ppm
  calcium: number // ppm
  magnesium: number // ppm
  sulfur: number // ppm
  bulk_density: number // g/cm³
  field_capacity: number // %
  wilting_point: number // %
  cec: number // meq/100g
  sand_percent: number
  silt_percent: number
  clay_percent: number
  texture_class: string
  drainage_class: 'very_poor' | 'poor' | 'somewhat_poor' | 'moderate' | 'well' | 'excessive'
}

export interface SoilReading {
  fieldId: string
  sensor_id?: string
  timestamp: Date
  depth: number // cm
  temperature: number // °C
  moisture: number // %
  ph: number
  electrical_conductivity: number // dS/m
  nitrogen: number // ppm
  phosphorus: number // ppm
  potassium: number // ppm
  location: {
    latitude: number
    longitude: number
  }
  quality: 'high' | 'medium' | 'low'
}

export interface USDASSURGOData {
  mukey: string // Map Unit Key
  musym: string // Map Unit Symbol
  muname: string // Map Unit Name
  mukind: string // Map Unit Kind
  component: {
    comppct_l: number // Component Percentage Low
    comppct_r: number // Component Percentage Representative
    comppct_h: number // Component Percentage High
    compname: string // Component Name
    compkind: string // Component Kind
    majcompflag: boolean // Major Component Flag
    hydgrp: string // Hydrologic Group
    taxclname: string // Taxonomic Class Name
    taxorder: string // Taxonomic Order
    taxsubgrp: string // Taxonomic Subgroup
    slope_l: number // Slope Low
    slope_r: number // Slope Representative
    slope_h: number // Slope High
  }
  horizons: Array<{
    chkey: string // Horizon Key
    hzname: string // Horizon Name
    hzdept_l: number // Horizon Depth Top Low
    hzdept_r: number // Horizon Depth Top Representative
    hzdept_h: number // Horizon Depth Top High
    hzdepb_l: number // Horizon Depth Bottom Low
    hzdepb_r: number // Horizon Depth Bottom Representative
    hzdepb_h: number // Horizon Depth Bottom High
    ph1to1h2o_l: number // pH 1:1 Water Low
    ph1to1h2o_r: number // pH 1:1 Water Representative
    ph1to1h2o_h: number // pH 1:1 Water High
    om_l: number // Organic Matter Low
    om_r: number // Organic Matter Representative
    om_h: number // Organic Matter High
    ksat_l: number // Saturated Hydraulic Conductivity Low
    ksat_r: number // Saturated Hydraulic Conductivity Representative
    ksat_h: number // Saturated Hydraulic Conductivity High
    dbthirdbar_l: number // Bulk Density Third Bar Low
    dbthirdbar_r: number // Bulk Density Third Bar Representative
    dbthirdbar_h: number // Bulk Density Third Bar High
    sandtotal_l: number // Total Sand Low
    sandtotal_r: number // Total Sand Representative
    sandtotal_h: number // Total Sand High
    silttotal_l: number // Total Silt Low
    silttotal_r: number // Total Silt Representative
    silttotal_h: number // Total Silt High
    claytotal_l: number // Total Clay Low
    claytotal_r: number // Total Clay Representative
    claytotal_h: number // Total Clay High
    cec7_l: number // CEC 7 Low
    cec7_r: number // CEC 7 Representative
    cec7_h: number // CEC 7 High
    wthirdbar_l: number // Water Content Third Bar Low
    wthirdbar_r: number // Water Content Third Bar Representative
    wthirdbar_h: number // Water Content Third Bar High
    wfifteenbar_l: number // Water Content Fifteen Bar Low
    wfifteenbar_r: number // Water Content Fifteen Bar Representative
    wfifteenbar_h: number // Water Content Fifteen Bar High
  }>
}

class SoilDataService {
  private readonly USDA_WEB_SOIL_SURVEY_URL = 'https://sdmdataaccess.sc.egov.usda.gov'
  private readonly CACHE_TTL = 24 * 60 * 60 // 24 hours

  /**
   * Get comprehensive soil data for a field
   */
  async getFieldSoilData(fieldId: string): Promise<SoilProfile | null> {
    try {
      // Get field location
      const field = await prisma.field.findUnique({
        where: { id: fieldId },
        include: { farm: true }
      })

      if (!field || !field.farm.latitude || !field.farm.longitude) {
        Logger.warn(`Field ${fieldId} not found or missing coordinates`)
        return null
      }

      const location = {
        latitude: field.farm.latitude,
        longitude: field.farm.longitude
      }

      // Try to get recent soil sensor data first
      const sensorData = await this.getRecentSensorData(fieldId)
      if (sensorData && sensorData.length > 0) {
        return await this.buildProfileFromSensorData(fieldId, location, sensorData)
      }

      // Try to get USDA SSURGO data
      const ssurgoData = await this.getSSURGOData(location.latitude, location.longitude)
      if (ssurgoData) {
        return await this.buildProfileFromSSURGO(fieldId, location, ssurgoData)
      }

      // Fallback to estimated data based on regional soil characteristics
      return await this.buildEstimatedProfile(fieldId, location)

    } catch (error) {
      Logger.error(`Error getting soil data for field ${fieldId}:`, error)
      return null
    }
  }

  /**
   * Get real-time soil sensor readings
   */
  async getRecentSensorData(fieldId: string, hours: number = 24): Promise<SoilReading[]> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000)
      
      const readings = await prisma.soilReading.findMany({
        where: {
          fieldId,
          timestamp: {
            gte: since
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 100
      })

      return readings.map(reading => ({
        fieldId: reading.fieldId,
        sensor_id: reading.sensorId || undefined,
        timestamp: reading.timestamp,
        depth: reading.depth,
        temperature: reading.temperature,
        moisture: reading.moisture,
        ph: reading.ph,
        electrical_conductivity: reading.electricalConductivity,
        nitrogen: reading.nitrogen,
        phosphorus: reading.phosphorus,
        potassium: reading.potassium,
        location: {
          latitude: reading.latitude,
          longitude: reading.longitude
        },
        quality: reading.quality as 'high' | 'medium' | 'low'
      }))
    } catch (error) {
      Logger.error(`Error getting sensor data for field ${fieldId}:`, error)
      return []
    }
  }

  /**
   * Get USDA SSURGO soil data from Web Soil Survey
   */
  private async getSSURGOData(latitude: number, longitude: number): Promise<USDASSURGOData | null> {
    try {
      // Check if USDA API access is configured
      if (!process.env.USDA_WSS_API_KEY) {
        Logger.info('USDA Web Soil Survey API not configured, skipping SSURGO data')
        return null
      }

      // Query USDA Web Soil Survey for map unit data
      const query = `
        SELECT TOP 1 
          mu.mukey, mu.musym, mu.muname, mu.mukind,
          co.comppct_l, co.comppct_r, co.comppct_h, co.compname, co.compkind, 
          co.majcompflag, co.hydgrp, co.taxclname, co.taxorder, co.taxsubgrp,
          co.slope_l, co.slope_r, co.slope_h
        FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('POINT(${longitude} ${latitude})') AS i
        INNER JOIN mapunit AS mu ON i.mukey = mu.mukey
        INNER JOIN component AS co ON mu.mukey = co.mukey AND co.majcompflag = 'Yes'
      `

      const response = await fetch(`${this.USDA_WEB_SOIL_SURVEY_URL}/Tabular/post.rest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.USDA_WSS_API_KEY}`
        },
        body: JSON.stringify({
          query: query,
          format: 'JSON'
        })
      })

      if (!response.ok) {
        Logger.warn(`USDA SSURGO query failed: ${response.status}`)
        return null
      }

      const data = await response.json()
      
      if (!data.Table || data.Table.length === 0) {
        Logger.info(`No SSURGO data found for coordinates ${latitude}, ${longitude}`)
        return null
      }

      const mapUnit = data.Table[0]
      
      // Get horizon data for the component
      const horizonQuery = `
        SELECT 
          ch.chkey, ch.hzname, ch.hzdept_l, ch.hzdept_r, ch.hzdept_h,
          ch.hzdepb_l, ch.hzdepb_r, ch.hzdepb_h, ch.ph1to1h2o_l, ch.ph1to1h2o_r, ch.ph1to1h2o_h,
          ch.om_l, ch.om_r, ch.om_h, ch.ksat_l, ch.ksat_r, ch.ksat_h,
          ch.dbthirdbar_l, ch.dbthirdbar_r, ch.dbthirdbar_h,
          ch.sandtotal_l, ch.sandtotal_r, ch.sandtotal_h,
          ch.silttotal_l, ch.silttotal_r, ch.silttotal_h,
          ch.claytotal_l, ch.claytotal_r, ch.claytotal_h,
          ch.cec7_l, ch.cec7_r, ch.cec7_h,
          ch.wthirdbar_l, ch.wthirdbar_r, ch.wthirdbar_h,
          ch.wfifteenbar_l, ch.wfifteenbar_r, ch.wfifteenbar_h
        FROM component AS co
        INNER JOIN chorizon AS ch ON co.cokey = ch.cokey
        WHERE co.mukey = '${mapUnit[0]}'
        ORDER BY ch.hzdept_r
      `

      const horizonResponse = await fetch(`${this.USDA_WEB_SOIL_SURVEY_URL}/Tabular/post.rest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.USDA_WSS_API_KEY}`
        },
        body: JSON.stringify({
          query: horizonQuery,
          format: 'JSON'
        })
      })

      const horizonData = horizonResponse.ok ? await horizonResponse.json() : { Table: [] }

      return {
        mukey: mapUnit[0],
        musym: mapUnit[1],
        muname: mapUnit[2],
        mukind: mapUnit[3],
        component: {
          comppct_l: mapUnit[4],
          comppct_r: mapUnit[5],
          comppct_h: mapUnit[6],
          compname: mapUnit[7],
          compkind: mapUnit[8],
          majcompflag: mapUnit[9] === 'Yes',
          hydgrp: mapUnit[10],
          taxclname: mapUnit[11],
          taxorder: mapUnit[12],
          taxsubgrp: mapUnit[13],
          slope_l: mapUnit[14],
          slope_r: mapUnit[15],
          slope_h: mapUnit[16]
        },
        horizons: (horizonData.Table || []).map((h: any[]) => ({
          chkey: h[0],
          hzname: h[1],
          hzdept_l: h[2],
          hzdept_r: h[3],
          hzdept_h: h[4],
          hzdepb_l: h[5],
          hzdepb_r: h[6],
          hzdepb_h: h[7],
          ph1to1h2o_l: h[8],
          ph1to1h2o_r: h[9],
          ph1to1h2o_h: h[10],
          om_l: h[11],
          om_r: h[12],
          om_h: h[13],
          ksat_l: h[14],
          ksat_r: h[15],
          ksat_h: h[16],
          dbthirdbar_l: h[17],
          dbthirdbar_r: h[18],
          dbthirdbar_h: h[19],
          sandtotal_l: h[20],
          sandtotal_r: h[21],
          sandtotal_h: h[22],
          silttotal_l: h[23],
          silttotal_r: h[24],
          silttotal_h: h[25],
          claytotal_l: h[26],
          claytotal_r: h[27],
          claytotal_h: h[28],
          cec7_l: h[29],
          cec7_r: h[30],
          cec7_h: h[31],
          wthirdbar_l: h[32],
          wthirdbar_r: h[33],
          wthirdbar_h: h[34],
          wfifteenbar_l: h[35],
          wfifteenbar_r: h[36],
          wfifteenbar_h: h[37]
        }))
      }
    } catch (error) {
      Logger.error('Error fetching SSURGO data:', error)
      return null
    }
  }

  /**
   * Build soil profile from sensor data
   */
  private async buildProfileFromSensorData(
    fieldId: string,
    location: { latitude: number; longitude: number },
    sensorData: SoilReading[]
  ): Promise<SoilProfile> {
    // Group readings by depth to create layers
    const depthGroups = new Map<number, SoilReading[]>()
    
    sensorData.forEach(reading => {
      const depth = Math.round(reading.depth / 10) * 10 // Round to nearest 10cm
      if (!depthGroups.has(depth)) {
        depthGroups.set(depth, [])
      }
      depthGroups.get(depth)!.push(reading)
    })

    const layers: SoilLayer[] = []
    const sortedDepths = Array.from(depthGroups.keys()).sort((a, b) => a - b)

    sortedDepths.forEach((depth, index) => {
      const readings = depthGroups.get(depth)!
      const avgReading = this.averageSensorReadings(readings)
      
      layers.push({
        depth_top: depth,
        depth_bottom: sortedDepths[index + 1] || depth + 30,
        ph: avgReading.ph,
        organic_matter: 3.0, // Estimated - sensors typically don't measure this
        nitrogen: avgReading.nitrogen,
        phosphorus: avgReading.phosphorus,
        potassium: avgReading.potassium,
        calcium: 200, // Estimated
        magnesium: 50, // Estimated
        sulfur: 10, // Estimated
        bulk_density: 1.3, // Estimated
        field_capacity: 25, // Estimated
        wilting_point: 12, // Estimated
        cec: 15, // Estimated
        sand_percent: 40, // Estimated
        silt_percent: 35, // Estimated
        clay_percent: 25, // Estimated
        texture_class: 'loam',
        drainage_class: 'well'
      })
    })

    return {
      fieldId,
      location,
      soilSeries: 'Unknown',
      soilType: 'Sensor-based profile',
      depth: Math.max(...sortedDepths) + 30,
      layers,
      metadata: {
        source: 'sensor',
        lastUpdated: new Date(),
        confidence: 0.9
      }
    }
  }

  /**
   * Build soil profile from USDA SSURGO data
   */
  private async buildProfileFromSSURGO(
    fieldId: string,
    location: { latitude: number; longitude: number },
    ssurgoData: USDASSURGOData
  ): Promise<SoilProfile> {
    const layers: SoilLayer[] = ssurgoData.horizons.map(horizon => ({
      depth_top: horizon.hzdept_r || horizon.hzdept_l || 0,
      depth_bottom: horizon.hzdepb_r || horizon.hzdepb_h || 30,
      ph: horizon.ph1to1h2o_r || horizon.ph1to1h2o_l || 6.5,
      organic_matter: horizon.om_r || horizon.om_l || 3.0,
      nitrogen: 25, // SSURGO doesn't typically include NPK
      phosphorus: 20,
      potassium: 150,
      calcium: 200,
      magnesium: 50,
      sulfur: 10,
      bulk_density: horizon.dbthirdbar_r || horizon.dbthirdbar_l || 1.3,
      field_capacity: horizon.wthirdbar_r || horizon.wthirdbar_l || 25,
      wilting_point: horizon.wfifteenbar_r || horizon.wfifteenbar_l || 12,
      cec: horizon.cec7_r || horizon.cec7_l || 15,
      sand_percent: horizon.sandtotal_r || horizon.sandtotal_l || 40,
      silt_percent: horizon.silttotal_r || horizon.silttotal_l || 35,
      clay_percent: horizon.claytotal_r || horizon.claytotal_l || 25,
      texture_class: this.determineTextureClass(
        horizon.sandtotal_r || 40,
        horizon.silttotal_r || 35,
        horizon.claytotal_r || 25
      ),
      drainage_class: this.mapHydrologicGroup(ssurgoData.component.hydgrp)
    }))

    return {
      fieldId,
      location,
      soilSeries: ssurgoData.component.compname,
      soilType: ssurgoData.component.taxsubgrp,
      depth: Math.max(...layers.map(l => l.depth_bottom)),
      layers,
      metadata: {
        source: 'SSURGO',
        lastUpdated: new Date(),
        confidence: 0.85
      }
    }
  }

  /**
   * Build estimated soil profile based on regional characteristics
   */
  private async buildEstimatedProfile(
    fieldId: string,
    location: { latitude: number; longitude: number }
  ): Promise<SoilProfile> {
    // Use climate zone and regional soil data to estimate characteristics
    const climateZone = this.determineClimateZone(location.latitude)
    const soilCharacteristics = this.getRegionalSoilCharacteristics(climateZone)

    const layers: SoilLayer[] = [
      {
        depth_top: 0,
        depth_bottom: 30,
        ...soilCharacteristics.topsoil
      },
      {
        depth_top: 30,
        depth_bottom: 60,
        ...soilCharacteristics.subsoil
      }
    ]

    return {
      fieldId,
      location,
      soilSeries: 'Regional Estimate',
      soilType: `${climateZone} typical soil`,
      depth: 60,
      layers,
      metadata: {
        source: 'estimated',
        lastUpdated: new Date(),
        confidence: 0.6
      }
    }
  }

  // Helper methods
  private averageSensorReadings(readings: SoilReading[]) {
    const count = readings.length
    return {
      ph: readings.reduce((sum, r) => sum + r.ph, 0) / count,
      moisture: readings.reduce((sum, r) => sum + r.moisture, 0) / count,
      temperature: readings.reduce((sum, r) => sum + r.temperature, 0) / count,
      electrical_conductivity: readings.reduce((sum, r) => sum + r.electrical_conductivity, 0) / count,
      nitrogen: readings.reduce((sum, r) => sum + r.nitrogen, 0) / count,
      phosphorus: readings.reduce((sum, r) => sum + r.phosphorus, 0) / count,
      potassium: readings.reduce((sum, r) => sum + r.potassium, 0) / count
    }
  }

  private determineTextureClass(sand: number, silt: number, clay: number): string {
    if (clay >= 40) return 'clay'
    if (clay >= 27 && sand <= 20) return 'clay_loam'
    if (clay >= 27 && sand > 20 && sand <= 45) return 'clay_loam'
    if (clay >= 20 && clay < 27 && sand > 45) return 'sandy_clay_loam'
    if (clay >= 7 && clay < 20 && sand < 52) return 'loam'
    if (clay >= 7 && clay < 20 && sand >= 52 && sand < 80) return 'sandy_loam'
    if (clay < 7 && silt < 50 && sand >= 70) return 'sand'
    if (clay < 7 && silt >= 50 && sand < 50) return 'silt_loam'
    return 'loam'
  }

  private mapHydrologicGroup(hydgrp: string): SoilLayer['drainage_class'] {
    switch (hydgrp) {
      case 'A': return 'excessive'
      case 'B': return 'well'
      case 'C': return 'moderate'
      case 'D': return 'poor'
      default: return 'moderate'
    }
  }

  private determineClimateZone(latitude: number): string {
    if (latitude > 45) return 'northern_temperate'
    if (latitude > 35) return 'temperate'
    if (latitude > 25) return 'subtropical'
    return 'tropical'
  }

  private getRegionalSoilCharacteristics(zone: string) {
    const characteristics = {
      northern_temperate: {
        topsoil: {
          ph: 6.0, organic_matter: 4.0, nitrogen: 30, phosphorus: 25, potassium: 180,
          calcium: 250, magnesium: 60, sulfur: 15, bulk_density: 1.2, field_capacity: 28,
          wilting_point: 14, cec: 18, sand_percent: 35, silt_percent: 40, clay_percent: 25,
          texture_class: 'loam', drainage_class: 'well' as const
        },
        subsoil: {
          ph: 6.2, organic_matter: 2.0, nitrogen: 15, phosphorus: 15, potassium: 120,
          calcium: 200, magnesium: 45, sulfur: 10, bulk_density: 1.4, field_capacity: 25,
          wilting_point: 12, cec: 15, sand_percent: 40, silt_percent: 35, clay_percent: 25,
          texture_class: 'loam', drainage_class: 'well' as const
        }
      },
      temperate: {
        topsoil: {
          ph: 6.5, organic_matter: 3.5, nitrogen: 28, phosphorus: 22, potassium: 160,
          calcium: 220, magnesium: 55, sulfur: 12, bulk_density: 1.25, field_capacity: 26,
          wilting_point: 13, cec: 16, sand_percent: 40, silt_percent: 35, clay_percent: 25,
          texture_class: 'loam', drainage_class: 'well' as const
        },
        subsoil: {
          ph: 6.8, organic_matter: 1.8, nitrogen: 18, phosphorus: 18, potassium: 140,
          calcium: 180, magnesium: 40, sulfur: 8, bulk_density: 1.35, field_capacity: 24,
          wilting_point: 11, cec: 14, sand_percent: 45, silt_percent: 30, clay_percent: 25,
          texture_class: 'loam', drainage_class: 'well' as const
        }
      },
      subtropical: {
        topsoil: {
          ph: 6.8, organic_matter: 2.5, nitrogen: 22, phosphorus: 18, potassium: 140,
          calcium: 200, magnesium: 50, sulfur: 10, bulk_density: 1.3, field_capacity: 24,
          wilting_point: 12, cec: 14, sand_percent: 50, silt_percent: 30, clay_percent: 20,
          texture_class: 'sandy_loam', drainage_class: 'well' as const
        },
        subsoil: {
          ph: 7.0, organic_matter: 1.2, nitrogen: 12, phosphorus: 12, potassium: 100,
          calcium: 150, magnesium: 35, sulfur: 6, bulk_density: 1.45, field_capacity: 20,
          wilting_point: 9, cec: 12, sand_percent: 60, silt_percent: 25, clay_percent: 15,
          texture_class: 'sandy_loam', drainage_class: 'well' as const
        }
      },
      tropical: {
        topsoil: {
          ph: 5.8, organic_matter: 3.0, nitrogen: 20, phosphorus: 15, potassium: 120,
          calcium: 150, magnesium: 40, sulfur: 8, bulk_density: 1.1, field_capacity: 30,
          wilting_point: 15, cec: 20, sand_percent: 30, silt_percent: 35, clay_percent: 35,
          texture_class: 'clay_loam', drainage_class: 'moderate' as const
        },
        subsoil: {
          ph: 6.0, organic_matter: 1.5, nitrogen: 10, phosphorus: 8, potassium: 80,
          calcium: 100, magnesium: 25, sulfur: 5, bulk_density: 1.3, field_capacity: 28,
          wilting_point: 14, cec: 18, sand_percent: 25, silt_percent: 30, clay_percent: 45,
          texture_class: 'clay', drainage_class: 'moderate' as const
        }
      }
    }
    return characteristics[zone as keyof typeof characteristics] || characteristics.temperate
  }

  /**
   * Store soil sensor reading in database
   */
  async storeSensorReading(reading: Omit<SoilReading, 'fieldId'> & { fieldId: string }): Promise<void> {
    try {
      await prisma.soilReading.create({
        data: {
          fieldId: reading.fieldId,
          sensorId: reading.sensor_id,
          timestamp: reading.timestamp,
          depth: reading.depth,
          temperature: reading.temperature,
          moisture: reading.moisture,
          ph: reading.ph,
          electricalConductivity: reading.electrical_conductivity,
          nitrogen: reading.nitrogen,
          phosphorus: reading.phosphorus,
          potassium: reading.potassium,
          latitude: reading.location.latitude,
          longitude: reading.location.longitude,
          quality: reading.quality
        }
      })
    } catch (error) {
      Logger.error('Error storing soil sensor reading:', error)
      throw error
    }
  }
}

export const soilDataService = new SoilDataService()
export { SoilDataService }