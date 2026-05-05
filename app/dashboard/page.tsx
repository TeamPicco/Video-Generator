import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Clapperboard, Film, TrendingUp, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: projects }, { data: usage }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, status, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('usage_tracking')
      .select('videos_generated')
      .eq('user_id', user!.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .single(),
  ])

  const totalVideos = projects?.length || 0
  const completedVideos = projects?.filter((p) => p.status === 'completed').length || 0
  const todayCount = usage?.videos_generated || 0

  const stats = [
    { label: 'Videos heute', value: `${todayCount}/10`, icon: TrendingUp, color: 'text-[#c9a84c]' },
    { label: 'Projekte gesamt', value: totalVideos, icon: Clapperboard, color: 'text-emerald-400' },
    { label: 'Fertige Videos', value: completedVideos, icon: Film, color: 'text-blue-400' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-[#f5f0e8] mb-1"
          style={{ fontFamily: 'var(--font-display, serif)' }}
        >
          Willkommen zurück
        </h1>
        <p className="text-[#888] text-sm">Erstelle dein nächstes cinematic Steakhouse-Video</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl border border-[#2a2a2a] bg-[#111] p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-[#888]">{stat.label}</p>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`} style={{ fontFamily: 'var(--font-display, serif)' }}>
                {stat.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Quick action */}
      <Link href="/dashboard/create">
        <div className="rounded-xl border border-[#c9a84c30] bg-[#c9a84c08] hover:bg-[#c9a84c12] hover:border-[#c9a84c55] transition-all duration-300 p-8 flex items-center gap-6 group cursor-pointer">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c870] flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] transition-shadow">
            <Plus className="w-7 h-7 text-[#0a0a0a]" />
          </div>
          <div>
            <h2
              className="text-xl font-bold text-[#f5f0e8] mb-1"
              style={{ fontFamily: 'var(--font-display, serif)' }}
            >
              Neues Video erstellen
            </h2>
            <p className="text-sm text-[#888]">
              KI generiert Storyboard, Szenen, Voice-Over und Schnitt automatisch
            </p>
          </div>
          <div className="ml-auto text-[#c9a84c] opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </div>
        </div>
      </Link>

      {/* Recent projects */}
      {totalVideos > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#f5f0e8]" style={{ fontFamily: 'var(--font-display, serif)' }}>
              Letzte Projekte
            </h2>
            <Link href="/dashboard/library" className="text-xs text-[#c9a84c] hover:text-[#e8c870]">
              Alle anzeigen →
            </Link>
          </div>
          <div className="space-y-2">
            {projects?.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#111] border border-[#1a1a1a]">
                <div
                  className={`w-2 h-2 rounded-full ${
                    p.status === 'completed'
                      ? 'bg-emerald-400'
                      : p.status === 'generating'
                      ? 'bg-[#c9a84c] animate-pulse'
                      : 'bg-[#444]'
                  }`}
                />
                <span className="text-sm text-[#888] text-xs">
                  {new Date(p.created_at).toLocaleDateString('de-DE')}
                </span>
                <span className="text-xs text-[#555] ml-auto capitalize">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
