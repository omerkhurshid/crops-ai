'use client'

import React, { useState } from 'react'
import { cn } from '../../lib/utils'
import { 
  Plus, 
  X, 
  DollarSign, 
  Droplets, 
  Bug, 
  Calendar,
  ChevronUp,
  Package
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  onClick: () => void
}

interface GlobalFABProps {
  className?: string
  role?: 'farmer' | 'landowner' | 'rancher'
}

const farmerActions: QuickAction[] = [
  {
    id: 'expense',
    label: 'Log Expense',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'bg-green-500 hover:bg-green-600',
    onClick: () => window.location.href = '/financials?action=add-expense'
  },
  {
    id: 'irrigation',
    label: 'Log Irrigation',
    icon: <Droplets className="h-5 w-5" />,
    color: 'bg-blue-500 hover:bg-blue-600',
    onClick: () => window.location.href = '/tasks?action=add-task&type=irrigation'
  },
  {
    id: 'pest',
    label: 'Report Pest',
    icon: <Bug className="h-5 w-5" />,
    color: 'bg-orange-500 hover:bg-orange-600',
    onClick: () => window.location.href = '/crop-health?action=report-pest'
  },
  {
    id: 'harvest',
    label: 'Log Harvest',
    icon: <Package className="h-5 w-5" />,
    color: 'bg-purple-500 hover:bg-purple-600',
    onClick: () => window.location.href = '/crops?action=add-harvest'
  }
]

const landowenerActions: QuickAction[] = [
  {
    id: 'payment',
    label: 'Record Payment',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'bg-green-500 hover:bg-green-600',
    onClick: () => window.location.href = '/financials?action=add-income'
  },
  {
    id: 'meeting',
    label: 'Schedule Meeting',
    icon: <Calendar className="h-5 w-5" />,
    color: 'bg-blue-500 hover:bg-blue-600',
    onClick: () => window.location.href = '/tasks?action=add-task&type=meeting'
  }
]

export function GlobalFAB({ className, role = 'farmer' }: GlobalFABProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const actions = role === 'landowner' ? landowenerActions : farmerActions

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Action Buttons */}
            <div className="relative">
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ scale: 0, y: 0 }}
                  animate={{ 
                    scale: 1, 
                    y: -(index + 1) * 70 
                  }}
                  exit={{ scale: 0, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'absolute bottom-0 right-0 flex items-center gap-3',
                    'px-4 py-3 rounded-full shadow-lg',
                    'text-white font-medium',
                    action.color
                  )}
                  onClick={() => {
                    action.onClick()
                    setIsOpen(false)
                  }}
                >
                  <span className="whitespace-nowrap text-sm">{action.label}</span>
                  {action.icon}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative flex items-center justify-center',
          'w-14 h-14 rounded-full shadow-xl',
          'bg-sage-700 hover:bg-sage-800 text-white',
          'transition-all duration-300',
          isOpen && 'bg-red-500 hover:bg-red-600'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </motion.div>

        {/* Pulse animation when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-sage-600 animate-ping opacity-20" />
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2"
          >
            <div className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap">
              Quick Actions
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1">
                <div className="border-8 border-transparent border-l-gray-900" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mobile-optimized version with bottom sheet
export function MobileFAB({ className, role = 'farmer' }: GlobalFABProps) {
  const [isOpen, setIsOpen] = useState(false)
  const actions = role === 'landowner' ? landowenerActions : farmerActions

  return (
    <>
      {/* FAB Button */}
      <button
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-14 h-14 rounded-full shadow-xl',
          'bg-sage-700 active:bg-sage-800 text-white',
          'touch-manipulation',
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-6 w-6 mx-auto" />
      </button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Actions */}
              <div className="p-6 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 active:bg-gray-100"
                      onClick={() => {
                        action.onClick()
                        setIsOpen(false)
                      }}
                    >
                      <div className={cn('p-3 rounded-xl text-white', action.color.split(' ')[0])}>
                        {action.icon}
                      </div>
                      <span className="text-sm text-gray-700">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}