export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')
  
  // Return a simple error page
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authentication Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .error-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
          }
          h1 { color: #dc2626; }
          a {
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
          }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Authentication Error</h1>
          <p>Error: ${error || 'Unknown error'}</p>
          <p>There was a problem signing you in.</p>
          <a href="/login">Back to Login</a>
        </div>
      </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}