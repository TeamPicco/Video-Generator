'use client'

import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm text-[#888] font-medium">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              'w-full px-4 py-2.5 pr-10 rounded-lg text-sm text-[#f5f0e8]',
              'bg-[#1a1a1a] border border-[#2a2a2a] appearance-none',
              'focus:outline-none focus:border-[#c9a84c66] focus:ring-1 focus:ring-[#c9a84c33]',
              'transition-all duration-200 cursor-pointer',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#1a1a1a]">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888] pointer-events-none" />
        </div>
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }
