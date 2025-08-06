import { NextRequest } from 'next/server'

// GET /api/test-registration - Simple test page
export async function GET(request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Registration Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .form { max-width: 400px; margin: 20px 0; }
        input, button { display: block; width: 100%; margin: 10px 0; padding: 10px; }
        button { background: #0070f3; color: white; border: none; cursor: pointer; }
        #result { margin-top: 20px; padding: 10px; background: #f5f5f5; }
    </style>
</head>
<body>
    <h1>Registration Test</h1>
    
    <div class="form">
        <input type="email" id="email" placeholder="Email" value="test@example.com">
        <input type="text" id="name" placeholder="Name" value="Test User">
        <input type="password" id="password" placeholder="Password" value="TestPass123!">
        <button onclick="testRegistration()">Test Debug Registration</button>
        <button onclick="testRegularRegistration()">Test Regular Registration</button>
        <button onclick="testSimpleRegistration()">Test Simple Registration</button>
        <button onclick="testFixedRegistration()">Test Fixed Registration</button>
        <button onclick="testFinalRegistration()">Test Final Registration (Raw SQL)</button>
    </div>
    
    <div id="result"></div>
    
    <script>
        async function testRegistration() {
            const result = document.getElementById('result');
            result.innerHTML = 'Testing debug registration...';
            
            try {
                const response = await fetch('/api/auth/register-debug', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: document.getElementById('email').value,
                        name: document.getElementById('name').value,
                        password: document.getElementById('password').value
                    })
                });
                
                const data = await response.json();
                result.innerHTML = '<h3>Debug Registration Result:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                result.innerHTML = '<h3>Error:</h3><pre>' + error.message + '</pre>';
            }
        }
        
        async function testRegularRegistration() {
            const result = document.getElementById('result');
            result.innerHTML = 'Testing regular registration...';
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: document.getElementById('email').value,
                        name: document.getElementById('name').value,
                        password: document.getElementById('password').value
                    })
                });
                
                const data = await response.json();
                result.innerHTML = '<h3>Regular Registration Result:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                result.innerHTML = '<h3>Error:</h3><pre>' + error.message + '</pre>';
            }
        }
        
        async function testSimpleRegistration() {
            const result = document.getElementById('result');
            result.innerHTML = 'Testing simple registration...';
            
            try {
                const response = await fetch('/api/auth/register-simple', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: document.getElementById('email').value,
                        name: document.getElementById('name').value,
                        password: document.getElementById('password').value
                    })
                });
                
                const data = await response.json();
                result.innerHTML = '<h3>Simple Registration Result:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                result.innerHTML = '<h3>Error:</h3><pre>' + error.message + '</pre>';
            }
        }
        
        async function testFixedRegistration() {
            const result = document.getElementById('result');
            result.innerHTML = 'Testing fixed registration...';
            
            try {
                const response = await fetch('/api/auth/register-fixed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: document.getElementById('email').value,
                        name: document.getElementById('name').value,
                        password: document.getElementById('password').value
                    })
                });
                
                const data = await response.json();
                result.innerHTML = '<h3>Fixed Registration Result:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                result.innerHTML = '<h3>Error:</h3><pre>' + error.message + '</pre>';
            }
        }
        
        async function testFinalRegistration() {
            const result = document.getElementById('result');
            result.innerHTML = 'Testing final registration (raw SQL)...';
            
            try {
                const response = await fetch('/api/auth/register-final', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: document.getElementById('email').value,
                        name: document.getElementById('name').value,
                        password: document.getElementById('password').value
                    })
                });
                
                const data = await response.json();
                result.innerHTML = '<h3>Final Registration Result:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
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