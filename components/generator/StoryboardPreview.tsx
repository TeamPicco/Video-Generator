'use client'

import { motion } from 'framer-motion'
import type { Storyboard } from '@/lib/ai/claude'
import { Card, CardContent } from '@/components/ui/card'
import { Film, Mic, Hash, MessageCircle } from 'lucide-react'

interface StoryboardPreviewProps {
  storyboard: Storyboard
}

export function StoryboardPreview({ storyboard }: StoryboardPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Hook & CTA */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-[#c9a84c30] bg-[#c9a84c08]">
          <CardContent className="p-4">
            <p className="text-xs text-[#c9a84c] font-semibold uppercase tracking-wider mb-2">Hook (3 Sek)</p>
            <p className="text-sm font-bold text-[#f5f0e8]" style={{ fontFamily: 'var(--font-display, serif)' }}>
              &ldquo;{storyboard.hook}&rdquo;
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#2a2a2a]">
          <CardContent className="p-4">
            <p className="text-xs text-[#888] font-semibold uppercase tracking-wider mb-2">Call-to-Action</p>
            <p className="text-sm font-bold text-[#f5f0e8]">{storyboard.cta}</p>
          </CardContent>
        </Card>
      </div>

      {/* Voice-Over */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-3.5 h-3.5 text-[#c9a84c]" />
            <p className="text-xs text-[#888] font-semibold uppercase tracking-wider">Voice-Over Skript</p>
          </div>
          <p className="text-sm text-[#f5f0e8] leading-relaxed italic">&ldquo;{storyboard.voiceoverScript}&rdquo;</p>
        </CardContent>
      </Card>

      {/* Scenes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Film className="w-3.5 h-3.5 text-[#c9a84c]" />
          <p className="text-xs text-[#888] font-semibold uppercase tracking-wider">Szenen ({storyboard.scenes.length})</p>
        </div>
        <div className="space-y-2">
          {storyboard.scenes.map((scene, i) => (
            <motion.div
              key={scene.index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-3 bg-[#161616] rounded-lg p-3 border border-[#2a2a2a]"
            >
              <div className="w-8 h-8 rounded bg-[#c9a84c15] border border-[#c9a84c30] flex items-center justify-center shrink-0">
                <span className="text-[#c9a84c] text-xs font-bold">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#f5f0e8] font-medium">{scene.description}</p>
                <p className="text-xs text-[#555] mt-0.5">{scene.duration}s · {scene.imagePrompt.slice(0, 60)}...</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Caption + Hashtags */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-3.5 h-3.5 text-[#c9a84c]" />
            <p className="text-xs text-[#888] font-semibold uppercase tracking-wider">Instagram Caption</p>
          </div>
          <p className="text-sm text-[#f5f0e8] mb-3">{storyboard.caption}</p>
          <div className="flex flex-wrap gap-1.5">
            {storyboard.hashtags.map((tag) => (
              <span key={tag} className="text-xs text-[#c9a84c] bg-[#c9a84c10] px-2 py-0.5 rounded-full">
                <Hash className="w-2.5 h-2.5 inline -mt-0.5" />{tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
