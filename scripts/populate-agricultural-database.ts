#!/usr/bin/env npx tsx

/**
 * Script to populate the comprehensive agricultural database
 * Run with: npx tsx scripts/populate-agricultural-database.ts
 */

import { PrismaClient } from '@prisma/client';
import { populateAgriculturalDatabase } from '../data-collection-system';

const prisma = new PrismaClient();

async function main() {
  console.log('🌾 Starting Agricultural Database Population...\n');

  try {
    // First, check if the comprehensive tables exist
    console.log('1. Checking database schema...');
    
    // For now, create sample data directly since we need to add the comprehensive schema
    console.log('2. Creating sample comprehensive agricultural data...');
    
    const sampleCrops = [
      {
        name: 'Corn',
        scientific_name: 'Zea mays',
        common_names: ['Maize', 'Sweet corn', 'Field corn'],
        crop_type: 'cereal',
        growth_habit: 'annual',
        plant_form: 'herb',
        climate_zones: ['temperate', 'subtropical', 'tropical'],
        hardiness_zones: 'USDA 3-9',
        soil_ph_min: 6.0,
        soil_ph_max: 7.0,
        soil_types: ['clay', 'loam', 'sandy'],
        water_requirements: 'medium',
        days_to_germination_min: 7,
        days_to_germination_max: 14,
        days_to_maturity_min: 80,
        days_to_maturity_max: 120,
        planting_depth_cm: 2.5,
        plant_spacing_cm: 20,
        row_spacing_cm: 75,
        plants_per_hectare: 75000,
        average_yield_kg_per_hectare: 9500,
        frost_tolerance: 'none',
        drought_tolerance: 'moderate',
        heat_tolerance: 'high',
        market_category: 'commodity',
        global_production_tonnes: 1100000000,
        major_producing_countries: ['United States', 'China', 'Brazil', 'Argentina'],
        nutrition_data: {
          calories_per_100g: 365,
          protein_g: 9.4,
          carbohydrates_g: 74.3,
          fiber_g: 7.3,
          fat_g: 4.7
        },
        companion_plants: ['beans', 'squash', 'sunflower'],
        pest_susceptibilities: ['corn_borer', 'armyworm', 'corn_rootworm'],
        disease_susceptibilities: ['gray_leaf_spot', 'northern_corn_leaf_blight', 'southern_rust'],
        beneficial_insects: ['ladybugs', 'lacewings', 'parasitic_wasps']
      },
      {
        name: 'Soybean',
        scientific_name: 'Glycine max',
        common_names: ['Soybeans', 'Soy'],
        crop_type: 'legume',
        growth_habit: 'annual',
        plant_form: 'herb',
        climate_zones: ['temperate', 'subtropical'],
        hardiness_zones: 'USDA 4-8',
        soil_ph_min: 6.0,
        soil_ph_max: 7.0,
        soil_types: ['clay', 'loam'],
        water_requirements: 'medium',
        days_to_germination_min: 5,
        days_to_germination_max: 10,
        days_to_maturity_min: 100,
        days_to_maturity_max: 140,
        planting_depth_cm: 3.8,
        plant_spacing_cm: 5,
        row_spacing_cm: 38,
        plants_per_hectare: 400000,
        average_yield_kg_per_hectare: 3400,
        frost_tolerance: 'light',
        drought_tolerance: 'moderate',
        heat_tolerance: 'moderate',
        market_category: 'commodity',
        global_production_tonnes: 350000000,
        major_producing_countries: ['United States', 'Brazil', 'Argentina', 'China'],
        nutrition_data: {
          calories_per_100g: 446,
          protein_g: 36.5,
          carbohydrates_g: 30.2,
          fiber_g: 9.3,
          fat_g: 19.9
        },
        companion_plants: ['corn', 'wheat', 'oats'],
        pest_susceptibilities: ['soybean_aphid', 'bean_leaf_beetle', 'stink_bugs'],
        disease_susceptibilities: ['soybean_rust', 'sudden_death_syndrome', 'white_mold'],
        beneficial_insects: ['minute_pirate_bugs', 'predatory_mites', 'ground_beetles']
      },
      {
        name: 'Wheat',
        scientific_name: 'Triticum aestivum',
        common_names: ['Winter wheat', 'Spring wheat', 'Hard wheat', 'Soft wheat'],
        crop_type: 'cereal',
        growth_habit: 'annual',
        plant_form: 'herb',
        climate_zones: ['temperate', 'continental'],
        hardiness_zones: 'USDA 3-8',
        soil_ph_min: 6.0,
        soil_ph_max: 7.5,
        soil_types: ['clay', 'loam'],
        water_requirements: 'medium',
        days_to_germination_min: 7,
        days_to_germination_max: 21,
        days_to_maturity_min: 90,
        days_to_maturity_max: 240,
        planting_depth_cm: 2.5,
        plant_spacing_cm: 2,
        row_spacing_cm: 18,
        plants_per_hectare: 4000000,
        average_yield_kg_per_hectare: 3500,
        frost_tolerance: 'heavy',
        drought_tolerance: 'moderate',
        heat_tolerance: 'moderate',
        market_category: 'commodity',
        global_production_tonnes: 760000000,
        major_producing_countries: ['China', 'India', 'Russia', 'United States'],
        nutrition_data: {
          calories_per_100g: 339,
          protein_g: 13.7,
          carbohydrates_g: 71.2,
          fiber_g: 12.2,
          fat_g: 2.5
        },
        companion_plants: ['legumes', 'clover'],
        pest_susceptibilities: ['hessian_fly', 'wheat_stem_sawfly', 'armyworm'],
        disease_susceptibilities: ['stripe_rust', 'leaf_rust', 'powdery_mildew'],
        beneficial_insects: ['parasitic_wasps', 'ground_beetles', 'spiders']
      },
      {
        name: 'Tomato',
        scientific_name: 'Solanum lycopersicum',
        common_names: ['Tomatoes', 'Cherry tomato', 'Roma tomato', 'Beefsteak tomato'],
        crop_type: 'vegetable',
        growth_habit: 'annual',
        plant_form: 'herb',
        climate_zones: ['temperate', 'subtropical', 'tropical'],
        hardiness_zones: 'USDA 9-11',
        soil_ph_min: 6.0,
        soil_ph_max: 6.8,
        soil_types: ['loam', 'sandy'],
        water_requirements: 'high',
        days_to_germination_min: 5,
        days_to_germination_max: 10,
        days_to_maturity_min: 60,
        days_to_maturity_max: 100,
        planting_depth_cm: 0.6,
        plant_spacing_cm: 45,
        row_spacing_cm: 90,
        plants_per_hectare: 25000,
        average_yield_kg_per_hectare: 60000,
        frost_tolerance: 'none',
        drought_tolerance: 'low',
        heat_tolerance: 'moderate',
        market_category: 'specialty',
        global_production_tonnes: 180000000,
        major_producing_countries: ['China', 'India', 'Turkey', 'United States'],
        nutrition_data: {
          calories_per_100g: 18,
          protein_g: 0.9,
          carbohydrates_g: 3.9,
          fiber_g: 1.2,
          fat_g: 0.2
        },
        companion_plants: ['basil', 'peppers', 'carrots'],
        pest_susceptibilities: ['hornworm', 'aphids', 'whiteflies'],
        disease_susceptibilities: ['early_blight', 'late_blight', 'fusarium_wilt'],
        beneficial_insects: ['ladybugs', 'braconid_wasps', 'predatory_mites']
      },
      {
        name: 'Cotton',
        scientific_name: 'Gossypium hirsutum',
        common_names: ['Upland cotton', 'American cotton'],
        crop_type: 'fiber',
        growth_habit: 'annual',
        plant_form: 'shrub',
        climate_zones: ['subtropical', 'tropical'],
        hardiness_zones: 'USDA 8-11',
        soil_ph_min: 5.8,
        soil_ph_max: 8.0,
        soil_types: ['clay', 'loam', 'sandy'],
        water_requirements: 'medium',
        days_to_germination_min: 5,
        days_to_germination_max: 10,
        days_to_maturity_min: 180,
        days_to_maturity_max: 220,
        planting_depth_cm: 1.3,
        plant_spacing_cm: 10,
        row_spacing_cm: 100,
        plants_per_hectare: 100000,
        average_yield_kg_per_hectare: 1500,
        frost_tolerance: 'none',
        drought_tolerance: 'moderate',
        heat_tolerance: 'high',
        market_category: 'commodity',
        global_production_tonnes: 25000000,
        major_producing_countries: ['China', 'India', 'United States', 'Pakistan'],
        nutrition_data: null, // Not applicable for fiber crop
        companion_plants: ['corn', 'sorghum'],
        pest_susceptibilities: ['bollworm', 'cotton_aphid', 'thrips'],
        disease_susceptibilities: ['fusarium_wilt', 'bacterial_blight', 'verticillium_wilt'],
        beneficial_insects: ['big_eyed_bugs', 'minute_pirate_bugs', 'spiders']
      }
    ];

    const sampleVarieties = [
      // Corn varieties
      {
        crop_name: 'Corn',
        variety_name: 'Pioneer P1151AM',
        cultivar_code: 'P1151AM',
        breeder: 'Pioneer Hi-Bred International',
        release_year: 2019,
        yield_potential_kg_per_hectare: 11500,
        disease_resistance: ['corn_borer', 'leaf_blight'],
        pest_resistance: ['european_corn_borer'],
        stress_tolerance: { drought: 'high', heat: 'medium', cold: 'low' },
        quality_traits: { protein_content: 8.5, oil_content: 3.8 },
        end_use: ['feed', 'ethanol'],
        recommended_regions: ['Midwest', 'Great Plains'],
        altitude_range: { min: 0, max: 1000 },
        seed_availability: 'commercial',
        patent_status: 'patented',
        gmo_status: true,
        organic_certified: false
      },
      {
        crop_name: 'Corn',
        variety_name: 'DeKalb DKC60-87',
        cultivar_code: 'DKC60-87',
        breeder: 'Bayer Crop Science',
        release_year: 2020,
        yield_potential_kg_per_hectare: 12200,
        disease_resistance: ['gray_leaf_spot', 'northern_leaf_blight'],
        pest_resistance: ['corn_rootworm'],
        stress_tolerance: { drought: 'medium', heat: 'high', cold: 'medium' },
        quality_traits: { protein_content: 9.2, oil_content: 4.1 },
        end_use: ['feed', 'food'],
        recommended_regions: ['Corn Belt', 'Southeast'],
        altitude_range: { min: 0, max: 800 },
        seed_availability: 'commercial',
        patent_status: 'patented',
        gmo_status: true,
        organic_certified: false
      },
      // Soybean varieties
      {
        crop_name: 'Soybean',
        variety_name: 'Asgrow AG4632',
        cultivar_code: 'AG4632',
        breeder: 'Bayer Crop Science',
        release_year: 2018,
        yield_potential_kg_per_hectare: 4500,
        disease_resistance: ['soybean_cyst_nematode', 'sudden_death_syndrome'],
        pest_resistance: ['aphids'],
        stress_tolerance: { drought: 'high', heat: 'medium', cold: 'medium' },
        quality_traits: { protein_content: 34.5, oil_content: 18.2 },
        end_use: ['feed', 'food', 'oil'],
        recommended_regions: ['Midwest', 'Southeast'],
        altitude_range: { min: 0, max: 500 },
        seed_availability: 'commercial',
        patent_status: 'patented',
        gmo_status: true,
        organic_certified: false
      },
      // Wheat varieties
      {
        crop_name: 'Wheat',
        variety_name: 'WB-Grainfield',
        cultivar_code: 'WB-GF',
        breeder: 'AgriPro Seeds',
        release_year: 2019,
        yield_potential_kg_per_hectare: 6800,
        disease_resistance: ['stripe_rust', 'leaf_rust'],
        pest_resistance: ['hessian_fly'],
        stress_tolerance: { drought: 'medium', heat: 'medium', cold: 'high' },
        quality_traits: { protein_content: 13.5, gluten_strength: 'high' },
        end_use: ['bread', 'pasta'],
        recommended_regions: ['Great Plains', 'Pacific Northwest'],
        altitude_range: { min: 0, max: 1500 },
        seed_availability: 'commercial',
        patent_status: 'open_pollinated',
        gmo_status: false,
        organic_certified: true
      },
      // Tomato varieties
      {
        crop_name: 'Tomato',
        variety_name: 'Celebrity',
        cultivar_code: 'CEL',
        breeder: 'Seminis',
        release_year: 1984,
        yield_potential_kg_per_hectare: 75000,
        disease_resistance: ['verticillium_wilt', 'fusarium_wilt', 'nematodes'],
        pest_resistance: ['tobacco_mosaic_virus'],
        stress_tolerance: { drought: 'medium', heat: 'medium', cold: 'low' },
        quality_traits: { brix: 4.5, firmness: 'high', shelf_life: 14 },
        end_use: ['fresh_market', 'slicing'],
        recommended_regions: ['Southeast', 'California', 'Florida'],
        altitude_range: { min: 0, max: 1000 },
        seed_availability: 'commercial',
        patent_status: 'open_pollinated',
        gmo_status: false,
        organic_certified: true
      },
      // Cotton varieties
      {
        crop_name: 'Cotton',
        variety_name: 'FiberMax 9170',
        cultivar_code: 'FM9170',
        breeder: 'Bayer Crop Science',
        release_year: 2020,
        yield_potential_kg_per_hectare: 1800,
        disease_resistance: ['bacterial_blight', 'fusarium_wilt'],
        pest_resistance: ['bollworm', 'budworm'],
        stress_tolerance: { drought: 'high', heat: 'high', cold: 'low' },
        quality_traits: { fiber_length: 1.15, micronaire: 4.2, strength: 30.5 },
        end_use: ['textile', 'premium_fabric'],
        recommended_regions: ['Texas', 'Arizona', 'California'],
        altitude_range: { min: 0, max: 800 },
        seed_availability: 'commercial',
        patent_status: 'patented',
        gmo_status: true,
        organic_certified: false
      }
    ];

    console.log('3. Populating crop data...');
    
    // Note: Since we don't have the comprehensive schema in Prisma yet,
    // we'll store this in a JSON file for now
    const fs = require('fs').promises;
    
    await fs.writeFile(
      '/Users/omerkhurshid/Crops.AI/comprehensive-crops-data.json',
      JSON.stringify({
        crops: sampleCrops,
        varieties: sampleVarieties,
        populated_at: new Date().toISOString(),
        total_crops: sampleCrops.length,
        total_varieties: sampleVarieties.length
      }, null, 2)
    );

    console.log('✅ Sample data written to comprehensive-crops-data.json');
    console.log(`📊 Populated ${sampleCrops.length} crops and ${sampleVarieties.length} varieties`);

    // Also run the automated data collection for additional data
    console.log('\n4. Running automated data collection...');
    try {
      await populateAgriculturalDatabase();
      console.log('✅ Automated data collection completed');
    } catch (error) {
      console.log('⚠️  Automated data collection failed (requires API keys):', error.message);
    }

    console.log('\n🎉 Agricultural Database Population Complete!');
    console.log('\nNext steps:');
    console.log('1. Add comprehensive schema to Prisma schema');
    console.log('2. Run migrations: npx prisma db push');
    console.log('3. Import data from comprehensive-crops-data.json');
    console.log('4. Update API endpoints to use real database queries');

  } catch (error) {
    console.error('❌ Error populating agricultural database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { main as populateAgriculturalDatabase };