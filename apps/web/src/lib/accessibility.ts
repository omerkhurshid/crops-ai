/**
 * Accessibility utilities and helpers
 */
// Generate unique IDs for ARIA relationships
let idCounter = 0
export function generateId(prefix = 'element'): string {
  return `${prefix}-${++idCounter}`
}
// Screen reader announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  document.body.appendChild(announcement)
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}
// Focus management
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>
  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus()
          e.preventDefault()
        }
      }
    }
    if (e.key === 'Escape') {
      const closeButton = element.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement
      if (closeButton) {
        closeButton.click()
      }
    }
  }
  element.addEventListener('keydown', handleKeyDown)
  firstFocusable?.focus()
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}
// Keyboard navigation helpers
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End'
} as const
// ARIA attributes helpers
export function getAriaAttributes(props: {
  label?: string
  describedBy?: string
  expanded?: boolean
  selected?: boolean
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  level?: number
  setSize?: number
  posInSet?: number
}) {
  const attrs: Record<string, string | undefined> = {}
  if (props.label) attrs['aria-label'] = props.label
  if (props.describedBy) attrs['aria-describedby'] = props.describedBy
  if (props.expanded !== undefined) attrs['aria-expanded'] = String(props.expanded)
  if (props.selected !== undefined) attrs['aria-selected'] = String(props.selected)
  if (props.disabled) attrs['aria-disabled'] = 'true'
  if (props.invalid) attrs['aria-invalid'] = 'true'
  if (props.required) attrs['aria-required'] = 'true'
  if (props.level) attrs['aria-level'] = String(props.level)
  if (props.setSize) attrs['aria-setsize'] = String(props.setSize)
  if (props.posInSet) attrs['aria-posinset'] = String(props.posInSet)
  return attrs
}
// Skip link component helper
export function createSkipLink(targetId: string, text = 'Skip to main content'): HTMLElement {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.textContent = text
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-primary text-primary-foreground p-2 rounded'
  skipLink.style.zIndex = '9999'
  return skipLink
}
// Color contrast utilities
export function hasGoodContrast(foreground: string, background: string): boolean {
  // Simplified contrast check - in production, use a proper contrast ratio calculator
  const fgLuminance = getLuminance(foreground)
  const bgLuminance = getLuminance(background)
  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05)
  return ratio >= 4.5 // WCAG AA standard
}
function getLuminance(color: string): number {
  // Simplified luminance calculation
  // In production, use a proper color parsing library
  const rgb = color.match(/\d+/g)
  if (!rgb) return 0
  const [r, g, b] = rgb.map(x => {
    const val = parseInt(x) / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}