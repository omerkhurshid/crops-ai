'use client'

import React, { useState, memo } from 'react'
import { cn } from '../../lib/utils'
import { 
  Camera, 
  MapPin, 
  Sun, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign,
  Clock,
  ArrowLeft,
  Phone,
  Home,
  Loader2
} from 'lucide-react'

interface FieldModeProps {
  onExit: () => void
  className?: string
  field?: {
    farmId: string
    name: string
    latitude: number
    longitude: number
  }
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  action: () => void
}

export const FieldMode = memo(function FieldMode({ onExit, className, field }: FieldModeProps) {
  const [currentLocation, setCurrentLocation] = useState<string>('Getting location...')
  const [isCapturing, setIsCapturing] = useState(false)
  const [expenseAmount, setExpenseAmount] = useState(0)
  const [weatherData, setWeatherData] = useState<any>(null)

  // Get GPS location for field identification
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`)
        },
        () => {
          setCurrentLocation('Location unavailable')
        }
      )
    }
  }, [])

  // Camera capture functionality
  const capturePhoto = async () => {
    setIsCapturing(true)
    try {
      // Check if device supports camera
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Use back camera
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        })
        
        // Create video element to capture frame
        const video = document.createElement('video')
        video.srcObject = stream
        video.play()
        
        video.onloadedmetadata = () => {
          // Create canvas to capture image
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          
          if (ctx) {
            ctx.drawImage(video, 0, 0)
            
            // Convert to blob and save/upload
            canvas.toBlob(async (blob) => {
              if (blob) {
                // Create FormData to upload
                const formData = new FormData()
                formData.append('photo', blob, `field-photo-${Date.now()}.jpg`)
                formData.append('location', currentLocation)
                formData.append('timestamp', new Date().toISOString())
                
                try {
                  // Upload to API endpoint
                  const response = await fetch('/api/field-photos/upload', {
                    method: 'POST',
                    body: formData
                  })
                  
                  if (response.ok) {
                    // Success feedback
                    const successMsg = document.createElement('div')
                    successMsg.innerHTML = `
                      <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                        ✓ Photo saved successfully!
                      </div>
                    `
                    document.body.appendChild(successMsg)
                    setTimeout(() => successMsg.remove(), 3000)
                  } else {
                    // Fallback: save to local storage temporarily
                    const reader = new FileReader()
                    reader.onload = () => {
                      const base64 = reader.result as string
                      const photos = JSON.parse(localStorage.getItem('fieldPhotos') || '[]')
                      photos.push({
                        id: Date.now(),
                        data: base64,
                        location: currentLocation,
                        timestamp: new Date().toISOString()
                      })
                      localStorage.setItem('fieldPhotos', JSON.stringify(photos))
                      // Show local save feedback
                      const localMsg = document.createElement('div')
                      localMsg.innerHTML = `
                        <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                          📱 Photo saved on your device!
                        </div>
                      `
                      document.body.appendChild(localMsg)
                      setTimeout(() => localMsg.remove(), 3000)
                    }
                    reader.readAsDataURL(blob)
                  }
                } catch (error) {
                  console.error('Upload failed:', error)
                  // Fallback: save locally
                  const reader = new FileReader()
                  reader.onload = () => {
                    const base64 = reader.result as string
                    const photos = JSON.parse(localStorage.getItem('fieldPhotos') || '[]')
                    photos.push({
                      id: Date.now(),
                      data: base64,
                      location: currentLocation,
                      timestamp: new Date().toISOString()
                    })
                    localStorage.setItem('fieldPhotos', JSON.stringify(photos))
                    // Show local save feedback
                    const localMsg = document.createElement('div')
                    localMsg.innerHTML = `
                      <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                        📱 Photo saved on your device!
                      </div>
                    `
                    document.body.appendChild(localMsg)
                    setTimeout(() => localMsg.remove(), 3000)
                  }
                  reader.readAsDataURL(blob)
                }
              }
              
              // Clean up
              stream.getTracks().forEach(track => track.stop())
            }, 'image/jpeg', 0.8)
          }
        }
      } else {
        // Fallback: use file input for older devices
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.capture = 'environment'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = () => {
              const base64 = reader.result as string
              const photos = JSON.parse(localStorage.getItem('fieldPhotos') || '[]')
              photos.push({
                id: Date.now(),
                data: base64,
                location: currentLocation,
                timestamp: new Date().toISOString()
              })
              localStorage.setItem('fieldPhotos', JSON.stringify(photos))
              // Show save feedback
              const saveMsg = document.createElement('div')
              saveMsg.innerHTML = `
                <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                  ✓ Photo saved!
                </div>
              `
              document.body.appendChild(saveMsg)
              setTimeout(() => saveMsg.remove(), 3000)
            }
            reader.readAsDataURL(file)
          }
        }
        input.click()
      }
    } catch (error) {
      console.error('Camera access failed:', error)
      // Show error feedback
      const errorMsg = document.createElement('div')
      errorMsg.innerHTML = `
        <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
          📷 Camera not available. Check permissions.
        </div>
      `
      document.body.appendChild(errorMsg)
      setTimeout(() => errorMsg.remove(), 4000)
    } finally {
      setIsCapturing(false)
    }
  }

  const quickActions: QuickAction[] = [
    {
      id: 'photo',
      label: 'Take Field Photo',
      icon: isCapturing ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: capturePhoto
    },
    {
      id: 'issue',
      label: 'Report Issue',
      icon: <AlertTriangle className="h-8 w-8" />,
      color: 'bg-red-500 hover:bg-red-600',
      action: async () => {
        // Quick issue reporting
        const issue = prompt('What problem did you spot?', 'Pests on corn plants')
        if (issue) {
          try {
            const response = await fetch('/api/quick-actions/issue', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                issue,
                location: currentLocation,
                timestamp: new Date().toISOString()
              })
            })
            
            if (response.ok) {
              const successMsg = document.createElement('div')
              successMsg.innerHTML = `
                <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                  ✓ Issue reported successfully!
                </div>
              `
              document.body.appendChild(successMsg)
              setTimeout(() => successMsg.remove(), 3000)
            }
          } catch (error) {
            // Save locally if API fails
            const issues = JSON.parse(localStorage.getItem('fieldIssues') || '[]')
            issues.push({
              id: Date.now(),
              issue,
              location: currentLocation,
              timestamp: new Date().toISOString()
            })
            localStorage.setItem('fieldIssues', JSON.stringify(issues))
            
            const localMsg = document.createElement('div')
            localMsg.innerHTML = `
              <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                📱 Issue saved on your device!
              </div>
            `
            document.body.appendChild(localMsg)
            setTimeout(() => localMsg.remove(), 3000)
          }
        }
      }
    },
    {
      id: 'task',
      label: 'Complete Task',
      icon: <CheckCircle2 className="h-8 w-8" />,
      color: 'bg-green-500 hover:bg-green-600',
      action: async () => {
        // Quick task completion
        const taskName = prompt('What task did you complete?', 'Checked Field 3 for pests')
        if (taskName) {
          try {
            const response = await fetch('/api/quick-actions/task', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                taskName,
                location: currentLocation,
                timestamp: new Date().toISOString(),
                status: 'completed'
              })
            })
            
            if (response.ok) {
              const successMsg = document.createElement('div')
              successMsg.innerHTML = `
                <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                  ✓ Task completed!
                </div>
              `
              document.body.appendChild(successMsg)
              setTimeout(() => successMsg.remove(), 3000)
            }
          } catch (error) {
            // Save locally if API fails
            const tasks = JSON.parse(localStorage.getItem('completedTasks') || '[]')
            tasks.push({
              id: Date.now(),
              taskName,
              location: currentLocation,
              timestamp: new Date().toISOString(),
              status: 'completed'
            })
            localStorage.setItem('completedTasks', JSON.stringify(tasks))
            
            const localMsg = document.createElement('div')
            localMsg.innerHTML = `
              <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                📱 Task saved on your device!
              </div>
            `
            document.body.appendChild(localMsg)
            setTimeout(() => localMsg.remove(), 3000)
          }
        }
      }
    },
    {
      id: 'expense',
      label: 'Log Expense',
      icon: <DollarSign className="h-8 w-8" />,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      action: async () => {
        // Expense logging implementation
        try {
          const response = await fetch('/api/financial/transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              farmId: field?.farmId || 'unknown',
              amount: expenseAmount,
              type: 'EXPENSE',
              category: 'FIELD_OPERATIONS',
              description: `Field operation expense for ${field?.name || 'unknown field'}`,
              transactionDate: new Date()
            })
          })
          const expense = await response.json()
          console.log('Expense logged:', expense.id)
        } catch (error) {
          console.error('Failed to log expense:', error)
        }
      }
    },
    {
      id: 'weather',
      label: 'Weather Check',
      icon: <Sun className="h-8 w-8" />,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: async () => {
        // Weather check implementation
        try {
          const weatherResponse = await fetch(`/api/weather/current?latitude=${field?.latitude || 0}&longitude=${field?.longitude || 0}`)
          const weather = await weatherResponse.json()
          if (weather.success) {
            setWeatherData(weather.data)
          }
        } catch (error) {
          console.error('Failed to fetch weather:', error)
        }
      }
    },
    {
      id: 'time',
      label: 'Track Time',
      icon: <Clock className="h-8 w-8" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: async () => {
        // Time tracking implementation
        const startTime = Date.now()
        // ... operation logic ...
        const duration = Date.now() - startTime
        
        try {
          const response = await fetch(`/api/tasks/${taskId || 'current'}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              timeSpent: duration,
              lastWorkedOn: new Date()
            })
          })
          const task = await response.json()
          console.log('Time tracked:', task.id)
        } catch (error) {
          console.error('Failed to track time:', error)
        }
      }
    }
  ]

  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4 relative',
      className
    )}>
      {/* Header with large touch targets */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onExit}
          className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all min-h-[56px] min-w-[56px]"
          aria-label="Exit Field Mode"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
          <span className="text-lg font-medium text-gray-700">Exit</span>
        </button>

        <div className="bg-white rounded-2xl px-6 py-4 shadow-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-green-800">Field Mode</div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {currentLocation}
            </div>
          </div>
        </div>

        <a 
          href="tel:+1-800-CROPS-AI"
          className="flex items-center gap-3 bg-green-600 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all min-h-[56px] min-w-[56px]"
          aria-label="Call Support"
        >
          <Phone className="h-6 w-6" />
          <span className="text-lg font-medium">Help</span>
        </a>
      </div>

      {/* Quick Actions Grid - Large touch targets for gloved hands */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            disabled={action.id === 'photo' && isCapturing}
            className={cn(
              'flex flex-col items-center justify-center rounded-3xl text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95',
              'min-h-[140px] p-6',
              action.color,
              action.id === 'photo' && isCapturing && 'opacity-75 cursor-not-allowed'
            )}
            aria-label={action.label}
          >
            <div className="mb-3">
              {action.icon}
            </div>
            <span className="text-lg font-semibold text-center leading-tight">
              {action.id === 'photo' && isCapturing ? 'Taking Photo...' : action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Today's Priority - Simplified view */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Home className="h-6 w-6 text-green-600" />
          Today's Priority
        </h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="text-lg font-medium text-yellow-800">
            Check Field 3 for bugs
          </div>
          <div className="text-sm text-yellow-700 mt-1">
            Good weather for aphids. Check your corn plants.
          </div>
        </div>
      </div>

      {/* Weather Alert - Simple and clear */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <Sun className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-blue-800">Weather Today</span>
        </div>
        <div className="text-2xl font-bold text-blue-900 mb-1">78°F Sunny</div>
        <div className="text-blue-700">
          Great for spraying between 6-10 AM
        </div>
      </div>

      {/* Emergency Contact - Always visible */}
      <div className="fixed bottom-4 right-4">
        <a
          href="tel:911"
          className="bg-red-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all min-h-[64px] min-w-[64px] flex items-center justify-center"
          aria-label="Emergency Call"
        >
          <Phone className="h-8 w-8" />
        </a>
      </div>
    </div>
  )
})

// Hook to enable Field Mode
export function useFieldMode() {
  const [isFieldMode, setIsFieldMode] = useState(false)

  const enableFieldMode = () => {
    setIsFieldMode(true)
    // Lock screen orientation to portrait if supported
    if (screen.orientation && 'lock' in screen.orientation) {
      (screen.orientation as any).lock('portrait').catch(() => {
        // Orientation lock not supported, continue silently
      })
    }
  }

  const disableFieldMode = () => {
    setIsFieldMode(false)
    // Unlock screen orientation
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock()
    }
  }

  return {
    isFieldMode,
    enableFieldMode,
    disableFieldMode
  }
}