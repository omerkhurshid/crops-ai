import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-sage-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-sage-400 focus-visible:outline-none focus-visible:border-sage-400 focus-visible:ring-1 focus-visible:ring-sage-200 disabled:cursor-not-allowed disabled:opacity-50 hover:border-sage-300",
          className
        )}
        ref={ref}
        aria-label={props['aria-label'] || props.placeholder}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }