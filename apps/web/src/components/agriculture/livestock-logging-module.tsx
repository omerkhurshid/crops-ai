'use client'
import React, { useState } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Plus, Calendar, Heart, Syringe, Baby, Scale, Scissors, 
  Thermometer, Camera, MapPin, Activity, FileText, Eye,
  Save, Upload, Download, Edit, Trash2, Clock, Beef,
  Milk, Egg, ShieldCheck, AlertTriangle
} from 'lucide-react'
import { cn } from '../../lib/utils'
interface LivestockLogEntry {
  id: string
  date: string
  type: 'health' | 'breeding' | 'feeding' | 'vaccination' | 'treatment' | 'production' | 'observation'
  livestockId: string
  animalIds: string[] // specific animals affected
  title: string
  description: string
  quantity?: number
  unit?: string
  cost?: number
  vitals?: {
    temperature: number
    weight: number
    heartRate?: number
  }
  photos?: string[]
  coordinates?: { lat: number, lng: number }
  tags: string[]
  createdBy: string
}
interface LivestockLoggingModuleProps {
  farmId: string
  livestockType?: string
  animalId?: string
}
const LOG_TYPES = [
  { id: 'health', label: 'Health Check', icon: Heart, color: 'bg-red-100 text-red-800' },
  { id: 'vaccination', label: 'Vaccination', icon: Syringe, color: 'bg-blue-100 text-[#7A8F78]' },
  { id: 'treatment', label: 'Treatment', icon: ShieldCheck, color: 'bg-purple-100 text-purple-800' },
  { id: 'breeding', label: 'Breeding', icon: Baby, color: 'bg-pink-100 text-pink-800' },
  { id: 'feeding', label: 'Feeding', icon: Scale, color: 'bg-[#F8FAF8] text-[#7A8F78]' },
  { id: 'production', label: 'Production', icon: Milk, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'observation', label: 'Observation', icon: Eye, color: 'bg-[#F5F5F5] text-[#1A1A1A]' }
]
export function LivestockLoggingModule({ farmId, livestockType, animalId }: LivestockLoggingModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedLogType, setSelectedLogType] = useState<string>('')
  const [logEntries, setLogEntries] = useState<LivestockLogEntry[]>([
    // Mock data
    {
      id: '1',
      date: '2024-05-20',
      type: 'health',
      livestockId: 'dairy_cattle',
      animalIds: ['cow_001', 'cow_023'],
      title: 'Monthly health inspection - Group A',
      description: 'Routine monthly health check for dairy cows in barn A. All animals showing good body condition. Cow #23 showing slight lameness in left hind foot.',
      quantity: 2,
      unit: 'animals',
      cost: 150,
      vitals: { temperature: 38.5, weight: 625, heartRate: 72 },
      tags: ['routine-check', 'dairy-group-a', 'lameness-detected'],
      createdBy: 'Dr. Sarah Johnson'
    },
    {
      id: '2',
      date: '2024-05-18',
      type: 'vaccination',
      livestockId: 'dairy_cattle',
      animalIds: ['cow_001', 'cow_002', 'cow_003'],
      title: 'IBR/BVD vaccination - Spring protocol',
      description: 'Annual IBR/BVD vaccination administered to breeding herd. All animals handled well, no adverse reactions observed.',
      quantity: 3,
      unit: 'doses',
      cost: 285,
      tags: ['vaccination', 'IBR', 'BVD', 'breeding-herd'],
      createdBy: 'Mark Thompson'
    },
    {
      id: '3',
      date: '2024-05-15',
      type: 'production',
      livestockId: 'layer_chickens',
      animalIds: ['flock_001'],
      title: 'Weekly egg production record',
      description: 'Collected and recorded weekly egg production from Layer House 1. Production remains consistent at 92% lay rate.',
      quantity: 2180,
      unit: 'eggs',
      tags: ['production', 'eggs', 'layer-house-1'],
      createdBy: 'Maria Rodriguez'
    }
  ])
  const [newLogEntry, setNewLogEntry] = useState<Partial<LivestockLogEntry>>({
    date: new Date().toISOString().split('T')[0],
    type: 'observation',
    title: '',
    description: '',
    animalIds: [],
    tags: []
  })
  const handleAddLogEntry = () => {
    if (!newLogEntry.title || !newLogEntry.description) return
    const entry: LivestockLogEntry = {
      id: Date.now().toString(),
      date: newLogEntry.date || new Date().toISOString().split('T')[0],
      type: newLogEntry.type as LivestockLogEntry['type'],
      livestockId: livestockType || 'unknown',
      animalIds: newLogEntry.animalIds || [],
      title: newLogEntry.title,
      description: newLogEntry.description,
      quantity: newLogEntry.quantity,
      unit: newLogEntry.unit,
      cost: newLogEntry.cost,
      vitals: newLogEntry.vitals,
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
      animalIds: [],
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
      health: {
        title: 'Health Inspection',
        description: 'Animal IDs: \nBody condition score: \nTemperature: \nWeight: \nObservations: \nAction required: ',
        suggestions: ['health-check', 'body-condition', 'routine']
      },
      vaccination: {
        title: 'Vaccination Record',
        description: 'Vaccine type: \nBatch number: \nDosage: \nAdministration route: \nNext due date: ',
        suggestions: ['vaccination', 'immunization', 'preventive']
      },
      treatment: {
        title: 'Medical Treatment',
        description: 'Condition treated: \nMedication: \nDosage: \nDuration: \nWithdrawal period: ',
        suggestions: ['treatment', 'medication', 'therapy']
      },
      breeding: {
        title: 'Breeding Record',
        description: 'Breeding method: \nMale ID: \nFemale ID: \nBreeding date: \nExpected due date: ',
        suggestions: ['breeding', 'reproduction', 'genetics']
      },
      feeding: {
        title: 'Feed Management',
        description: 'Feed type: \nQuantity: \nFeed quality: \nSpecial additives: \nIntake observation: ',
        suggestions: ['feeding', 'nutrition', 'supplements']
      },
      production: {
        title: 'Production Record',
        description: 'Product type: \nQuantity: \nQuality grade: \nCollection method: \nStorage notes: ',
        suggestions: ['production', 'output', 'quality']
      }
    }
    return templates[type as keyof typeof templates] || {
      title: 'Livestock Activity',
      description: '',
      suggestions: ['general', 'livestock-care']
    }
  }
  const filteredEntries = logEntries.filter(entry => {
    if (livestockType && entry.livestockId !== livestockType) return false
    if (animalId && !entry.animalIds.includes(animalId)) return false
    return true
  })
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Livestock Activity Log</h2>
          <p className="text-[#555555]">Track health, breeding, feeding, and production activities</p>
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
                      type: value as LivestockLogEntry['type'],
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
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Animal IDs (comma-separated)</label>
              <Input
                value={newLogEntry.animalIds?.join(', ') || ''}
                onChange={(e) => setNewLogEntry({
                  ...newLogEntry, 
                  animalIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                })}
                placeholder="e.g., cow_001, cow_023"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <Input
                  type="number"
                  value={newLogEntry.quantity || ''}
                  onChange={(e) => setNewLogEntry({...newLogEntry, quantity: parseFloat(e.target.value)})}
                  placeholder="Amount"
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
                    <SelectItem value="animals">animals</SelectItem>
                    <SelectItem value="doses">doses</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="liters">liters</SelectItem>
                    <SelectItem value="eggs">eggs</SelectItem>
                    <SelectItem value="hours">hours</SelectItem>
                    <SelectItem value="treatments">treatments</SelectItem>
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
            {/* Vitals Section */}
            {(newLogEntry.type === 'health' || newLogEntry.type === 'treatment') && (
              <div className="mb-4 p-4 bg-[#F8FAF8] rounded-lg">
                <h4 className="font-medium text-[#1A1A1A] mb-3">Vital Signs (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Temperature (°C)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newLogEntry.vitals?.temperature || ''}
                      onChange={(e) => setNewLogEntry({
                        ...newLogEntry, 
                        vitals: { 
                          ...newLogEntry.vitals, 
                          temperature: parseFloat(e.target.value),
                          weight: newLogEntry.vitals?.weight || 0
                        }
                      })}
                      placeholder="38.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                    <Input
                      type="number"
                      value={newLogEntry.vitals?.weight || ''}
                      onChange={(e) => setNewLogEntry({
                        ...newLogEntry, 
                        vitals: { 
                          temperature: newLogEntry.vitals?.temperature || 0,
                          ...newLogEntry.vitals, 
                          weight: parseFloat(e.target.value)
                        }
                      })}
                      placeholder="625"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Heart Rate (bpm)</label>
                    <Input
                      type="number"
                      value={newLogEntry.vitals?.heartRate || ''}
                      onChange={(e) => setNewLogEntry({
                        ...newLogEntry, 
                        vitals: { 
                          temperature: newLogEntry.vitals?.temperature || 0,
                          weight: newLogEntry.vitals?.weight || 0,
                          ...newLogEntry.vitals,
                          heartRate: parseFloat(e.target.value) 
                        }
                      })}
                      placeholder="72"
                    />
                  </div>
                </div>
              </div>
            )}
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
                        {entry.animalIds.length > 0 && (
                          <Badge variant="outline">{entry.animalIds.length} animals</Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="ml-11">
                      <p className="text-[#555555] mb-3 whitespace-pre-wrap">{entry.description}</p>
                      {(entry.quantity || entry.vitals) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                          {entry.quantity && (
                            <div>
                              <span className="text-[#555555]">Quantity:</span>
                              <span className="ml-2 font-medium">{entry.quantity} {entry.unit}</span>
                            </div>
                          )}
                          {entry.vitals && (
                            <>
                              {entry.vitals.temperature && (
                                <div>
                                  <span className="text-[#555555]">Temperature:</span>
                                  <span className="ml-2 font-medium">{entry.vitals.temperature}°C</span>
                                </div>
                              )}
                              {entry.vitals.weight && (
                                <div>
                                  <span className="text-[#555555]">Weight:</span>
                                  <span className="ml-2 font-medium">{entry.vitals.weight}kg</span>
                                </div>
                              )}
                              {entry.vitals.heartRate && (
                                <div>
                                  <span className="text-[#555555]">Heart Rate:</span>
                                  <span className="ml-2 font-medium">{entry.vitals.heartRate} bpm</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      {entry.animalIds.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm text-[#555555]">Animals: </span>
                          <span className="text-sm font-medium">{entry.animalIds.join(', ')}</span>
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
            <p className="text-[#555555] mb-4">Start logging your livestock activities to track health and production.</p>
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