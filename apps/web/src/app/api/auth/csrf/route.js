export async function GET() {
  // Generate a simple CSRF token
  const csrfToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
  return Response.json({ csrfToken })
}