"use client"
import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"
interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded-sm border border-[#E6E6E6] bg-white cursor-pointer transition-all duration-200",
            "hover:border-[#7A8F78]",
            "focus-within:ring-2 focus-within:ring-[#7A8F78] focus-within:ring-offset-2",
            checked && "bg-[#7A8F78] border-[#7A8F78] text-white",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          onClick={() => !disabled && onCheckedChange?.(!checked)}
        >
          {checked && (
            <div className="flex items-center justify-center h-full">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"
export { Checkbox }