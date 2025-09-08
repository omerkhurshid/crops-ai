'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Breakpoint definitions matching Tailwind CSS defaults
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof breakpoints

export interface ScreenSize {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  breakpoint: Breakpoint | null
}

/**
 * Hook to detect and respond to screen size changes
 */
export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < breakpoints.md : false,
    isTablet: typeof window !== 'undefined' ? 
      window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= breakpoints.lg : true,
    breakpoint: typeof window !== 'undefined' ? getCurrentBreakpoint(window.innerWidth) : 'lg',
  })

  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    
    setScreenSize({
      width,
      height,
      isMobile: width < breakpoints.md,
      isTablet: width >= breakpoints.md && width < breakpoints.lg,
      isDesktop: width >= breakpoints.lg,
      breakpoint: getCurrentBreakpoint(width),
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    updateScreenSize()
    
    const handleResize = () => updateScreenSize()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [updateScreenSize])

  return screenSize
}

/**
 * Hook for responsive values based on breakpoints
 */
export function useResponsiveValue<T>(values: {
  mobile?: T
  tablet?: T
  desktop?: T
  default: T
}): T {
  const { isMobile, isTablet } = useScreenSize()
  
  if (isMobile && values.mobile !== undefined) return values.mobile
  if (isTablet && values.tablet !== undefined) return values.tablet
  if (values.desktop !== undefined) return values.desktop
  
  return values.default
}

/**
 * Hook for media query matching
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [query])

  return matches
}

/**
 * Hook for detecting orientation
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    
    return () => window.removeEventListener('resize', updateOrientation)
  }, [])

  return orientation
}

/**
 * Hook for detecting touch device
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouch
}

/**
 * Hook for responsive grid columns
 */
export function useResponsiveGrid(options: {
  mobile?: number
  tablet?: number
  desktop?: number
  default: number
}): { gridCols: string; gap: string } {
  const cols = useResponsiveValue({
    mobile: options.mobile,
    tablet: options.tablet,
    desktop: options.desktop,
    default: options.default
  })

  const gap = useResponsiveValue({
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem',
    default: '1.5rem'
  })

  return {
    gridCols: `repeat(${cols}, minmax(0, 1fr))`,
    gap
  }
}

/**
 * Hook for responsive font sizes
 */
export function useResponsiveFontSize(sizes: {
  mobile?: string
  tablet?: string
  desktop?: string
  default: string
}): string {
  return useResponsiveValue(sizes)
}

/**
 * Hook for viewport-based calculations
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    vw: (value: number) => typeof window !== 'undefined' ? (value * window.innerWidth) / 100 : value,
    vh: (value: number) => typeof window !== 'undefined' ? (value * window.innerHeight) / 100 : value,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateViewport = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setViewport({
        width,
        height,
        vw: (value: number) => (value * width) / 100,
        vh: (value: number) => (value * height) / 100,
      })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  return viewport
}

/**
 * Hook for detecting reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * Hook for detecting color scheme preference
 */
export function useColorScheme(): 'light' | 'dark' {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  return prefersDark ? 'dark' : 'light'
}

/**
 * Utility function to get current breakpoint
 */
function getCurrentBreakpoint(width: number): Breakpoint | null {
  if (width >= breakpoints['2xl']) return '2xl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return null
}

/**
 * Utility function for responsive class names
 */
export function responsiveClassName(classes: {
  base?: string
  mobile?: string
  tablet?: string
  desktop?: string
}): string {
  const { isMobile, isTablet } = useScreenSize()
  
  const classNames = [classes.base || '']
  
  if (isMobile && classes.mobile) classNames.push(classes.mobile)
  else if (isTablet && classes.tablet) classNames.push(classes.tablet)
  else if (classes.desktop) classNames.push(classes.desktop)
  
  return classNames.filter(Boolean).join(' ')
}

/**
 * Component wrapper for responsive rendering
 */
export interface ResponsiveProps {
  mobile?: React.ReactNode
  tablet?: React.ReactNode
  desktop?: React.ReactNode
  children?: React.ReactNode
}

export function Responsive({ mobile, tablet, desktop, children }: ResponsiveProps) {
  const { isMobile, isTablet } = useScreenSize()
  
  if (isMobile && mobile) return <React.Fragment>{mobile}</React.Fragment>
  if (isTablet && tablet) return <React.Fragment>{tablet}</React.Fragment>
  if (desktop) return <React.Fragment>{desktop}</React.Fragment>
  
  return <React.Fragment>{children}</React.Fragment>
}