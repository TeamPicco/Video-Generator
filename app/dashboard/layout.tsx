import { Sidebar } from '@/components/dashboard/Sidebar'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Ohne Supabase: Demo-Modus erlaubt, kein Auth-Check
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth')
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">{children}</main>
    </div>
  )
}
