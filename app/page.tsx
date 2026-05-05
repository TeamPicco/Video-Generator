import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/demo-mode'

export default async function HomePage() {
  // Demo-Modus: direkt ins Dashboard
  if (isDemoMode()) {
    redirect('/dashboard')
  }

  // Supabase noch nicht konfiguriert → Setup
  if (!isSupabaseConfigured()) {
    redirect('/setup')
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')
  redirect('/auth')
}
