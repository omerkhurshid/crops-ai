export async function GET() {
  // For now, return an empty session
  // In production, you'd check for a JWT token or session cookie
  return Response.json({})
}