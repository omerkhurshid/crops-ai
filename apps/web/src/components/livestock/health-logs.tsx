'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { 
  Plus, 
  Search, 
  Calendar,
  Stethoscope,
  Syringe,
  Pill,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  User,
  Activity
} from 'lucide-react'

interface HealthRecord {
  id: string
  animalId: string
  animalTag: string
  animalName?: string
  date: string
  type: 'vaccination' | 'treatment' | 'checkup' | 'illness' | 'medication' | 'surgery' | 'birth' | 'death'
  title: string
  description: string
  veterinarian?: string
  cost?: number
  nextDue?: string
  medications?: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
  }>
  vitals?: {
    temperature?: number
    weight?: number
    heartRate?: number
    respiratoryRate?: number
  }
  followUpRequired: boolean
  notes?: string
  attachments?: string[]
  createdBy: string
}

interface HealthLogsProps {
  farmId: string
}

const mockHealthRecords: HealthRecord[] = [
  {
    id: '1',
    animalId: 'C001',
    animalTag: 'C001',
    animalName: 'Bessie',
    date: '2024-03-01',
    type: 'vaccination',
    title: 'Annual Vaccination - BVDV/IBR/PI3/BRSV',
    description: 'Routine annual vaccination against respiratory and reproductive diseases',
    veterinarian: 'Dr. Sarah Wilson',
    cost: 45.50,
    nextDue: '2025-03-01',
    followUpRequired: false,
    notes: 'Animal handled well, no adverse reactions observed',
    createdBy: 'John Smith'
  },
  {
    id: '2',
    animalId: 'C002',
    animalTag: 'C002',
    animalName: 'Duke',
    date: '2024-02-28',
    type: 'checkup',
    title: 'Routine Health Examination',
    description: 'Quarterly health assessment and body condition scoring',
    veterinarian: 'Dr. Mike Rodriguez',
    vitals: {
      temperature: 38.5,
      weight: 890,
      heartRate: 72,
      respiratoryRate: 18
    },
    followUpRequired: false,
    notes: 'Excellent body condition score of 7/9. No issues detected.',
    createdBy: 'Sarah Johnson'
  },
  {
    id: '3',
    animalId: 'S001',
    animalTag: 'S001',
    date: '2024-02-15',
    type: 'treatment',
    title: 'Hoof Trimming and Treatment',
    description: 'Hoof trimming with copper sulfate treatment for minor foot rot',
    cost: 25.00,
    medications: [
      {
        name: 'Copper Sulfate Solution',
        dosage: '10% solution',
        frequency: 'Applied once',
        duration: 'Single treatment'
      }
    ],
    followUpRequired: true,
    nextDue: '2024-03-15',
    notes: 'Minor foot rot treated. Schedule follow-up in 4 weeks to ensure healing.',
    createdBy: 'John Smith'
  },
  {
    id: '4',
    animalId: 'P001',
    animalTag: 'P001',
    date: '2024-03-05',
    type: 'checkup',
    title: 'Pregnancy Check - Ultrasound',
    description: 'Pregnancy confirmation and fetal development assessment',
    veterinarian: 'Dr. Emily Chen',
    cost: 65.00,
    followUpRequired: true,
    nextDue: '2024-04-15',
    notes: 'Confirmed pregnant with 2 piglets. Due date estimated around April 10th. Schedule pre-farrowing checkup.',
    createdBy: 'Sarah Johnson'
  },
  {
    id: '5',
    animalId: 'C001',
    animalTag: 'C001',
    animalName: 'Bessie',
    date: '2024-01-15',
    type: 'illness',
    title: 'Mastitis Treatment',
    description: 'Subclinical mastitis detected during milking, initiated antibiotic treatment',
    veterinarian: 'Dr. Sarah Wilson',
    cost: 85.00,
    medications: [
      {
        name: 'Ceftiofur',
        dosage: '1mg/kg',
        frequency: 'Once daily',
        duration: '5 days'
      }
    ],
    followUpRequired: false,
    notes: 'Somatic cell count returned to normal after treatment. Milk withholding period observed.',
    createdBy: 'John Smith'
  }
]

const typeIcons: Record<string, any> = {
  vaccination: <Syringe className="h-4 w-4" />,
  treatment: <Stethoscope className="h-4 w-4" />,
  checkup: <CheckCircle className="h-4 w-4" />,
  illness: <AlertTriangle className="h-4 w-4" />,
  medication: <Pill className="h-4 w-4" />,
  surgery: <Activity className="h-4 w-4" />,
  birth: <TrendingUp className="h-4 w-4" />,
  death: <FileText className="h-4 w-4" />
}

const typeColors: Record<string, string> = {
  vaccination: 'bg-blue-100 text-blue-800 border-blue-200',
  treatment: 'bg-green-100 text-green-800 border-green-200',
  checkup: 'bg-purple-100 text-purple-800 border-purple-200',
  illness: 'bg-red-100 text-red-800 border-red-200',
  medication: 'bg-orange-100 text-orange-800 border-orange-200',
  surgery: 'bg-pink-100 text-pink-800 border-pink-200',
  birth: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  death: 'bg-gray-100 text-gray-800 border-gray-200'
}

export function HealthLogs({ farmId }: HealthLogsProps) {
  const [records, setRecords] = useState<HealthRecord[]>(mockHealthRecords)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.animalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || record.type === selectedType
    
    return matchesSearch && matchesType
  })

  // Sort by date (most recent first)
  const sortedRecords = filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (nextDue: string) => {
    const due = new Date(nextDue)
    const today = new Date()
    return due < today
  }

  const getDaysUntilDue = (nextDue: string) => {
    const due = new Date(nextDue)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search health records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="all">All Types</option>
          <option value="vaccination">Vaccinations</option>
          <option value="treatment">Treatments</option>
          <option value="checkup">Checkups</option>
          <option value="illness">Illness</option>
          <option value="medication">Medications</option>
          <option value="surgery">Surgery</option>
          <option value="birth">Birth</option>
        </select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredRecords.length} of {records.length} health records
        </p>
        <Button className="bg-sage-600 hover:bg-sage-700" onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Health Event
        </Button>
      </div>

      {/* Health Records Timeline */}
      <div className="space-y-4">
        {sortedRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${typeColors[record.type].replace('text-', 'bg-').replace('border-', '').replace('800', '100')}`}>
                    {typeIcons[record.type]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{record.title}</h3>
                    <p className="text-sm text-gray-600">
                      {record.animalName || record.animalTag} • {formatDate(record.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={typeColors[record.type]}>
                    {record.type}
                  </Badge>
                  {record.followUpRequired && record.nextDue && (
                    <Badge className={isOverdue(record.nextDue) ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {isOverdue(record.nextDue) 
                        ? `Overdue ${Math.abs(getDaysUntilDue(record.nextDue))}d`
                        : `Due in ${getDaysUntilDue(record.nextDue)}d`
                      }
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{record.description}</p>

              {/* Veterinarian */}
              {record.veterinarian && (
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Veterinarian: {record.veterinarian}</span>
                </div>
              )}

              {/* Vitals */}
              {record.vitals && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">Vital Signs</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {record.vitals.temperature && (
                      <div>
                        <span className="text-blue-700">Temperature:</span>
                        <span className="ml-1 font-medium">{record.vitals.temperature}°C</span>
                      </div>
                    )}
                    {record.vitals.weight && (
                      <div>
                        <span className="text-blue-700">Weight:</span>
                        <span className="ml-1 font-medium">{record.vitals.weight} kg</span>
                      </div>
                    )}
                    {record.vitals.heartRate && (
                      <div>
                        <span className="text-blue-700">Heart Rate:</span>
                        <span className="ml-1 font-medium">{record.vitals.heartRate} bpm</span>
                      </div>
                    )}
                    {record.vitals.respiratoryRate && (
                      <div>
                        <span className="text-blue-700">Respiratory:</span>
                        <span className="ml-1 font-medium">{record.vitals.respiratoryRate} rpm</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medications */}
              {record.medications && record.medications.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Medications
                  </h4>
                  <div className="space-y-2">
                    {record.medications.map((med, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-orange-800">{med.name}</span>
                        <span className="text-orange-700 ml-2">
                          {med.dosage} • {med.frequency} • {med.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {record.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                  <p className="text-sm text-gray-700">{record.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                <div className="flex items-center gap-4">
                  <span>Logged by {record.createdBy}</span>
                  {record.cost && <span>Cost: ${record.cost.toFixed(2)}</span>}
                </div>
                {record.nextDue && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Next due: {formatDate(record.nextDue)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedRecords.length === 0 && (
        <div className="text-center py-12">
          <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No health records found
          </h3>
          <p className="text-gray-600 mb-4">
            {records.length === 0 
              ? "Start tracking animal health by logging your first health event."
              : "Try adjusting your search or filter criteria."
            }
          </p>
          <Button className="bg-sage-600 hover:bg-sage-700" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log First Health Event
          </Button>
        </div>
      )}
    </div>
  )
}