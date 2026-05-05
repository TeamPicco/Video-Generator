'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TemplateSelector } from '@/components/generator/TemplateSelector'
import { StoryboardPreview } from '@/components/generator/StoryboardPreview'
import { GenerationProgress } from '@/components/generator/GenerationProgress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { Storyboard } from '@/lib/ai/claude'
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react'

type Step = 'configure' | 'storyboard' | 'generating' | 'complete'

const TONE_OPTIONS = [
  { value: 'luxuriös', label: 'Luxuriös & Premium' },
  { value: 'rustikal-modern', label: 'Rustikal-Modern' },
  { value: 'emotional', label: 'Emotional & Einladend' },
  { value: 'minimalistisch', label: 'Minimalistisch & Clean' },
  { value: 'dramatisch', label: 'Dramatisch & Cinematic' },
]

const CTA_OPTIONS = [
  { value: 'reservation', label: 'Tisch reservieren' },
  { value: 'voucher', label: 'Gutschein kaufen' },
  { value: 'catering', label: 'Catering anfragen' },
  { value: 'events', label: 'Event-Tickets' },
]

export default function CreatePage() {
  const [step, setStep] = useState<Step>('configure')
  const [template, setTemplate] = useState('perfect_steak')
  const [form, setForm] = useState({
    steakName: '',
    price: '',
    occasion: '',
    tone: 'luxuriös',
    ctaType: 'reservation',
  })
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [progress, setProgress] = useState({ step: 'images', progress: 0, message: '' })
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateStoryboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType: template, ...form }),
      })
      if (!res.ok) throw new Error('Storyboard-Generierung fehlgeschlagen')
      const data = await res.json()
      setStoryboard(data.storyboard)
      setProjectId(data.project.id)
      setStep('storyboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler')
    } finally {
      setLoading(false)
    }
  }

  const startGeneration = async () => {
    if (!storyboard || !projectId) return
    setLoading(true)
    setError(null)

    try {
      const initRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, storyboard, ctaText: form.ctaType }),
      })
      if (!initRes.ok) throw new Error((await initRes.json()).error)
      const { videoId } = await initRes.json()

      setStep('generating')

      const streamRes = await fetch('/api/generate-video/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, videoId, storyboard, ctaText: form.ctaType }),
      })

      const reader = streamRes.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('Stream nicht verfügbar')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

        for (const line of lines) {
          const data = JSON.parse(line.slice(6))
          if (data.type === 'progress') {
            setProgress({ step: data.step, progress: data.progress, message: data.message })
          } else if (data.type === 'complete') {
            setVideoUrl(data.videoUrl)
            setStep('complete')
          } else if (data.type === 'error') {
            throw new Error(data.message)
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler')
      setStep('storyboard')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('configure')
    setStoryboard(null)
    setProjectId(null)
    setVideoUrl(null)
    setError(null)
    setProgress({ step: 'images', progress: 0, message: '' })
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-[#f5f0e8] mb-1"
          style={{ fontFamily: 'var(--font-display, serif)' }}
        >
          Video erstellen
        </h1>
        <p className="text-sm text-[#888]">KI generiert dein cinematic Steakhouse-Video vollautomatisch</p>
      </div>

      {/* Step indicator */}
      {step !== 'complete' && (
        <div className="flex items-center gap-2 mb-8">
          {['configure', 'storyboard', 'generating'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  s === step
                    ? 'bg-[#c9a84c] text-[#0a0a0a]'
                    : ['configure', 'storyboard', 'generating'].indexOf(step) > i
                    ? 'bg-[#c9a84c40] text-[#c9a84c]'
                    : 'bg-[#1a1a1a] text-[#555]'
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs ${s === step ? 'text-[#f5f0e8]' : 'text-[#555]'}`}>
                {s === 'configure' ? 'Konfigurieren' : s === 'storyboard' ? 'Storyboard' : 'Generieren'}
              </span>
              {i < 2 && <div className="w-8 h-px bg-[#2a2a2a]" />}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-lg border border-red-900 bg-red-950/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'configure' && (
          <motion.div
            key="configure"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg font-semibold text-[#f5f0e8] mb-4" style={{ fontFamily: 'var(--font-display, serif)' }}>
                Template wählen
              </h2>
              <TemplateSelector selected={template} onSelect={setTemplate} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Steak / Produkt (optional)"
                placeholder="z.B. Tomahawk Ribeye"
                value={form.steakName}
                onChange={(e) => setForm({ ...form, steakName: e.target.value })}
              />
              <Input
                label="Preis (optional)"
                placeholder="z.B. 89,00 €"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <Input
                label="Anlass (optional)"
                placeholder="z.B. Valentinstag, Wochenend-Special"
                value={form.occasion}
                onChange={(e) => setForm({ ...form, occasion: e.target.value })}
              />
              <Select
                label="Ton & Stil"
                options={TONE_OPTIONS}
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
              />
              <Select
                label="Call-to-Action"
                options={CTA_OPTIONS}
                value={form.ctaType}
                onChange={(e) => setForm({ ...form, ctaType: e.target.value })}
              />
            </div>

            <Button size="lg" onClick={generateStoryboard} loading={loading} className="w-full">
              <Sparkles className="w-4 h-4" />
              Storyboard generieren
            </Button>
          </motion.div>
        )}

        {step === 'storyboard' && storyboard && (
          <motion.div
            key="storyboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f5f0e8]" style={{ fontFamily: 'var(--font-display, serif)' }}>
                Dein Storyboard
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setStep('configure')}>
                ← Zurück
              </Button>
            </div>
            <StoryboardPreview storyboard={storyboard} />
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={generateStoryboard} loading={loading} className="flex-1">
                <RotateCcw className="w-4 h-4" />
                Neu generieren
              </Button>
              <Button onClick={startGeneration} className="flex-1">
                Video erstellen
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'generating' && (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GenerationProgress
              progress={progress.progress}
              step={progress.step}
              message={progress.message}
            />
          </motion.div>
        )}

        {step === 'complete' && videoUrl && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#e8c870] flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-3xl">✨</span>
            </motion.div>
            <h2
              className="text-3xl font-bold text-[#f5f0e8] mb-2"
              style={{ fontFamily: 'var(--font-display, serif)' }}
            >
              Masterpiece fertig!
            </h2>
            <p className="text-[#888] mb-8">Dein cinematic Steakhouse-Video ist bereit</p>
            <div className="flex gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => {
                  const a = document.createElement('a')
                  a.href = videoUrl
                  a.download = 'steakhouse-video.mp4'
                  a.click()
                }}
              >
                Video herunterladen
              </Button>
              <Button variant="outline" size="lg" onClick={reset}>
                Neues Video
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
