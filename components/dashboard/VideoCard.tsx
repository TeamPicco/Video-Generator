'use client'

import { motion } from 'framer-motion'
import { Download, Trash2, Play, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VideoCardProps {
  project: {
    id: string
    name: string
    template_type: string
    status: string
    created_at: string
    videos: Array<{
      id: string
      status: string
      video_url: string | null
      thumbnail_url: string | null
      created_at: string
    }>
  }
  onDelete: (id: string) => void
  index: number
}

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, label: 'Fertig', color: 'text-emerald-400' },
  generating: { icon: Loader2, label: 'Wird erstellt…', color: 'text-[#c9a84c]' },
  draft: { icon: Clock, label: 'Entwurf', color: 'text-[#888]' },
  failed: { icon: AlertCircle, label: 'Fehler', color: 'text-red-400' },
}

const TEMPLATE_LABELS: Record<string, string> = {
  perfect_steak: 'Das perfekte Steak',
  dinner_atmosphere: 'Dinner-Atmosphäre',
  chef_at_work: 'Chef at Work',
  special_offer: 'Special Offer',
  event_promo: 'Event-Promo',
  online_voucher: 'Online-Gutschein',
}

export function VideoCard({ project, onDelete, index }: VideoCardProps) {
  const video = project.videos?.[0]
  const status = video?.status || project.status
  const StatusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft
  const Icon = StatusConfig.icon

  const handleDownload = () => {
    if (!video?.video_url) return
    const a = document.createElement('a')
    a.href = video.video_url
    a.download = `${project.name}.mp4`
    a.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="group rounded-xl border border-[#2a2a2a] bg-[#111] overflow-hidden hover:border-[#3a3a3a] transition-all duration-300"
    >
      {/* Thumbnail / Preview */}
      <div className="relative aspect-[9/16] max-h-48 bg-[#0a0a0a] overflow-hidden">
        {video?.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {status === 'generating' ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#888]">Generiert…</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-2">
                  <Play className="w-5 h-5 text-[#555]" />
                </div>
                <p className="text-xs text-[#444]">Kein Vorschau</p>
              </div>
            )}
          </div>
        )}

        {/* Play overlay for completed */}
        {video?.video_url && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <a
              href={video.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-[#c9a84c] flex items-center justify-center"
            >
              <Play className="w-5 h-5 text-[#0a0a0a] ml-0.5" />
            </a>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-sm font-semibold text-[#f5f0e8] mb-1 truncate" style={{ fontFamily: 'var(--font-display, serif)' }}>
          {project.name}
        </p>
        <p className="text-xs text-[#555] mb-3">{TEMPLATE_LABELS[project.template_type] || project.template_type}</p>

        <div className="flex items-center justify-between">
          <div className={cn('flex items-center gap-1.5', StatusConfig.color)}>
            <Icon className={cn('w-3.5 h-3.5', status === 'generating' && 'animate-spin')} />
            <span className="text-xs">{StatusConfig.label}</span>
          </div>

          <div className="flex gap-1">
            {video?.video_url && (
              <button
                onClick={handleDownload}
                className="p-1.5 rounded hover:bg-[#1a1a1a] text-[#888] hover:text-[#c9a84c] transition-colors"
                title="Herunterladen"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onDelete(project.id)}
              className="p-1.5 rounded hover:bg-[#1a1a1a] text-[#888] hover:text-red-400 transition-colors"
              title="Löschen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
