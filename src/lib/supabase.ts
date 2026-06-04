import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  // Helps catch a missing .env early during development.
  // eslint-disable-next-line no-console
  console.error('VITE_SUPABASE_URL yoki VITE_SUPABASE_ANON_KEY .env da topilmadi')
}

export const supabase = createClient(url, anonKey)
