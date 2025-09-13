import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures a value is an array, returning empty array if not
 * This prevents "TypeError: (t || []) is not iterable" when t is a string/object/etc
 */
export function ensureArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? value : []
}