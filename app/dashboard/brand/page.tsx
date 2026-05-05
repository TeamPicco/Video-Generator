'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Link2, Upload, X, ImageIcon } from 'lucide-react'

interface BrandSettings {
  restaurant_name: string
  logo_url: string
  cta_reservation_url: string
  cta_voucher_url: string
  cta_catering_url: string
  cta_events_url: string
}

export default function BrandPage() {
  const [settings, setSettings] = useState<BrandSettings>({
    restaurant_name: '',
    logo_url: '',
    cta_reservation_url: '',
    cta_voucher_url: '',
    cta_catering_url: '',
    cta_events_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/brand-settings')
      .then((r) => r.json())
      .then((data) => { if (data.settings) setSettings(data.settings) })
  }, [])

  const uploadLogo = async (file: File) => {
    setLogoUploading(true)
    setLogoError(null)
    const form = new FormData()
    form.append('logo', file)
    const res = await fetch('/api/upload-logo', { method: 'POST', body: form })
    const data = await res.json()
    setLogoUploading(false)
    if (!res.ok) { setLogoError(data.error); return }
    setSettings((s) => ({ ...s, logo_url: data.url }))
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadLogo(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadLogo(file)
  }

  const handleSave = async () => {
    setLoading(true)
    await fetch('/api/brand-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#f5f0e8] mb-1" style={{ fontFamily: 'var(--font-display, serif)' }}>
          Brand & CTA
        </h1>
        <p className="text-sm text-[#888]">Logo, Restaurant-Daten und Call-to-Action Links</p>
      </div>

      <div className="space-y-6">

        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#c9a84c]" />
              <h2 className="text-base font-semibold text-[#f5f0e8]" style={{ fontFamily: 'var(--font-display, serif)' }}>
                Restaurant-Logo
              </h2>
            </div>
            <p className="text-xs text-[#888] mt-1">Wird am Ende jedes Videos eingeblendet · PNG, JPG, SVG · max. 5MB</p>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
              className="hidden"
              onChange={handleFileInput}
            />

            <AnimatePresence mode="wait">
              {settings.logo_url ? (
                /* Logo Preview */
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-24 h-24 rounded-xl border border-[#c9a84c30] bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#f5f0e8] font-medium mb-1">Logo hochgeladen ✓</p>
                    <p className="text-xs text-[#666] mb-3">Wird als Einblender am Video-Ende verwendet</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-[#c9a84c] hover:text-[#e8c870] transition-colors"
                      >
                        Austauschen
                      </button>
                      <span className="text-[#333]">·</span>
                      <button
                        onClick={() => setSettings((s) => ({ ...s, logo_url: '' }))}
                        className="text-xs text-[#666] hover:text-red-400 transition-colors"
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Upload Zone */
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                    ${dragOver
                      ? 'border-[#c9a84c] bg-[#c9a84c08]'
                      : 'border-[#2a2a2a] hover:border-[#c9a84c44] hover:bg-[#c9a84c05]'
                    }
                  `}
                >
                  {logoUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-[#888]">Wird hochgeladen…</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                        <Upload className="w-5 h-5 text-[#c9a84c]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#f5f0e8]">Logo hier ablegen</p>
                        <p className="text-xs text-[#666] mt-0.5">oder klicken zum Auswählen</p>
                      </div>
                      <p className="text-xs text-[#444]">PNG · JPG · SVG · WEBP · max. 5MB</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {logoError && (
              <p className="text-xs text-red-400 mt-2">{logoError}</p>
            )}
          </CardContent>
        </Card>

        {/* Restaurant Name */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-[#f5f0e8]" style={{ fontFamily: 'var(--font-display, serif)' }}>
              Restaurant
            </h2>
          </CardHeader>
          <CardContent>
            <Input
              label="Restaurant-Name"
              placeholder="Das Steakhouse"
              value={settings.restaurant_name}
              onChange={(e) => setSettings({ ...settings, restaurant_name: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* CTA Links */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#c9a84c]" />
              <h2 className="text-base font-semibold text-[#f5f0e8]" style={{ fontFamily: 'var(--font-display, serif)' }}>
                CTA-Links
              </h2>
            </div>
            <p className="text-xs text-[#888] mt-1">Diese Links erscheinen als Call-to-Action in deinen Videos</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Tisch reservieren', key: 'cta_reservation_url', placeholder: 'https://dein-restaurant.de/reservierung' },
              { label: 'Gutschein kaufen', key: 'cta_voucher_url', placeholder: 'https://dein-restaurant.de/gutschein' },
              { label: 'Catering anfragen', key: 'cta_catering_url', placeholder: 'https://dein-restaurant.de/catering' },
              { label: 'Event-Tickets', key: 'cta_events_url', placeholder: 'https://dein-restaurant.de/events' },
            ].map((field) => (
              <Input
                key={field.key}
                label={field.label}
                placeholder={field.placeholder}
                value={settings[field.key as keyof BrandSettings]}
                onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
              />
            ))}
          </CardContent>
        </Card>

        <Button size="lg" onClick={handleSave} loading={loading} className="w-full">
          {saved ? (
            <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              ✓ Gespeichert!
            </motion.span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Einstellungen speichern
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
