const { PrismaClient } = require('@prisma/client');

async function testAuthAndFarms() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing authentication and farms...\n');
    
    // Test 1: Check all users
    console.log('👥 All users in database:');
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });
    console.log(users);
    console.log(`Total users: ${users.length}\n`);
    
    // Test 2: Check all farms with owners
    console.log('🏡 All farms with owners:');
    const allFarms = await prisma.farm.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });
    
    allFarms.forEach(farm => {
      console.log(`Farm: ${farm.name} | Owner: ${farm.owner.name} (${farm.owner.email}) | OwnerID: ${farm.ownerId}`);
    });
    console.log(`Total farms: ${allFarms.length}\n`);
    
    // Test 3: For each user, try the exact same query as farms page
    console.log('🧪 Testing farms query for each user:');
    for (const user of users) {
      console.log(`\n--- Testing user: ${user.name} (${user.email}) ---`);
      console.log(`User ID: ${user.id}`);
      
      const userFarms = await prisma.farm.findMany({
        where: { ownerId: user.id },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          fields: {
            select: { id: true, name: true, area: true }
          },
          _count: {
            select: { fields: true }
          }
        },
        orderBy: { name: 'asc' }
      });
      
      console.log(`Farms found for ${user.email}: ${userFarms.length}`);
      if (userFarms.length > 0) {
        userFarms.forEach(farm => {
          console.log(`  - ${farm.name} (${farm.fieldsCount || farm._count.fields} fields)`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthAndFarms();