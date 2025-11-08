import * as React from "react"
import { cn } from "../../lib/utils"
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-sage-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-sage-400 focus-visible:outline-none focus-visible:border-sage-400 focus-visible:ring-1 focus-visible:ring-sage-200 disabled:cursor-not-allowed disabled:opacity-50 hover:border-sage-300 resize-vertical",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"
export { Textarea }