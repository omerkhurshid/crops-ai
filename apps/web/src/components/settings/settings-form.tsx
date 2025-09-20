'use client'

import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { InfoTooltip } from '../ui/info-tooltip'
import { 
  User, Lock, Globe, Ruler, Thermometer, 
  DollarSign, Save, CheckCircle, AlertCircle 
} from 'lucide-react'

interface UserPreferences {
  currency: string
  landUnit: string
  temperatureUnit: string
  timezone: string
  language: string
}

interface SettingsFormProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    currency?: string | null
    landUnit?: string | null
    temperatureUnit?: string | null
    timezone?: string | null
    language?: string | null
  }
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: user.currency || 'USD',
    landUnit: user.landUnit || 'hectares',
    temperatureUnit: user.temperatureUnit || 'celsius',
    timezone: user.timezone || 'UTC',
    language: user.language || 'en'
  })

  // Load user preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/users/preferences')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data.preferences) {
            setPreferences(data.data.preferences)
          }
        }
      } catch (error) {
        console.error('Failed to load preferences:', error)
        // Use user props as fallback
        setPreferences({
          currency: user.currency || 'USD',
          landUnit: user.landUnit || 'hectares',
          temperatureUnit: user.temperatureUnit || 'celsius',
          timezone: user.timezone || 'UTC',
          language: user.language || 'en'
        })
      }
    }
    
    loadPreferences()
  }, [user])

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
    { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
    { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
    { value: 'BRL', label: 'Brazilian Real (R$)', symbol: 'R$' },
  ]

  const landUnits = [
    { value: 'hectares', label: 'Hectares (ha)', description: 'Most common globally, 1 ha = 2.47 acres' },
    { value: 'acres', label: 'Acres (ac)', description: 'Common in US/UK, 1 ac = 0.405 ha' },
    { value: 'square_meters', label: 'Square Meters (m²)', description: 'For smaller areas' },
  ]

  const temperatureUnits = [
    { value: 'celsius', label: 'Celsius (°C)', description: 'Most common globally' },
    { value: 'fahrenheit', label: 'Fahrenheit (°F)', description: 'Common in US' },
  ]

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSaveStatus('error')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (!response.ok) throw new Error('Failed to change password')
      
      setSaveStatus('success')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Password change error:', error)
      setSaveStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesChange = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })

      if (!response.ok) throw new Error('Failed to save preferences')
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Preferences save error:', error)
      setSaveStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <ModernCard variant="floating">
        <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
          <ModernCardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-sage-600" />
            Account Information
          </ModernCardTitle>
          <ModernCardDescription>
            Your basic account details and contact information
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                defaultValue={user.name || ''}
                className="mt-1"
                disabled
              />
              <p className="text-xs text-sage-500 mt-1">Contact support to change your name</p>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user.email || ''}
                className="mt-1"
                disabled
              />
              <p className="text-xs text-sage-500 mt-1">Contact support to change your email</p>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Change Password */}
      <ModernCard variant="floating">
        <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
          <ModernCardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-sage-600" />
            Change Password
          </ModernCardTitle>
          <ModernCardDescription>
            Update your password to keep your account secure
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="mt-1"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="mt-1"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="mt-1"
                  required
                  minLength={8}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </ModernCardContent>
      </ModernCard>

      {/* System Preferences */}
      <ModernCard variant="floating">
        <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
          <ModernCardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-sage-600" />
            System Preferences
          </ModernCardTitle>
          <ModernCardDescription>
            Customize units and display settings for your farming operations
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          {/* Currency */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-sage-600" />
              Default Currency
              <InfoTooltip 
                title="Currency Setting"
                description="This will be used for all financial calculations and displays throughout the application"
                size="sm"
              />
            </Label>
            <Select
              value={preferences.currency}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-sage-500 mt-1">
              Selected: {currencies.find(c => c.value === preferences.currency)?.label}
            </p>
          </div>

          {/* Land Units */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Ruler className="h-4 w-4 text-sage-600" />
              Land Measurement Unit
              <InfoTooltip 
                title="Land Measurement"
                description="Choose your preferred unit for measuring farm and field areas"
                size="sm"
              />
            </Label>
            <Select
              value={preferences.landUnit}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, landUnit: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select land unit" />
              </SelectTrigger>
              <SelectContent>
                {landUnits.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    <div>
                      <div className="font-medium">{unit.label}</div>
                      <div className="text-xs text-sage-500">{unit.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-sage-500 mt-1">
              {landUnits.find(u => u.value === preferences.landUnit)?.description}
            </p>
          </div>

          {/* Temperature Units */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Thermometer className="h-4 w-4 text-sage-600" />
              Temperature Unit
              <InfoTooltip 
                title="Temperature Display"
                description="Choose how temperature is displayed in weather and environmental data"
                size="sm"
              />
            </Label>
            <Select
              value={preferences.temperatureUnit}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, temperatureUnit: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select temperature unit" />
              </SelectTrigger>
              <SelectContent>
                {temperatureUnits.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    <div>
                      <div className="font-medium">{unit.label}</div>
                      <div className="text-xs text-sage-500">{unit.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handlePreferencesChange} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Current Settings Summary */}
      <ModernCard variant="soft">
        <ModernCardHeader>
          <ModernCardTitle>Current Settings Summary</ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-sage-500 uppercase tracking-wide">Currency</p>
              <Badge className="mt-1">{preferences.currency}</Badge>
            </div>
            <div>
              <p className="text-xs text-sage-500 uppercase tracking-wide">Land Unit</p>
              <Badge className="mt-1">{landUnits.find(u => u.value === preferences.landUnit)?.label}</Badge>
            </div>
            <div>
              <p className="text-xs text-sage-500 uppercase tracking-wide">Temperature</p>
              <Badge className="mt-1">{temperatureUnits.find(u => u.value === preferences.temperatureUnit)?.label}</Badge>
            </div>
            <div>
              <p className="text-xs text-sage-500 uppercase tracking-wide">Account</p>
              <Badge className="mt-1 bg-green-100 text-green-700">Active</Badge>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">Settings saved successfully!</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">Failed to save settings. Please try again.</span>
        </div>
      )}
    </div>
  )
}