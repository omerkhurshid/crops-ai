export async function GET() {
  const response = Response.json({ url: 'https://crops-ai-gray.vercel.app/login' })
  
  // Clear session cookie
  response.headers.set('Set-Cookie', `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
  
  return response
}

export async function POST() {
  const response = Response.json({ url: 'https://crops-ai-gray.vercel.app/login' })
  
  // Clear session cookie
  response.headers.set('Set-Cookie', `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
  
  return response
}