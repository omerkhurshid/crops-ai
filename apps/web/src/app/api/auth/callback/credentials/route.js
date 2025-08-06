export async function POST(request) {
  try {
    let email, password;
    
    // Check content type
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Handle JSON
      const body = await request.json();
      email = body.email;
      password = body.password;
    } else {
      // Handle form data
      const formData = await request.formData();
      email = formData.get('email');
      password = formData.get('password');
    }

    console.log('Login attempt:', { email, hasPassword: !!password });

    // Demo users
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

    const user = demoUsers.find(u => u.email === email && u.password === password)

    if (!user) {
      console.log('Login failed: Invalid credentials');
      return Response.json({ 
        url: 'https://crops-ai-gray.vercel.app/api/auth/error?error=CredentialsSignin' 
      })
    }

    console.log('Login successful:', user.email);
    
    // In a real implementation, set a session cookie here
    // For now, just return success redirect
    return Response.json({ 
      url: 'https://crops-ai-gray.vercel.app/dashboard' 
    })
  } catch (error) {
    console.error('Auth error:', error);
    return Response.json({ 
      url: 'https://crops-ai-gray.vercel.app/api/auth/error?error=Configuration' 
    })
  }
}