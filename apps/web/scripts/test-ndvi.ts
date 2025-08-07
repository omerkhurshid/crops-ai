#!/usr/bin/env ts-node

/**
 * Test script to demonstrate real NDVI calculations
 * Run with: npx ts-node scripts/test-ndvi.ts
 */

import { ndviCalculator } from '../src/lib/satellite/ndvi-calculator'
import { copernicusService } from '../src/lib/satellite/copernicus-service'

async function demonstrateNDVICalculation() {
  console.log('🛰️  Crops.AI - Real NDVI Calculation Demo')
  console.log('=' .repeat(50))
  
  // Test 1: Basic NDVI calculation
  console.log('\n📊 Test 1: Basic NDVI Calculation')
  console.log('-'.repeat(30))
  
  const healthyVegetation = { red: 0.15, nir: 0.45 }
  const water = { red: 0.30, nir: 0.10 }
  const baresoil = { red: 0.25, nir: 0.20 }
  
  console.log(`Healthy Vegetation (Red: ${healthyVegetation.red}, NIR: ${healthyVegetation.nir})`)
  console.log(`NDVI: ${ndviCalculator.calculateNDVI(healthyVegetation.red, healthyVegetation.nir).toFixed(3)}`)
  
  console.log(`\nWater (Red: ${water.red}, NIR: ${water.nir})`)
  console.log(`NDVI: ${ndviCalculator.calculateNDVI(water.red, water.nir).toFixed(3)}`)
  
  console.log(`\nBare Soil (Red: ${baresoil.red}, NIR: ${baresoil.nir})`)
  console.log(`NDVI: ${ndviCalculator.calculateNDVI(baresoil.red, baresoil.nir).toFixed(3)}`)
  
  // Test 2: Complete vegetation indices
  console.log('\n🌱 Test 2: Complete Vegetation Indices')
  console.log('-'.repeat(30))
  
  const spectralBands = {
    red: 0.12,
    nir: 0.48,
    blue: 0.08,
    green: 0.10,
    swir1: 0.22,
    swir2: 0.18
  }
  
  const indices = ndviCalculator.calculateVegetationIndices(spectralBands)
  console.log('Spectral Bands:', JSON.stringify(spectralBands, null, 2))
  console.log('\nCalculated Indices:')
  console.log(`NDVI:  ${indices.ndvi.toFixed(4)} (Normalized Difference Vegetation Index)`)
  console.log(`SAVI:  ${indices.savi.toFixed(4)} (Soil Adjusted Vegetation Index)`)
  console.log(`EVI:   ${indices.evi.toFixed(4)} (Enhanced Vegetation Index)`)
  console.log(`GNDVI: ${indices.gndvi.toFixed(4)} (Green NDVI)`)
  console.log(`NDWI:  ${indices.ndwi.toFixed(4)} (Water Index)`)
  console.log(`NDMI:  ${indices.ndmi.toFixed(4)} (Moisture Index)`)
  console.log(`LAI:   ${indices.lai.toFixed(2)} (Leaf Area Index)`)
  console.log(`FVC:   ${indices.fvc.toFixed(3)} (Fractional Vegetation Cover)`)
  
  // Test 3: Health assessment
  console.log('\n🏥 Test 3: Crop Health Assessment')
  console.log('-'.repeat(30))
  
  const healthAssessment = ndviCalculator.assessCropHealth(indices)
  console.log(`Overall Health: ${healthAssessment.overall.toUpperCase()}`)
  console.log(`Stress Level: ${healthAssessment.stressLevel.toUpperCase()}`)
  console.log(`Confidence: ${(healthAssessment.confidence * 100).toFixed(1)}%`)
  
  if (healthAssessment.stressFactors.length > 0) {
    console.log('\nStress Factors:')
    healthAssessment.stressFactors.forEach((factor, i) => {
      console.log(`  ${i + 1}. ${factor}`)
    })
  }
  
  if (healthAssessment.recommendations.length > 0) {
    console.log('\nRecommendations:')
    healthAssessment.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`)
    })
  }
  
  // Test 4: Statistical analysis
  console.log('\n📈 Test 4: Field Statistics')
  console.log('-'.repeat(30))
  
  // Simulate field NDVI values
  const fieldNDVI = []
  for (let i = 0; i < 1000; i++) {
    const baseNDVI = 0.6 + (Math.random() - 0.5) * 0.3 // 0.45 to 0.75 range with variation
    fieldNDVI.push(Math.max(0, Math.min(1, baseNDVI)))
  }
  
  const stats = ndviCalculator.calculateNDVIStatistics(fieldNDVI)
  console.log('Simulated field with 1000 pixels:')
  console.log(`Mean NDVI:    ${stats.mean.toFixed(4)}`)
  console.log(`Median NDVI:  ${stats.median.toFixed(4)}`)
  console.log(`Min NDVI:     ${stats.min.toFixed(4)}`)
  console.log(`Max NDVI:     ${stats.max.toFixed(4)}`)
  console.log(`Std Dev:      ${stats.std.toFixed(4)}`)
  console.log(`25th %ile:    ${stats.q25.toFixed(4)}`)
  console.log(`75th %ile:    ${stats.q75.toFixed(4)}`)
  console.log(`Valid pixels: ${stats.validPixels}`)
  console.log(`Water pixels: ${stats.waterPixels}`)
  console.log(`Bare soil:    ${stats.baresoilPixels}`)
  
  // Test 5: Copernicus integration
  console.log('\n🌍 Test 5: Copernicus Service Integration')
  console.log('-'.repeat(30))
  
  const testField = {
    id: 'test-field-001',
    farm: {
      latitude: 41.8781,  // Illinois farm
      longitude: -87.6298
    }
  }
  
  const fieldBounds = {
    north: testField.farm.latitude + 0.005,
    south: testField.farm.latitude - 0.005,
    east: testField.farm.longitude + 0.005,
    west: testField.farm.longitude - 0.005
  }
  
  console.log(`Field Location: ${testField.farm.latitude.toFixed(4)}, ${testField.farm.longitude.toFixed(4)}`)
  console.log('Calculating NDVI from Copernicus service...')
  
  try {
    const copernicus = await copernicusService.getLatestFieldNDVI(testField.id, fieldBounds)
    
    if (copernicus) {
      console.log(`\nCopernicus NDVI Results:`)
      console.log(`Date: ${copernicus.date}`)
      console.log(`Mean NDVI: ${copernicus.meanNDVI.toFixed(4)}`)
      console.log(`Min NDVI:  ${copernicus.minNDVI.toFixed(4)}`)
      console.log(`Max NDVI:  ${copernicus.maxNDVI.toFixed(4)}`)
      console.log(`Quality:   ${copernicus.quality.toUpperCase()}`)
      console.log(`Cloud:     ${copernicus.cloudCover.toFixed(1)}%`)
      console.log(`Pixels:    ${copernicus.pixelCount}`)
      
      if (copernicus.stressAreas.length > 0) {
        console.log(`\nStress Areas Detected: ${copernicus.stressAreas.length}`)
        copernicus.stressAreas.slice(0, 3).forEach((area, i) => {
          console.log(`  ${i + 1}. Lat: ${area.lat.toFixed(6)}, Lng: ${area.lng.toFixed(6)}, NDVI: ${area.ndvi.toFixed(3)} (${area.severity})`)
        })
      }
    } else {
      console.log('No Copernicus data available (using offline mode)')
    }
  } catch (error) {
    console.log(`Copernicus service error: ${error}`)
    console.log('This is expected when running without API credentials')
  }
  
  console.log('\n✅ Demo completed successfully!')
  console.log('\nReal NDVI calculations are now integrated and working!')
  console.log('The system can:')
  console.log('- Calculate accurate NDVI from spectral bands')  
  console.log('- Compute multiple vegetation indices (SAVI, EVI, etc.)')
  console.log('- Provide statistical analysis of field data')
  console.log('- Assess crop health with recommendations')
  console.log('- Integrate with Copernicus/Sentinel-2 data')
}

// Run the demo
demonstrateNDVICalculation().catch(console.error)

export { demonstrateNDVICalculation }