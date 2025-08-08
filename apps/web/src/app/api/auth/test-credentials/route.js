import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    
    console.log('=== Test Credentials Debug ===')
    console.log('Testing credentials:', { email, hasPassword: !!password, passwordLength: password?.length })
    
    // Demo users (exact same as NextAuth)
    const demoUsers = [
      {
        id: 'demo-1',
        email: 'demo@crops.ai',
        password: 'Demo123!',
        name: 'Demo User',
        role: 'FARM_OWNER'
      },
      {
        id: 'admin-1',
        email: 'admin@crops.ai',
        password: 'Admin123!',
        name: 'Admin User',
        role: 'ADMIN'
      }
    ]

    console.log('Available demo users:', demoUsers.map(u => ({ email: u.email, id: u.id })))

    // Test exact matching logic
    const matchedUser = demoUsers.find(user => {
      const emailMatch = user.email === email
      const passwordMatch = user.password === password
      
      console.log(`Testing ${user.email}:`)
      console.log(`  Email: "${user.email}" === "${email}" = ${emailMatch}`)
      console.log(`  Password: "${user.password}" === "${password}" = ${passwordMatch}`)
      
      return emailMatch && passwordMatch
    })

    if (matchedUser) {
      console.log('✅ Match found:', matchedUser.email)
      return NextResponse.json({
        success: true,
        user: {
          id: matchedUser.id,
          email: matchedUser.email,
          name: matchedUser.name,
          role: matchedUser.role
        },
        message: 'Credentials match successfully'
      })
    } else {
      console.log('❌ No match found')
      return NextResponse.json({
        success: false,
        message: 'No matching user found',
        debug: {
          receivedEmail: email,
          receivedPasswordLength: password?.length,
          availableEmails: demoUsers.map(u => u.email)
        }
      })
    }

  } catch (error) {
    console.error('🚨 Test credentials error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Error testing credentials'
    }, { status: 500 })
  }
}