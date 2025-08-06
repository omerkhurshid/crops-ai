const testVercelAuth = async () => {
  // Your Vercel deployment URL
  const baseUrl = 'https://crops-ai-gray.vercel.app';
  
  const testUser = async (email, password, expectedRole) => {
    console.log(`\n=== Testing ${email} ===`);
    
    try {
      // Get CSRF token
      const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
      const { csrfToken } = await csrfResponse.json();
      console.log('CSRF Token obtained');
      
      // Authenticate
      const authResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': csrfResponse.headers.get('set-cookie') || ''
        },
        body: new URLSearchParams({
          csrfToken: csrfToken,
          email: email,
          password: password,
          json: 'true'
        })
      });
      
      console.log(`Response status: ${authResponse.status}`);
      
      if (authResponse.ok) {
        console.log(`✓ Authentication successful for ${email}`);
        
        // Get session
        const sessionCookie = authResponse.headers.get('set-cookie');
        const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
          headers: {
            'Cookie': sessionCookie || ''
          }
        });
        
        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          console.log('Session data:', JSON.stringify(session, null, 2));
          
          if (session.user) {
            console.log(`✓ User role: ${session.user.role}`);
            if (session.user.role === expectedRole) {
              console.log(`✓ Role matches expected: ${expectedRole}`);
            } else {
              console.log(`✗ Role mismatch! Expected: ${expectedRole}, Got: ${session.user.role}`);
            }
          }
        }
      } else {
        console.log(`✗ Authentication failed for ${email}`);
        const errorText = await authResponse.text();
        console.log('Error response:', errorText);
      }
    } catch (error) {
      console.error(`✗ Test failed for ${email}:`, error.message);
    }
  };
  
  console.log(`Testing authentication on: ${baseUrl}`);
  console.log('Please update the baseUrl variable with your actual Vercel deployment URL!\n');
  
  // Test both demo users
  await testUser('demo@crops.ai', 'Demo123!', 'FARM_OWNER');
  await testUser('admin@crops.ai', 'Admin123!', 'ADMIN');
  
  // Test invalid credentials
  console.log('\n=== Testing invalid credentials ===');
  await testUser('demo@crops.ai', 'wrongpassword', 'FARM_OWNER');
  
  console.log('\n✓ All tests completed!');
};

testVercelAuth().catch(console.error);