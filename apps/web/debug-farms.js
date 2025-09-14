const { PrismaClient } = require('@prisma/client');

async function debugFarms() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Starting farm ownership debugging...\n');
    
    // First, let's see all farms
    const allFarms = await prisma.farm.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { fields: true } }
      }
    });
    
    console.log(`📊 Total farms in database: ${allFarms.length}`);
    console.log('🏡 All farms with owners:');
    allFarms.forEach(farm => {
      console.log(`  - Farm: "${farm.name}" (ID: ${farm.id})`);
      console.log(`    Owner: ${farm.owner.name} (${farm.owner.email})`);
      console.log(`    Owner ID: ${farm.owner.id}`);
      console.log(`    Fields: ${farm._count.fields}`);
      console.log('');
    });
    
    // Now let's see all users
    console.log('\n👥 All users in database:');
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true }
    });
    
    allUsers.forEach(user => {
      console.log(`  - User: ${user.name} (${user.email})`);
      console.log(`    ID: ${user.id}`);
      console.log(`    Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Check for orphaned farms (farms with no valid owner)
    console.log('\n🔍 Checking for data integrity issues...');
    const orphanedFarms = await prisma.farm.findMany({
      where: {
        owner: null
      }
    });
    
    if (orphanedFarms.length > 0) {
      console.log(`⚠️  Found ${orphanedFarms.length} orphaned farms (no owner):`);
      orphanedFarms.forEach(farm => {
        console.log(`  - ${farm.name} (ID: ${farm.id}) - ownerId: ${farm.ownerId}`);
      });
    } else {
      console.log('✅ No orphaned farms found');
    }
    
  } catch (error) {
    console.error('❌ Database query failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugFarms();