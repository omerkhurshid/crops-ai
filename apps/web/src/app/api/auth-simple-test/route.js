export async function GET() {
  return Response.json({ 
    message: 'Auth route test successful',
    timestamp: new Date().toISOString()
  })
}

export async function POST() {
  return Response.json({ 
    message: 'POST test successful',
    timestamp: new Date().toISOString()
  })
}