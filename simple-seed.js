#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

process.env.DATABASE_URL = "postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking database status...')
    
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check what tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `
    
    console.log('📊 Existing tables:')
    tables.forEach(table => console.log(`  - ${table.table_name}`))
    
    // Check if we can query basic tables
    try {
      const userCount = await prisma.user.count()
      console.log(`👥 Users in database: ${userCount}`)
    } catch (e) {
      console.log('⚠️  User table not accessible:', e.message)
    }
    
    try {
      const farmCount = await prisma.farm.count()
      console.log(`🚜 Farms in database: ${farmCount}`)
    } catch (e) {
      console.log('⚠️  Farm table not accessible:', e.message)
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()