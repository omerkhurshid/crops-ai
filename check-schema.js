#!/usr/bin/env node

const { Client } = require('pg')

const client = new Client({
  connectionString: "postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
})

async function checkSchema() {
  try {
    await client.connect()
    console.log('✅ Connected')
    
    // Check Field table schema
    const fieldColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Field' AND table_schema = 'public'
      ORDER BY ordinal_position
    `)
    
    console.log('\n📋 Field table columns:')
    fieldColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    // Check User table too since we created one
    const userColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'User' AND table_schema = 'public'
      ORDER BY ordinal_position
    `)
    
    console.log('\n📋 User table columns:')
    userColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.end()
  }
}

checkSchema()