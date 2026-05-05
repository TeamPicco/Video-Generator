import { redirect } from 'next/navigation'
import { isSupabaseConfigured, createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    redirect('/setup')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')
  redirect('/auth')
}
