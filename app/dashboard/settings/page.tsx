'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Info, Zap } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-[#f5f0e8] mb-1"
          style={{ fontFamily: 'var(--font-display, serif)' }}
        >
          Einstellungen
        </h1>
        <p className="text-sm text-[#888]">System-Informationen und API-Status</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#c9a84c]" />
              <h2 className="text-base font-semibold text-[#f5f0e8]">API-Verbindungen</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Anthropic Claude', env: 'ANTHROPIC_API_KEY' },
              { name: 'Runway Gen-4', env: 'RUNWAY_API_KEY' },
              { name: 'Flux Pro', env: 'FLUX_API_KEY' },
              { name: 'ElevenLabs', env: 'ELEVENLABS_API_KEY' },
              { name: 'Supabase', env: 'NEXT_PUBLIC_SUPABASE_URL' },
            ].map((api) => (
              <div key={api.name} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                <span className="text-sm text-[#f5f0e8]">{api.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-[#888] font-mono">
                  {api.env}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#c9a84c]" />
              <h2 className="text-base font-semibold text-[#f5f0e8]">Limits & Pläne</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#888]">Max. Videos / Tag</span>
              <span className="text-[#f5f0e8] font-semibold">10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#888]">Video-Speicherdauer</span>
              <span className="text-[#f5f0e8] font-semibold">30 Tage</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#888]">Ausgabeformat</span>
              <span className="text-[#f5f0e8] font-semibold">MP4, 9:16, 1080×1920</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#888]">KI-Video Engine</span>
              <span className="text-[#f5f0e8] font-semibold">Runway Gen-4 + Kling Fallback</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
