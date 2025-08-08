export async function GET() {
  return Response.json({ 
    message: 'Auth directory routing works',
    timestamp: new Date().toISOString(),
    path: '/api/auth/test'
  })
}