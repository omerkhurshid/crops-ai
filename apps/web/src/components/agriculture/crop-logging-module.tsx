'use client'
import React, { useState } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Plus, Calendar, Sprout, Droplets, Beaker, Bug, Scissors, 
  Camera, MapPin, Thermometer, Scale, Activity, FileText,
  Save, Upload, Download, Eye, Edit, Trash2, Clock
} from 'lucide-react'
import { cn } from '../../lib/utils'
interface CropLogEntry {
  id: string
  date: string
  type: 'planting' | 'irrigation' | 'fertilization' | 'pest_control' | 'cultivation' | 'harvest' | 'observation'
  cropId: string
  fieldId: string
  title: string
  description: string
  quantity?: number
  unit?: string
  cost?: number
  weather?: {
    temperature: number
    humidity: number
    rainfall: number
  }
  photos?: string[]
  coordinates?: { lat: number, lng: number }
  tags: string[]
  createdBy: string
}
interface CropLoggingModuleProps {
  farmId: string
  fieldId?: string
  cropId?: string
}
const LOG_TYPES = [
  { id: 'planting', label: 'Planting', icon: Sprout, color: 'bg-[#F8FAF8] text-[#7A8F78]' },
  { id: 'irrigation', label: 'Irrigation', icon: Droplets, color: 'bg-blue-100 text-[#7A8F78]' },
  { id: 'fertilization', label: 'Fertilization', icon: Beaker, color: 'bg-purple-100 text-purple-800' },
  { id: 'pest_control', label: 'Pest Control', icon: Bug, color: 'bg-red-100 text-red-800' },
  { id: 'cultivation', label: 'Cultivation', icon: Activity, color: 'bg-orange-100 text-orange-800' },
  { id: 'harvest', label: 'Harvest', icon: Scissors, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'observation', label: 'Observation', icon: Eye, color: 'bg-[#F5F5F5] text-[#1A1A1A]' }
]
export function CropLoggingModule({ farmId, fieldId, cropId }: CropLoggingModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedLogType, setSelectedLogType] = useState<string>('')
  const [logEntries, setLogEntries] = useState<CropLogEntry[]>([
    // Mock data
    {
      id: '1',
      date: '2024-04-15',
      type: 'planting',
      cropId: 'corn',
      fieldId: `default-field-${Date.now()}`,
      title: 'Corn planting - North Field',
      description: 'Planted corn variety DKC64-69 at 32,000 seeds per acre. Soil temperature was optimal at 55°F.',
      quantity: 25,
      unit: 'kg seeds',
      cost: 1500,
      weather: { temperature: 18, humidity: 65, rainfall: 0 },
      tags: ['spring-planting', 'corn', 'high-density'],
      createdBy: 'John Smith'
    },
    {
      id: '2', 
      date: '2024-05-01',
      type: 'fertilization',
      cropId: 'corn',
      fieldId: `default-field-${Date.now()}`,
      title: 'Side-dress nitrogen application',
      description: 'Applied 150 lbs/acre of nitrogen fertilizer as side-dress when corn reached V6 stage.',
      quantity: 150,
      unit: 'lbs/acre',
      cost: 425,
      tags: ['nitrogen', 'side-dress', 'V6-stage'],
      createdBy: 'John Smith'
    }
  ])
  const [newLogEntry, setNewLogEntry] = useState<Partial<CropLogEntry>>({
    date: new Date().toISOString().split('T')[0],
    type: 'observation',
    title: '',
    description: '',
    tags: []
  })
  const handleAddLogEntry = () => {
    if (!newLogEntry.title || !newLogEntry.description) return
    const entry: CropLogEntry = {
      id: Date.now().toString(),
      date: newLogEntry.date || new Date().toISOString().split('T')[0],
      type: newLogEntry.type as CropLogEntry['type'],
      cropId: cropId || 'unknown',
      fieldId: fieldId || 'unknown',
      title: newLogEntry.title,
      description: newLogEntry.description,
      quantity: newLogEntry.quantity,
      unit: newLogEntry.unit,
      cost: newLogEntry.cost,
      weather: newLogEntry.weather,
      photos: newLogEntry.photos || [],
      tags: newLogEntry.tags || [],
      createdBy: 'Current User'
    }
    setLogEntries([entry, ...logEntries])
    setNewLogEntry({
      date: new Date().toISOString().split('T')[0],
      type: 'observation',
      title: '',
      description: '',
      tags: []
    })
    setShowAddForm(false)
  }
  const getLogTypeConfig = (type: string) => {
    return LOG_TYPES.find(t => t.id === type) || LOG_TYPES[6]
  }
  const formatCost = (cost?: number) => {
    return cost ? `$${cost.toLocaleString()}` : 'N/A'
  }
  const getActivityTemplate = (type: string) => {
    const templates = {
      planting: {
        title: 'Planting Activity',
        description: 'Seed variety: \nPlanting depth: \nRow spacing: \nSeeding rate: \nSoil conditions: ',
        suggestions: ['variety', 'depth', 'spacing', 'seeding-rate']
      },
      irrigation: {
        title: 'Irrigation Application',
        description: 'Water amount: \nApplication method: \nDuration: \nSoil moisture before: \nSoil moisture after: ',
        suggestions: ['irrigation', 'water-management', 'moisture']
      },
      fertilization: {
        title: 'Fertilizer Application',
        description: 'Fertilizer type: \nN-P-K ratio: \nApplication rate: \nApplication method: \nStage of growth: ',
        suggestions: ['fertilizer', 'nutrition', 'NPK', 'growth-stage']
      },
      pest_control: {
        title: 'Pest Control Treatment',
        description: 'Pest identified: \nProduct used: \nApplication rate: \nWeather conditions: \nSeverity level: ',
        suggestions: ['pest-control', 'insecticide', 'IPM', 'treatment']
      }
    }
    return templates[type as keyof typeof templates] || {
      title: 'Crop Activity',
      description: '',
      suggestions: ['general', 'crop-care']
    }
  }
  const filteredEntries = logEntries.filter(entry => {
    if (fieldId && entry.fieldId !== fieldId) return false
    if (cropId && entry.cropId !== cropId) return false
    return true
  })
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Crop Activity Log</h2>
          <p className="text-[#555555]">Track all farming activities, treatments, and observations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {LOG_TYPES.slice(0, 4).map(type => {
          const count = filteredEntries.filter(e => e.type === type.id).length
          const totalCost = filteredEntries
            .filter(e => e.type === type.id && e.cost)
            .reduce((sum, e) => sum + (e.cost || 0), 0)
          return (
            <ModernCard key={type.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <type.icon className="h-5 w-5 text-[#555555]" />
                <Badge className={type.color}>{count}</Badge>
              </div>
              <div className="text-sm font-medium text-[#1A1A1A]">{type.label}</div>
              {totalCost > 0 && (
                <div className="text-xs text-[#555555] mt-1">${totalCost.toLocaleString()}</div>
              )}
            </ModernCard>
          )
        })}
      </div>
      {/* Add Entry Form */}
      {showAddForm && (
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Add New Log Entry</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={newLogEntry.date}
                  onChange={(e) => setNewLogEntry({...newLogEntry, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Activity Type</label>
                <Select 
                  value={newLogEntry.type} 
                  onValueChange={(value) => {
                    const template = getActivityTemplate(value)
                    setNewLogEntry({
                      ...newLogEntry, 
                      type: value as CropLogEntry['type'],
                      title: template.title,
                      description: template.description,
                      tags: template.suggestions
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOG_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={newLogEntry.title}
                onChange={(e) => setNewLogEntry({...newLogEntry, title: e.target.value})}
                placeholder="Brief description of the activity"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newLogEntry.description}
                onChange={(e) => setNewLogEntry({...newLogEntry, description: e.target.value})}
                placeholder="Detailed description of the activity, conditions, and results"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <Input
                  type="number"
                  value={newLogEntry.quantity || ''}
                  onChange={(e) => setNewLogEntry({...newLogEntry, quantity: parseFloat(e.target.value)})}
                  placeholder="Amount used"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Unit</label>
                <Select 
                  value={newLogEntry.unit || ''} 
                  onValueChange={(value) => setNewLogEntry({...newLogEntry, unit: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="liters">liters</SelectItem>
                    <SelectItem value="gallons">gallons</SelectItem>
                    <SelectItem value="acres">acres</SelectItem>
                    <SelectItem value="hectares">hectares</SelectItem>
                    <SelectItem value="hours">hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cost ($)</label>
                <Input
                  type="number"
                  value={newLogEntry.cost || ''}
                  onChange={(e) => setNewLogEntry({...newLogEntry, cost: parseFloat(e.target.value)})}
                  placeholder="Total cost"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLogEntry}>
                <Save className="h-4 w-4 mr-2" />
                Save Entry
              </Button>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}
      {/* Log Entries */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => {
          const typeConfig = getLogTypeConfig(entry.type)
          return (
            <ModernCard key={entry.id} className="overflow-hidden">
              <ModernCardContent className="p-0">
                <div className="flex">
                  {/* Timeline indicator */}
                  <div className={cn('w-1 flex-shrink-0', typeConfig.color.split(' ')[0])}></div>
                  <div className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-full', typeConfig.color)}>
                          <typeConfig.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1A1A1A]">{entry.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-[#555555]">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(entry.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {entry.createdBy}
                            </div>
                            {entry.cost && (
                              <div className="flex items-center gap-1">
                                <span className="text-[#8FBF7F] font-medium">{formatCost(entry.cost)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="ml-11">
                      <p className="text-[#555555] mb-3 whitespace-pre-wrap">{entry.description}</p>
                      {(entry.quantity || entry.weather) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                          {entry.quantity && (
                            <div>
                              <span className="text-[#555555]">Quantity:</span>
                              <span className="ml-2 font-medium">{entry.quantity} {entry.unit}</span>
                            </div>
                          )}
                          {entry.weather && (
                            <>
                              <div>
                                <span className="text-[#555555]">Temperature:</span>
                                <span className="ml-2 font-medium">{entry.weather.temperature}°C</span>
                              </div>
                              <div>
                                <span className="text-[#555555]">Humidity:</span>
                                <span className="ml-2 font-medium">{entry.weather.humidity}%</span>
                              </div>
                              <div>
                                <span className="text-[#555555]">Rainfall:</span>
                                <span className="ml-2 font-medium">{entry.weather.rainfall}mm</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          )
        })}
        {filteredEntries.length === 0 && (
          <ModernCard className="text-center py-12">
            <FileText className="h-12 w-12 text-[#DDE4D8] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">No log entries yet</h3>
            <p className="text-[#555555] mb-4">Start logging your farming activities to track progress and improvements.</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Entry
            </Button>
          </ModernCard>
        )}
      </div>
    </div>
  )
}