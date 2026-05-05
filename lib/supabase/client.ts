import { createBrowserClient } from '@supabase/ssr'

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

export function createClient() {
  return createBrowserClient(getValidUrl(), getValidKey())
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!url && url.startsWith('http') && !url.includes('placeholder')
}
