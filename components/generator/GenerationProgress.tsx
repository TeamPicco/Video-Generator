'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface ProgressStep {
  id: string
  label: string
  icon: string
}

const STEPS: ProgressStep[] = [
  { id: 'images', label: 'Szenen-Bilder werden gerendert', icon: '🎨' },
  { id: 'videos', label: 'Video-Clips werden generiert', icon: '🎬' },
  { id: 'audio', label: 'Voice-Over wird aufgenommen', icon: '🎙️' },
  { id: 'assembly', label: 'Finaler Schnitt & Montage', icon: '✂️' },
  { id: 'complete', label: 'Masterpiece fertig!', icon: '✨' },
]

interface GenerationProgressProps {
  progress: number
  step: string
  message: string
}

export function GenerationProgress({ progress, step, message }: GenerationProgressProps) {
  const [particles, setParticles] = useState<{ x: number; y: number; id: number }[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => [
        ...prev.slice(-8),
        { x: Math.random() * 100, y: Math.random() * 100, id: Date.now() },
      ])
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const currentStep = STEPS.find((s) => s.id === step) || STEPS[0]

  return (
    <div className="flex flex-col items-center justify-center py-16 relative overflow-hidden">
      {/* Background particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full bg-[#c9a84c]"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 0, y: -30 }}
          transition={{ duration: 2 }}
        />
      ))}

      {/* Steak loader animation */}
      <div className="relative mb-8">
        <motion.div
          className="w-24 h-24 rounded-full border-4 border-[#1a1a1a] flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{
            background: 'conic-gradient(from 0deg, #c9a84c, #e8c870, #3d1a0e, #c9a84c)',
          }}
        >
          <div className="w-20 h-20 rounded-full bg-[#0a0a0a] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentStep.id}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                className="text-3xl"
              >
                {currentStep.icon}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Status */}
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-lg font-bold text-[#f5f0e8] mb-2"
          style={{ fontFamily: 'var(--font-display, serif)' }}
        >
          {currentStep.label}
        </motion.p>
      </AnimatePresence>
      <p className="text-sm text-[#888] mb-8">{message}</p>

      {/* Progress bar */}
      <div className="w-80 bg-[#1a1a1a] rounded-full h-1.5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #c9a84c, #e8c870)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-[#555] mt-2">{Math.round(progress)}% fertig</p>

      {/* Steps indicator */}
      <div className="flex gap-2 mt-8">
        {STEPS.slice(0, -1).map((s) => {
          const stepIndex = STEPS.indexOf(s)
          const currentIndex = STEPS.findIndex((st) => st.id === step)
          return (
            <div
              key={s.id}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                stepIndex <= currentIndex ? 'bg-[#c9a84c]' : 'bg-[#2a2a2a]'
              }`}
            />
          )
        })}
      </div>

      <p className="text-xs text-[#444] mt-6 italic">Generating your masterpiece…</p>
    </div>
  )
}
