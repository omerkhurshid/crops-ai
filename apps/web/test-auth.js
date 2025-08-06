const testAuth = async () => {
  try {
    console.log('Testing authentication...');
    
    // Wait a bit for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get CSRF token first
    const csrfResponse = await fetch('http://localhost:3001/api/auth/csrf');
    if (!csrfResponse.ok) {
      console.error('Failed to get CSRF token:', csrfResponse.status);
      return;
    }
    
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;
    
    console.log('CSRF Token obtained:', csrfToken);
    
    // Test authentication with proper headers
    const authResponse = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': csrfResponse.headers.get('set-cookie') || ''
      },
      body: new URLSearchParams({
        csrfToken: csrfToken,
        email: 'demo@crops.ai',
        password: 'Demo123!',
        json: 'true'
      })
    });
    
    console.log('Auth Response Status:', authResponse.status);
    console.log('Auth Response Headers:', Object.fromEntries(authResponse.headers.entries()));
    
    const responseText = await authResponse.text();
    console.log('Response body:', responseText);
    
    if (authResponse.ok) {
      console.log('Authentication successful!');
      
      // Test session endpoint
      const sessionResponse = await fetch('http://localhost:3001/api/auth/session', {
        headers: {
          'Cookie': authResponse.headers.get('set-cookie') || ''
        }
      });
      
      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        console.log('Session data:', session);
      }
    } else {
      console.log('Authentication failed');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testAuth();