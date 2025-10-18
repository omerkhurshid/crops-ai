#!/usr/bin/env node

/**
 * Script to create a demo user account for Crops.AI
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createDemoUser() {
  try {
    console.log('Creating demo user account...')

    // Hash the password
    const passwordHash = await bcrypt.hash('demo123', 12)

    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@crops.ai' }
    })

    if (existingUser) {
      console.log('Demo user already exists!')
      return
    }

    // Create demo user
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@crops.ai',
        name: 'Demo Farmer',
        passwordHash,
        role: 'FARM_OWNER',
        profileComplete: true
      }
    })

    console.log('Demo user created successfully!')
    console.log('Email: demo@crops.ai')
    console.log('Password: demo123')
    console.log('User ID:', demoUser.id)

    // Create a demo farm
    const demoFarm = await prisma.farm.create({
      data: {
        name: 'Demo Farm',
        location: 'Demo Location',
        totalSize: 100.0,
        ownerId: demoUser.id,
        farmType: 'CROP',
        soilType: 'LOAM',
        coordinates: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      }
    })

    console.log('Demo farm created:', demoFarm.name)

    // Create a demo field
    const demoField = await prisma.field.create({
      data: {
        name: 'Demo Field 1',
        farmId: demoFarm.id,
        size: 25.0,
        soilType: 'LOAM',
        boundary: [],
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      }
    })

    console.log('Demo field created:', demoField.name)

    console.log('\n✅ Demo account setup complete!')
    console.log('You can now log in with:')
    console.log('Email: demo@crops.ai')
    console.log('Password: demo123')

  } catch (error) {
    console.error('Error creating demo user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  createDemoUser()
}

module.exports = { createDemoUser }