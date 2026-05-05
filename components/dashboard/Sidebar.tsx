'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Clapperboard,
  LayoutDashboard,
  Palette,
  Settings,
  LogOut,
  Flame,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Übersicht', icon: LayoutDashboard },
  { href: '/dashboard/create', label: 'Video erstellen', icon: Clapperboard },
  { href: '/dashboard/library', label: 'Bibliothek', icon: Flame },
  { href: '/dashboard/brand', label: 'Brand & CTA', icon: Palette },
  { href: '/dashboard/settings', label: 'Einstellungen', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <aside className="w-64 h-screen bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#e8c870] flex items-center justify-center">
            <span className="text-[#0a0a0a] font-bold text-sm">AI</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-[#f5f0e8]" style={{ fontFamily: 'var(--font-display, serif)' }}>
              Steakhouse
            </p>
            <p className="text-xs text-[#c9a84c]">Video Generator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  active
                    ? 'bg-[#c9a84c15] text-[#c9a84c] border border-[#c9a84c30]'
                    : 'text-[#888] hover:text-[#f5f0e8] hover:bg-[#1a1a1a]'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="ml-auto w-1 h-4 bg-[#c9a84c] rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-[#1a1a1a]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#888] hover:text-red-400 hover:bg-[#1a1a1a] w-full transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Abmelden
        </button>
      </div>
    </aside>
  )
}
