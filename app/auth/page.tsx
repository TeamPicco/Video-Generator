'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  if (!isSupabaseConfigured()) {
    router.replace('/setup')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Bestätigungs-E-Mail wurde gesendet. Bitte prüfe dein Postfach.')
      }
    } catch (e: any) {
      setError(e.message || 'Fehler beim Anmelden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3d1a0e20] via-transparent to-[#c9a84c10]" />
        <div className="relative text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#e8c870] flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(201,168,76,0.3)]">
              <span className="text-3xl font-bold text-[#0a0a0a]">AI</span>
            </div>
            <h1
              className="text-4xl font-bold text-[#f5f0e8] mb-4"
              style={{ fontFamily: 'var(--font-display, serif)' }}
            >
              Steakhouse
              <span className="block gold-text">Video Generator</span>
            </h1>
            <p className="text-[#888] leading-relaxed">
              Cinematic Instagram-Videos für Premium-Steakhouses — vollautomatisch, in Minuten.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h2
              className="text-2xl font-bold text-[#f5f0e8] mb-1"
              style={{ fontFamily: 'var(--font-display, serif)' }}
            >
              {mode === 'login' ? 'Willkommen zurück' : 'Account erstellen'}
            </h2>
            <p className="text-sm text-[#888]">
              {mode === 'login' ? 'Melde dich an um weiterzumachen' : 'Erstelle deinen kostenlosen Account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-Mail"
              type="email"
              placeholder="dein@restaurant.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Passwort"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-900 text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900 text-emerald-400 text-sm">
                {success}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {mode === 'login' ? 'Anmelden' : 'Account erstellen'}
            </Button>
          </form>

          <p className="text-center text-sm text-[#888] mt-6">
            {mode === 'login' ? 'Noch kein Account?' : 'Bereits registriert?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-[#c9a84c] hover:text-[#e8c870] transition-colors"
            >
              {mode === 'login' ? 'Registrieren' : 'Anmelden'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
