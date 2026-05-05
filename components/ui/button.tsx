'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { forwardRef, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gold', size = 'md', loading, children, disabled, onClick, type, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none'

    const variants = {
      gold: 'bg-gradient-to-r from-[#c9a84c] to-[#e8c870] text-[#0a0a0a] hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] active:scale-[0.98]',
      ghost: 'text-[#c9a84c] hover:bg-[#c9a84c10] active:scale-[0.98]',
      outline:
        'border border-[#c9a84c33] text-[#f5f0e8] hover:border-[#c9a84c] hover:text-[#c9a84c] active:scale-[0.98]',
      danger:
        'border border-red-900 text-red-400 hover:bg-red-950 active:scale-[0.98]',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-4 text-base',
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        onClick={onClick as any}
        type={type}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
