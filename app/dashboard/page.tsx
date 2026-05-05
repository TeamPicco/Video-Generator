import Link from 'next/link'
import { Clapperboard, Film, TrendingUp, Plus, Zap } from 'lucide-react'
import { isDemoMode } from '@/lib/demo-mode'

export default async function DashboardPage() {
  const demo = isDemoMode()

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-[#f5f0e8] mb-1"
            style={{ fontFamily: 'var(--font-display, serif)' }}
          >
            Willkommen
          </h1>
          <p className="text-[#888] text-sm">Erstelle dein nächstes cinematic Steakhouse-Video</p>
        </div>
        {demo && (
          <div className="flex items-center gap-2 bg-[#c9a84c15] border border-[#c9a84c30] rounded-lg px-3 py-2">
            <Zap className="w-4 h-4 text-[#c9a84c]" />
            <span className="text-xs text-[#c9a84c] font-semibold">Demo-Modus aktiv</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: demo ? 'Modus' : 'Videos heute', value: demo ? 'Demo' : '0/10', icon: TrendingUp, color: 'text-[#c9a84c]' },
          { label: 'Templates', value: '6', icon: Clapperboard, color: 'text-emerald-400' },
          { label: 'KI-Engine', value: demo ? 'Mock' : 'fal.ai', icon: Film, color: 'text-blue-400' },
        ].map((stat) => {
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

      {/* CTA */}
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
              {demo ? 'Video erstellen (Demo)' : 'Neues Video erstellen'}
            </h2>
            <p className="text-sm text-[#888]">
              {demo
                ? 'Volle UI & Flow — KI-Storyboard echt, Video simuliert'
                : 'KI generiert Storyboard, Szenen, Voice-Over und Schnitt automatisch'}
            </p>
          </div>
          <div className="ml-auto text-[#c9a84c] opacity-0 group-hover:opacity-100 transition-opacity text-xl">→</div>
        </div>
      </Link>

      {/* Demo setup hint */}
      {demo && (
        <div className="mt-6 p-5 rounded-xl border border-[#2a2a2a] bg-[#111]">
          <h3 className="text-sm font-semibold text-[#f5f0e8] mb-3">Für echte Videos brauchst du:</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'fal.ai API Key', price: '~5–10 €/Monat', url: 'https://fal.ai' },
              { name: 'Anthropic Claude', price: '~1 €/Monat', url: 'https://console.anthropic.com' },
              { name: 'ElevenLabs', price: 'Kostenlos', url: 'https://elevenlabs.io' },
              { name: 'Supabase', price: 'Kostenlos', url: 'https://supabase.com' },
            ].map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#222] transition-colors group"
              >
                <span className="text-sm text-[#f5f0e8]">{item.name}</span>
                <span className="text-xs text-[#c9a84c]">{item.price} →</span>
              </a>
            ))}
          </div>
          <p className="text-xs text-[#555] mt-3">
            Keys eintragen unter{' '}
            <Link href="/setup" className="text-[#c9a84c] hover:underline">/setup</Link>
          </p>
        </div>
      )}
    </div>
  )
}
