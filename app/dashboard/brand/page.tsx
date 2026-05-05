'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Save, Link2 } from 'lucide-react'

interface BrandSettings {
  restaurant_name: string
  cta_reservation_url: string
  cta_voucher_url: string
  cta_catering_url: string
  cta_events_url: string
}

export default function BrandPage() {
  const [settings, setSettings] = useState<BrandSettings>({
    restaurant_name: '',
    cta_reservation_url: '',
    cta_voucher_url: '',
    cta_catering_url: '',
    cta_events_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/brand-settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings)
      })
  }, [])

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
        <h1
          className="text-3xl font-bold text-[#f5f0e8] mb-1"
          style={{ fontFamily: 'var(--font-display, serif)' }}
        >
          Brand & CTA
        </h1>
        <p className="text-sm text-[#888]">Restaurant-Daten und Call-to-Action Links konfigurieren</p>
      </div>

      <div className="space-y-6">
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
            <Input
              label="Tisch reservieren"
              placeholder="https://dein-restaurant.de/reservierung"
              value={settings.cta_reservation_url}
              onChange={(e) => setSettings({ ...settings, cta_reservation_url: e.target.value })}
            />
            <Input
              label="Gutschein kaufen"
              placeholder="https://dein-restaurant.de/gutschein"
              value={settings.cta_voucher_url}
              onChange={(e) => setSettings({ ...settings, cta_voucher_url: e.target.value })}
            />
            <Input
              label="Catering anfragen"
              placeholder="https://dein-restaurant.de/catering"
              value={settings.cta_catering_url}
              onChange={(e) => setSettings({ ...settings, cta_catering_url: e.target.value })}
            />
            <Input
              label="Event-Tickets"
              placeholder="https://dein-restaurant.de/events"
              value={settings.cta_events_url}
              onChange={(e) => setSettings({ ...settings, cta_events_url: e.target.value })}
            />
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
