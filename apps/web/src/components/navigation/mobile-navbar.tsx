'use client'
import { Menu, Bell, User } from 'lucide-react'
import { CroppleLogo } from '../ui/cropple-logo'
import { Button } from '../ui/button'
import { ColorCombinations } from '../../lib/design-system/color-standards'
interface MobileNavbarProps {
  onMenuClick: () => void
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}
export function MobileNavbar({ onMenuClick, user }: MobileNavbarProps) {
  return (
    <div className={`${ColorCombinations.cardDefault} border-b`}>
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Menu button and logo */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-fk-text hover:bg-fk-border/20"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <CroppleLogo size="sm" />
        </div>
        {/* Right side - User info and notifications */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="text-fk-text-muted hover:bg-fk-border/20"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
          {/* User avatar/name */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fk-primary text-white text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-fk-text">
                {user?.name || 'Farmer'}
              </div>
              <div className="text-xs text-fk-text-muted">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}