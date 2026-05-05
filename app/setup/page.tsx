'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ExternalLink, Copy } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const REQUIRED_KEYS = [
  {
    group: 'Supabase (Pflicht)',
    keys: [
      { name: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL', placeholder: 'https://xxxx.supabase.co', link: 'https://supabase.com/dashboard' },
      { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Supabase Anon Key', placeholder: 'eyJhbGci...', link: 'https://supabase.com/dashboard' },
      { name: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Supabase Service Role Key', placeholder: 'eyJhbGci...', link: 'https://supabase.com/dashboard' },
    ],
  },
  {
    group: 'Anthropic Claude (Pflicht)',
    keys: [
      { name: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', placeholder: 'sk-ant-...', link: 'https://console.anthropic.com' },
    ],
  },
  {
    group: 'KI-Video (mind. einer)',
    keys: [
      { name: 'RUNWAY_API_KEY', label: 'Runway Gen-4 API Key', placeholder: 'key_...', link: 'https://app.runwayml.com' },
      { name: 'FLUX_API_KEY', label: 'Flux Pro API Key', placeholder: 'key_...', link: 'https://api.us1.bfl.ai' },
      { name: 'KLING_API_KEY', label: 'Kling AI API Key (Fallback)', placeholder: 'key_...', link: 'https://klingai.com' },
    ],
  },
  {
    group: 'ElevenLabs Voice-Over (optional)',
    keys: [
      { name: 'ELEVENLABS_API_KEY', label: 'ElevenLabs API Key', placeholder: 'key_...', link: 'https://elevenlabs.io' },
    ],
  },
]

export default function SetupPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => window.location.href = '/auth', 1500)
    }
  }

  const filledCount = Object.values(values).filter(Boolean).length
  const requiredFilled = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'ANTHROPIC_API_KEY']
    .every((k) => values[k])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#e8c870] flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(201,168,76,0.3)]">
            <span className="text-2xl font-bold text-[#0a0a0a]">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-[#f5f0e8] mb-2" style={{ fontFamily: 'var(--font-display, serif)' }}>
            Setup — API-Keys eingeben
          </h1>
          <p className="text-[#888] text-sm">
            Trage deine API-Keys ein. Alle werden sicher in <code className="text-[#c9a84c] bg-[#1a1a1a] px-1 py-0.5 rounded text-xs">.env.local</code> gespeichert.
          </p>
        </div>

        <div className="space-y-6">
          {REQUIRED_KEYS.map((group) => (
            <Card key={group.group}>
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-[#c9a84c] mb-4 uppercase tracking-wider">{group.group}</h2>
                <div className="space-y-4">
                  {group.keys.map((key) => (
                    <div key={key.name} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Input
                          label={key.label}
                          placeholder={key.placeholder}
                          type="password"
                          value={values[key.name] || ''}
                          onChange={(e) => setValues({ ...values, [key.name]: e.target.value })}
                        />
                      </div>
                      <a
                        href={key.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg border border-[#2a2a2a] text-[#888] hover:text-[#c9a84c] hover:border-[#c9a84c33] transition-all shrink-0"
                        title="API-Key besorgen"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {values[key.name] && (
                        <div className="p-2.5 shrink-0">
                          <Check className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={handleSave}
            loading={saving}
            disabled={!requiredFilled}
          >
            {saved ? '✓ Gespeichert — weiter zur App' : `${filledCount} Keys speichern & starten`}
          </Button>
          {!requiredFilled && (
            <p className="text-xs text-center text-[#555]">
              Supabase URL, Anon Key und Anthropic Key sind Pflicht
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
