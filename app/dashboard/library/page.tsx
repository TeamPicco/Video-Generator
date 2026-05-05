'use client'

import { useEffect, useState } from 'react'
import { VideoCard } from '@/components/dashboard/VideoCard'
import { motion } from 'framer-motion'
import { Film } from 'lucide-react'
import Link from 'next/link'

export default function LibraryPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = async () => {
    const res = await fetch('/api/projects')
    if (res.ok) {
      const data = await res.json()
      setProjects(data.projects || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Projekt wirklich löschen?')) return
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' })
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-[#f5f0e8] mb-1"
          style={{ fontFamily: 'var(--font-display, serif)' }}
        >
          Video-Bibliothek
        </h1>
        <p className="text-sm text-[#888]">{projects.length} Projekte</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[#2a2a2a] overflow-hidden">
              <div className="aspect-[9/16] max-h-48 shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 shimmer rounded" />
                <div className="h-3 w-1/2 shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-[#111] border border-[#2a2a2a] flex items-center justify-center mb-6">
            <Film className="w-8 h-8 text-[#555]" />
          </div>
          <h2 className="text-xl font-semibold text-[#f5f0e8] mb-2" style={{ fontFamily: 'var(--font-display, serif)' }}>
            Noch keine Videos
          </h2>
          <p className="text-sm text-[#888] mb-6">Erstelle dein erstes cinematic Steakhouse-Video</p>
          <Link
            href="/dashboard/create"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#c9a84c] to-[#e8c870] text-[#0a0a0a] font-semibold text-sm"
          >
            Video erstellen →
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.map((project, i) => (
            <VideoCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
