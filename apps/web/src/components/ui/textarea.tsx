import * as React from "react"
import { cn } from "../../lib/utils"
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-[#DDE4D8] bg-white px-3 py-2 text-sm text-[#1A1A1A] shadow-sm transition-colors placeholder:text-[#555555] focus-visible:outline-none focus-visible:border-[#7A8F78] focus-visible:ring-1 focus-visible:ring-[#DDE4D8] disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#7A8F78] resize-vertical",
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