import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const providers = authOptions.providers?.map(provider => ({
      id: provider.id,
      name: provider.name,
      type: provider.type
    })) || []
    
    return Response.json(providers)
  } catch (error) {
    console.error('Providers endpoint error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}