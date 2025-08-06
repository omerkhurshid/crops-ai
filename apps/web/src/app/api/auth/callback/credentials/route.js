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
    
    // Create a simple session token
    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }
    
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64')
    
    // Set session cookie and redirect
    const response = Response.json({ 
      url: 'https://crops-ai-gray.vercel.app/dashboard' 
    })
    
    response.headers.set('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`)
    
    return response
  } catch (error) {
    console.error('Auth error:', error);
    return Response.json({ 
      url: 'https://crops-ai-gray.vercel.app/api/auth/error?error=Configuration' 
    })
  }
}