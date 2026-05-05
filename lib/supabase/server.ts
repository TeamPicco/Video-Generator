import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

function getValidUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || !url.startsWith('http')) return PLACEHOLDER_URL
  return url
}

function getValidKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key || key.includes('your_')) return PLACEHOLDER_KEY
  return key
}

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(getValidUrl(), getValidKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!url && url.startsWith('http') && !url.includes('placeholder') && !url.includes('your_')
}
