'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const KEY_GROUPS = [
  {
    group: 'Supabase — Kostenlos',
    description: 'Datenbank, Auth & Datei-Speicher. Kostenloses Konto reicht.',
    keys: [
      { name: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL', placeholder: 'https://xxxx.supabase.co', link: 'https://supabase.com/dashboard/account/tokens' },
      { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Supabase Anon Key', placeholder: 'eyJhbGci...', link: 'https://supabase.com/dashboard' },
      { name: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Service Role Key', placeholder: 'eyJhbGci...', link: 'https://supabase.com/dashboard' },
    ],
  },
  {
    group: 'fal.ai — ~5–10 €/Monat',
    description: 'KI-Bilder (Flux Pro) + KI-Videos (Wan2.1). Ein Key für alles. Pay-per-use.',
    keys: [
      { name: 'FAL_API_KEY', label: 'fal.ai API Key', placeholder: 'key_...', link: 'https://fal.ai/dashboard/keys' },
    ],
  },
  {
    group: 'Anthropic Claude — ~1 €/Monat',
    description: 'Schreibt die Storyboards, Hooks und Captions.',
    keys: [
      { name: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', placeholder: 'sk-ant-...', link: 'https://console.anthropic.com/settings/keys' },
    ],
  },
  {
    group: 'ElevenLabs — Kostenlos',
    description: 'Voice-Over für deine Videos. 10.000 Zeichen/Monat gratis.',
    keys: [
      { name: 'ELEVENLABS_API_KEY', label: 'ElevenLabs API Key', placeholder: 'sk_...', link: 'https://elevenlabs.io/app/settings/api-keys' },
    ],
  },
]

const REQUIRED = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'FAL_API_KEY', 'ANTHROPIC_API_KEY']

export default function SetupPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requiredFilled = REQUIRED.every((k) => values[k]?.trim())
  const filledCount = Object.values(values).filter((v) => v?.trim()).length

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      setSaved(true)
      setTimeout(() => (window.location.href = '/dashboard'), 1500)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#e8c870] flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(201,168,76,0.3)]">
            <span className="text-2xl font-bold text-[#0a0a0a]">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-[#f5f0e8] mb-2" style={{ fontFamily: 'var(--font-display, serif)' }}>
            App einrichten
          </h1>
          <p className="text-[#888] text-sm">
            Trage deine API-Keys ein. Werden sicher in{' '}
            <code className="text-[#c9a84c] bg-[#1a1a1a] px-1 rounded text-xs">.env.local</code> gespeichert.
          </p>
        </div>

        {/* Kosten-Übersicht */}
        <div className="mb-6 p-4 rounded-xl border border-[#c9a84c20] bg-[#c9a84c08]">
          <p className="text-xs text-[#c9a84c] font-semibold uppercase tracking-wider mb-2">Gesamtkosten</p>
          <p className="text-2xl font-bold text-[#f5f0e8]" style={{ fontFamily: 'var(--font-display, serif)' }}>
            ~6–12 € / Monat
          </p>
          <p className="text-xs text-[#888] mt-1">Supabase + ElevenLabs kostenlos · fal.ai + Claude pay-per-use</p>
        </div>

        <div className="space-y-4">
          {KEY_GROUPS.map((group) => (
            <Card key={group.group}>
              <CardContent className="p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-[#f5f0e8]">{group.group}</h2>
                  <p className="text-xs text-[#666] mt-0.5">{group.description}</p>
                </div>
                <div className="space-y-3">
                  {group.keys.map((key) => (
                    <div key={key.name} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          label={key.label}
                          placeholder={key.placeholder}
                          type="password"
                          value={values[key.name] || ''}
                          onChange={(e) => setValues((v) => ({ ...v, [key.name]: e.target.value }))}
                        />
                      </div>
                      <a
                        href={key.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 mb-0.5 rounded-lg border border-[#2a2a2a] text-[#888] hover:text-[#c9a84c] hover:border-[#c9a84c33] transition-all shrink-0"
                        title="Key besorgen →"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {values[key.name]?.trim() && (
                        <div className="p-2.5 mb-0.5 shrink-0">
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

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/30 border border-red-900 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={handleSave}
            loading={saving}
            disabled={!requiredFilled}
          >
            {saved ? (
              <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                ✓ Gespeichert — starte App…
              </motion.span>
            ) : (
              `${filledCount} Keys speichern & App starten`
            )}
          </Button>
          {!requiredFilled && (
            <p className="text-xs text-center text-[#555]">
              Supabase, fal.ai und Anthropic sind Pflicht
            </p>
          )}
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="w-full text-xs text-[#555] hover:text-[#888] transition-colors py-2"
          >
            Erstmal im Demo-Modus starten →
          </button>
        </div>
      </motion.div>
    </div>
  )
}
