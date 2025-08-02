import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  })
}

export const supabase = createSupabaseClient()