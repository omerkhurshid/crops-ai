// NextAuth logging endpoint - minimal implementation
export async function POST() {
  // Just return OK for NextAuth logging
  return Response.json({ ok: true })
}