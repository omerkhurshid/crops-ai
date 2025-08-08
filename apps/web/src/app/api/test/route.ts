export async function GET() {
  return Response.json({ message: 'App directory routing working', timestamp: new Date().toISOString() })
}