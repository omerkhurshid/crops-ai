'use client'
import { forwardRef } from 'react'
interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
}
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled = false, size = 'md', className = '', id, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked)
      }
    }
    const sizeClasses = {
      sm: {
        track: 'w-8 h-4',
        thumb: 'w-3 h-3',
        translate: checked ? 'translate-x-4' : 'translate-x-0.5'
      },
      md: {
        track: 'w-11 h-6',
        thumb: 'w-5 h-5',
        translate: checked ? 'translate-x-5' : 'translate-x-0.5'
      },
      lg: {
        track: 'w-14 h-7',
        thumb: 'w-6 h-6',
        translate: checked ? 'translate-x-7' : 'translate-x-0.5'
      }
    }
    const { track, thumb, translate } = sizeClasses[size]
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleClick}
        disabled={disabled}
        id={id}
        className={`
          ${track}
          relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2
          ${checked 
            ? 'bg-[#7A8F78]' 
            : 'bg-[#DDE4D8]'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-opacity-90'
          }
          ${className}
        `}
        {...props}
      >
        <span className="sr-only">Toggle switch</span>
        <span
          className={`
            ${thumb}
            pointer-events-none inline-block rounded-full bg-white shadow-lg transform ring-0 
            transition duration-200 ease-in-out
            ${translate}
          `}
        />
      </button>
    )
  }
)
Switch.displayName = 'Switch'