"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "./button"
import { cn } from "../../lib/utils"

interface DatePickerProps {
  date?: Date | null
  onDateChange?: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({ 
  date, 
  onDateChange, 
  placeholder = "Pick a date",
  disabled = false,
  className 
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : null
    onDateChange?.(newDate)
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return ""
    return date.toISOString().split('T')[0]
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground"
        )}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? date.toLocaleDateString() : placeholder}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50">
          <input
            type="date"
            value={formatDate(date)}
            onChange={handleDateChange}
            onBlur={() => setIsOpen(false)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sage-600 focus:outline-none focus:ring-1 focus:ring-sage-600"
            autoFocus
          />
        </div>
      )}
    </div>
  )
}