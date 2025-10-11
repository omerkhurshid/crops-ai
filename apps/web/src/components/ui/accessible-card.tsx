import * as React from "react"
import { cn } from "../../lib/utils"
import { getAriaAttributes } from "../../lib/accessibility"

export interface AccessibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  interactive?: boolean
  level?: number
}

const AccessibleCard = React.forwardRef<HTMLDivElement, AccessibleCardProps>(
  ({ className, interactive = false, level, ...props }, ref) => {
    const role = interactive ? 'button' : level ? 'region' : undefined
    
    if (interactive) {
      return (
        <button
          ref={ref as any}
          role={role}
          tabIndex={0}
          className={cn(
            "rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            className
          )}
          {...getAriaAttributes({ level })}
          {...(props as any)}
        />
      )
    }
    
    return (
      <div
        ref={ref}
        role={role}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          className
        )}
        {...getAriaAttributes({ level })}
        {...props}
      />
    )
  }
)
AccessibleCard.displayName = "AccessibleCard"

const AccessibleCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
AccessibleCardHeader.displayName = "AccessibleCardHeader"

const AccessibleCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }
>(({ className, level = 3, ...props }, ref) => {
  const HeadingProps = {
    ref: ref,
    className: cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
  
  switch (level) {
    case 1: return <h1 {...HeadingProps} />
    case 2: return <h2 {...HeadingProps} />
    case 3: return <h3 {...HeadingProps} />
    case 4: return <h4 {...HeadingProps} />
    case 5: return <h5 {...HeadingProps} />
    case 6: return <h6 {...HeadingProps} />
    default: return <h3 {...HeadingProps} />
  }
})
AccessibleCardTitle.displayName = "AccessibleCardTitle"

const AccessibleCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AccessibleCardDescription.displayName = "AccessibleCardDescription"

const AccessibleCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
AccessibleCardContent.displayName = "AccessibleCardContent"

const AccessibleCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
AccessibleCardFooter.displayName = "AccessibleCardFooter"

export {
  AccessibleCard,
  AccessibleCardHeader,
  AccessibleCardFooter,
  AccessibleCardTitle,
  AccessibleCardDescription,
  AccessibleCardContent,
}