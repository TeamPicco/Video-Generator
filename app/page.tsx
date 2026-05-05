import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/server'

export default async function HomePage() {
  // Wenn Supabase konfiguriert: Auth prüfen
  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
    redirect('/auth')
  }

  // Ohne Supabase: direkt ins Dashboard (Demo oder mit fal.ai/Anthropic)
  redirect('/dashboard')
}
