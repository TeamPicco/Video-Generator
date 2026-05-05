'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export const TEMPLATES = [
  {
    id: 'perfect_steak',
    name: 'Das perfekte Steak',
    description: 'Dry-Aged · Ribeye · Tomahawk Close-Up',
    emoji: '🥩',
    gradient: 'from-red-900 to-[#3d1a0e]',
  },
  {
    id: 'dinner_atmosphere',
    name: 'Dinner-Atmosphäre',
    description: 'Kerzenlicht · Ambiance · Elegante Gäste',
    emoji: '🕯️',
    gradient: 'from-amber-950 to-[#1a0e00]',
  },
  {
    id: 'chef_at_work',
    name: 'Chef at Work',
    description: 'Küche · Grillszenen · Zubereitung',
    emoji: '👨‍🍳',
    gradient: 'from-zinc-900 to-[#111]',
  },
  {
    id: 'special_offer',
    name: 'Special Offer',
    description: 'Wochen-Special · Preis · CTA',
    emoji: '⭐',
    gradient: 'from-[#2a1f00] to-[#0a0a0a]',
  },
  {
    id: 'event_promo',
    name: 'Event-Promo',
    description: 'Wine & Dine · Valentinstag · Events',
    emoji: '🍷',
    gradient: 'from-purple-950 to-[#0a0a0a]',
  },
  {
    id: 'online_voucher',
    name: 'Online-Gutschein',
    description: 'Direkt-CTA · Online-Kauf · Geschenk',
    emoji: '🎁',
    gradient: 'from-emerald-950 to-[#0a0a0a]',
  },
]

interface TemplateSelectorProps {
  selected: string
  onSelect: (id: string) => void
}

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TEMPLATES.map((template, i) => (
        <motion.button
          key={template.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(template.id)}
          className={cn(
            'relative overflow-hidden rounded-xl p-4 text-left border transition-all duration-300 cursor-pointer',
            selected === template.id
              ? 'border-[#c9a84c] bg-[#c9a84c10] shadow-[0_0_20px_rgba(201,168,76,0.15)]'
              : 'border-[#2a2a2a] bg-[#111] hover:border-[#3a3a3a] hover:bg-[#161616]'
          )}
        >
          <div className={cn('absolute inset-0 opacity-20 bg-gradient-to-br', template.gradient)} />
          <div className="relative">
            <div className="text-2xl mb-2">{template.emoji}</div>
            <p className="text-sm font-semibold text-[#f5f0e8]" style={{ fontFamily: 'var(--font-display, serif)' }}>
              {template.name}
            </p>
            <p className="text-xs text-[#888] mt-0.5">{template.description}</p>
          </div>
          {selected === template.id && (
            <motion.div
              layoutId="template-check"
              className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#c9a84c] flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-[#0a0a0a]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  )
}
