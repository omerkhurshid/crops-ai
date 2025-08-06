import { NextRequest } from 'next/server'
import { signIn } from 'next-auth/react'

export async function GET(request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Login Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .form { max-width: 400px; margin: 20px 0; }
        input, button { display: block; width: 100%; margin: 10px 0; padding: 10px; }
        button { background: #0070f3; color: white; border: none; cursor: pointer; }
        #result { margin-top: 20px; padding: 10px; background: #f5f5f5; }
        .info { background: #e3f2fd; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Login Test</h1>
    
    <div class="info">
        <h3>Test Accounts:</h3>
        <p><strong>Demo User:</strong> demo@crops.ai / Demo123!</p>
        <p><strong>Admin User:</strong> admin@crops.ai / Admin123!</p>
        <p><strong>Your Registered User:</strong> test6669@example.com / TestPass123!</p>
    </div>
    
    <div class="form">
        <input type="email" id="email" placeholder="Email" value="test6669@example.com">
        <input type="password" id="password" placeholder="Password" value="TestPass123!">
        <button onclick="testCredentialsLogin()">Test Credentials Login</button>
        <button onclick="testDirectAPI()">Test Direct API</button>
    </div>
    
    <div id="result"></div>
    
    <script>
        async function testCredentialsLogin() {
            const result = document.getElementById('result');
            result.innerHTML = 'Testing credentials login...';
            
            try {
                // Use fetch to call NextAuth signIn endpoint
                const response = await fetch('/api/auth/callback/credentials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: document.getElementById('email').value,
                        password: document.getElementById('password').value,
                        redirect: false
                    })
                });
                
                const data = await response.text();
                result.innerHTML = '<h3>Login Response:</h3><pre>' + response.status + ' ' + response.statusText + '</pre>';
                
                if (response.ok) {
                    result.innerHTML += '<p>Login might have succeeded! Check the session.</p>';
                    // Try to get session
                    const sessionResponse = await fetch('/api/auth/session');
                    const session = await sessionResponse.json();
                    result.innerHTML += '<h3>Session:</h3><pre>' + JSON.stringify(session, null, 2) + '</pre>';
                }
            } catch (error) {
                result.innerHTML = '<h3>Error:</h3><pre>' + error.message + '</pre>';
            }
        }
        
        async function testDirectAPI() {
            const result = document.getElementById('result');
            result.innerHTML = 'Testing direct API call...';
            
            try {
                // Direct call to check authentication
                const csrfResponse = await fetch('/api/auth/csrf');
                const csrfData = await csrfResponse.json();
                
                const response = await fetch('/api/auth/signin/credentials', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfData.csrfToken
                    },
                    body: JSON.stringify({
                        email: document.getElementById('email').value,
                        password: document.getElementById('password').value,
                        callbackUrl: '/dashboard'
                    })
                });
                
                const data = await response.text();
                result.innerHTML = '<h3>Direct API Response:</h3><pre>Status: ' + response.status + '</pre>';
                
                // Check session
                const sessionResponse = await fetch('/api/auth/session');
                const session = await sessionResponse.json();
                result.innerHTML += '<h3>Current Session:</h3><pre>' + JSON.stringify(session, null, 2) + '</pre>';
            } catch (error) {
                result.innerHTML = '<h3>Error:</h3><pre>' + error.message + '</pre>';
            }
        }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}