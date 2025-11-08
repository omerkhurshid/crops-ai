/**
 * Supabase Migration Sign-in API
 * 
 * Handles authentication during the migration period.
 * Checks if user exists in old system (bcrypt) and migrates them to Supabase.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase authentication not configured' },
        { status: 503 }
      )
    }
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    // Check if user exists in our Prisma database
    const user = await prisma.user.findUnique({
      where: { email }
    })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }
    // Check if user has bcrypt password (legacy user)
    if (user.passwordHash) {
      const isValidPassword = await bcrypt.compare(password, user.passwordHash)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }
      // User is valid but needs migration to Supabase
      try {
        // Create user in Supabase Auth
        const { data: supabaseUser, error: supabaseError } = await supabase!.auth.admin.createUser({
          email: user.email,
          password: password,
          email_confirm: true,
          user_metadata: {
            name: user.name,
            role: user.role,
            migrated_from_nextauth: true
          }
        })
        if (supabaseError) {
          console.error('Failed to create user in Supabase:', supabaseError)
          // Fall back to legacy auth
          return NextResponse.json({ ok: true, legacy: true })
        }
        // Update our database to mark user as migrated
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: new Date(), // Mark as migrated
            passwordHash: null // Remove bcrypt hash
          }
        })
        return NextResponse.json({ 
          ok: true, 
          migrated: true,
          supabaseUserId: supabaseUser.user?.id
        })
      } catch (migrationError) {
        console.error('Migration error:', migrationError)
        // Fall back to legacy auth
        return NextResponse.json({ ok: true, legacy: true })
      }
    }
    // User exists but already migrated or no password hash
    return NextResponse.json({ ok: true, existing: true })
  } catch (error) {
    console.error('Supabase signin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}