import { prisma } from '@/lib/prisma'
import { UserRole } from '@crops-ai/shared'

export async function POST() {
  try {
    console.log('🌱 Seeding demo users...')

    const demoUsers = [
      {
        id: 'demo-1',
        email: 'demo@crops.ai',
        name: 'Demo User',
        role: UserRole.FARM_OWNER,
        emailVerified: new Date()
      },
      {
        id: 'admin-1', 
        email: 'admin@crops.ai',
        name: 'Admin User',
        role: UserRole.ADMIN,
        emailVerified: new Date()
      }
    ]

    for (const userData of demoUsers) {
      try {
        const user = await prisma.user.upsert({
          where: { email: userData.email },
          update: userData,
          create: userData,
        })
        console.log(`✅ User created/updated: ${user.email}`)
      } catch (userError) {
        console.error(`❌ Failed to create user ${userData.email}:`, userError)
      }
    }

    console.log('🎉 Demo users seeded successfully')
    
    return Response.json({ 
      success: true, 
      message: 'Demo users seeded successfully',
      users: demoUsers.map(u => ({ id: u.id, email: u.email, role: u.role }))
    })
  } catch (error) {
    console.error('❌ Error seeding demo users:', error)
    return Response.json({ 
      error: 'Failed to seed demo users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}