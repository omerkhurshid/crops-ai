export async function GET(request: Request, { params }: { params: { params: string[] } }) {
  return Response.json({ 
    message: 'Catch-all routing works',
    params: params.params,
    timestamp: new Date().toISOString()
  })
}