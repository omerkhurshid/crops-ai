'use client'
import { useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { 
  Heart, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Weight,
  Users,
  FileText,
  Plus,
  Edit,
  Trash2,
  Activity
} from 'lucide-react'
import Link from 'next/link'
interface AnimalProfileProps {
  animal: any
}
export function AnimalProfile({ animal }: AnimalProfileProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Unknown'
    const birth = new Date(birthDate)
    const now = new Date()
    const monthsDiff = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
    if (monthsDiff < 12) return `${monthsDiff} months`
    const years = Math.floor(monthsDiff / 12)
    const remainingMonths = monthsDiff % 12
    if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`
    return `${years}y ${remainingMonths}m`
  }
  const getHealthStatus = () => {
    const recentHealthIssues = animal.healthRecords?.filter((record: any) => 
      ['illness', 'injury'].includes(record.recordType) && 
      new Date(record.recordDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ) || []
    if (recentHealthIssues.length > 0) return { status: 'needs-attention', color: 'yellow' }
    return { status: 'healthy', color: 'green' }
  }
  const getWeightTrend = () => {
    if (!animal.weightRecords || animal.weightRecords.length < 2) return { trend: 'stable', change: 0 }
    const [latest, previous] = animal.weightRecords
    const change = latest.weight - previous.weight
    if (change > 5) return { trend: 'up', change }
    if (change < -5) return { trend: 'down', change }
    return { trend: 'stable', change }
  }
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'health', label: 'Health Records', icon: Heart },
    { id: 'weight', label: 'Weight Tracking', icon: Weight },
    { id: 'breeding', label: 'Breeding', icon: Users },
    { id: 'feed', label: 'Feed & Nutrition', icon: Activity },
    { id: 'financial', label: 'Financial', icon: DollarSign }
  ]
  const healthStatus = getHealthStatus()
  const weightTrend = getWeightTrend()
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-[#E6E6E6]">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-[#7A8F78]'
                    : 'border-transparent text-[#555555] hover:text-[#555555] hover:border-[#E6E6E6]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>Basic Information</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#555555]">Tag Number</label>
                  <p className="text-lg font-semibold">{animal.tagNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#555555]">Name</label>
                  <p className="text-lg font-semibold">{animal.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#555555]">Species</label>
                  <p className="text-lg font-semibold capitalize">{animal.species}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#555555]">Breed</label>
                  <p className="text-lg font-semibold">{animal.breed || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#555555]">Gender</label>
                  <p className="text-lg font-semibold capitalize">{animal.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#555555]">Age</label>
                  <p className="text-lg font-semibold">{calculateAge(animal.birthDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#555555]">Status</label>
                  <Badge variant={animal.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {animal.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#555555]">Farm</label>
                  <p className="text-lg font-semibold">{animal.farm?.name}</p>
                </div>
              </div>
              {animal.color && (
                <div>
                  <label className="text-sm font-medium text-[#555555]">Color</label>
                  <p className="text-lg font-semibold">{animal.color}</p>
                </div>
              )}
              {animal.markings && (
                <div>
                  <label className="text-sm font-medium text-[#555555]">Markings</label>
                  <p className="text-lg font-semibold">{animal.markings}</p>
                </div>
              )}
              {animal.notes && (
                <div>
                  <label className="text-sm font-medium text-[#555555]">Notes</label>
                  <p className="text-[#555555]">{animal.notes}</p>
                </div>
              )}
            </ModernCardContent>
          </ModernCard>
          {/* Parentage & Offspring */}
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>Family Tree</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="space-y-4">
              {(animal.mother || animal.father) && (
                <div>
                  <h4 className="font-medium text-[#1A1A1A] mb-2">Parents</h4>
                  <div className="space-y-2">
                    {animal.mother && (
                      <div className="flex items-center justify-between p-2 bg-[#FAFAF7] rounded">
                        <span className="text-sm">
                          <strong>Mother:</strong> #{animal.mother.tagNumber} {animal.mother.name && `(${animal.mother.name})`}
                        </span>
                        <Link href={`/livestock/animals/${animal.mother.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    )}
                    {animal.father && (
                      <div className="flex items-center justify-between p-2 bg-[#FAFAF7] rounded">
                        <span className="text-sm">
                          <strong>Father:</strong> #{animal.father.tagNumber} {animal.father.name && `(${animal.father.name})`}
                        </span>
                        <Link href={`/livestock/animals/${animal.father.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {((animal.motherOffspring && animal.motherOffspring.length > 0) || (animal.fatherOffspring && animal.fatherOffspring.length > 0)) && (
                <div>
                  <h4 className="font-medium text-[#1A1A1A] mb-2">Offspring ({(animal.motherOffspring?.length || 0) + (animal.fatherOffspring?.length || 0)})</h4>
                  <div className="space-y-2">
                    {[...(animal.motherOffspring || []), ...(animal.fatherOffspring || [])].map((offspring: any) => (
                      <div key={offspring.id} className="flex items-center justify-between p-2 bg-[#FAFAF7] rounded">
                        <span className="text-sm">
                          #{offspring.tagNumber} {offspring.name && `(${offspring.name})`}
                          {offspring.birthDate && (
                            <span className="text-[#555555] ml-2">
                              Born {new Date(offspring.birthDate).toLocaleDateString()}
                            </span>
                          )}
                        </span>
                        <Link href={`/livestock/animals/${offspring.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!animal.mother && !animal.father && (!animal.motherOffspring || animal.motherOffspring.length === 0) && (!animal.fatherOffspring || animal.fatherOffspring.length === 0) && (
                <p className="text-[#555555] text-center py-4">No family records available</p>
              )}
            </ModernCardContent>
          </ModernCard>
        </div>
      )}
      {activeTab === 'health' && (
        <ModernCard>
          <ModernCardHeader className="flex flex-row items-center justify-between">
            <ModernCardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Health Records
            </ModernCardTitle>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Record
            </Button>
          </ModernCardHeader>
          <ModernCardContent>
            {animal.healthRecords && animal.healthRecords.length > 0 ? (
              <div className="space-y-4">
                {animal.healthRecords.map((record: any) => (
                  <div key={record.id} className="border border-[#E6E6E6] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={record.recordType === 'checkup' ? 'default' : 
                                 record.recordType === 'vaccination' ? 'secondary' : 'destructive'}
                          className="capitalize"
                        >
                          {record.recordType}
                        </Badge>
                        <span className="text-sm text-[#555555]">
                          {new Date(record.recordDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {record.description && (
                      <p className="text-[#555555] mb-2">{record.description}</p>
                    )}
                    {record.veterinarian && (
                      <p className="text-sm text-[#555555]">Veterinarian: {record.veterinarian}</p>
                    )}
                    {record.cost && (
                      <p className="text-sm text-[#555555]">Cost: ${record.cost}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-[#555555] mx-auto mb-4" />
                <p className="text-[#555555] mb-4">No health records yet</p>
                <Button>Add First Health Record</Button>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      )}
      {activeTab === 'weight' && (
        <ModernCard>
          <ModernCardHeader className="flex flex-row items-center justify-between">
            <ModernCardTitle className="flex items-center gap-2">
              <Weight className="h-5 w-5" />
              Weight Tracking
            </ModernCardTitle>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record Weight
            </Button>
          </ModernCardHeader>
          <ModernCardContent>
            {animal.weightRecords && animal.weightRecords.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-[#7A8F78]">Current Weight</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {animal.weightRecords[0]?.weight || 'N/A'} lbs
                    </p>
                  </div>
                  <div className="bg-[#F8FAF8] p-4 rounded-lg">
                    <p className="text-sm font-medium text-[#7A8F78]">Birth Weight</p>
                    <p className="text-2xl font-bold text-green-900">
                      {animal.birthWeight || 'N/A'} lbs
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${
                    weightTrend.trend === 'up' ? 'bg-[#F8FAF8]' : 
                    weightTrend.trend === 'down' ? 'bg-red-50' : 'bg-[#FAFAF7]'
                  }`}>
                    <p className={`text-sm font-medium ${
                      weightTrend.trend === 'up' ? 'text-[#7A8F78]' : 
                      weightTrend.trend === 'down' ? 'text-red-800' : 'text-[#1A1A1A]'
                    }`}>
                      Recent Change
                    </p>
                    <p className={`text-2xl font-bold ${
                      weightTrend.trend === 'up' ? 'text-green-900' : 
                      weightTrend.trend === 'down' ? 'text-red-900' : 'text-[#1A1A1A]'
                    }`}>
                      {weightTrend.change >= 0 ? '+' : ''}{weightTrend.change.toFixed(1)} lbs
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {animal.weightRecords.map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border border-[#E6E6E6] rounded">
                      <div>
                        <p className="font-medium">{record.weight} lbs</p>
                        <p className="text-sm text-[#555555]">
                          {new Date(record.weighDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Weight className="h-12 w-12 text-[#555555] mx-auto mb-4" />
                <p className="text-[#555555] mb-4">No weight records yet</p>
                <Button>Record First Weight</Button>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      )}
      {activeTab === 'breeding' && (
        <ModernCard>
          <ModernCardHeader className="flex flex-row items-center justify-between">
            <ModernCardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Breeding Records
            </ModernCardTitle>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Breeding Record
            </Button>
          </ModernCardHeader>
          <ModernCardContent>
            {animal.breedingRecords && animal.breedingRecords.length > 0 ? (
              <div className="space-y-4">
                {animal.breedingRecords.map((record: any) => (
                  <div key={record.id} className="border border-[#E6E6E6] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="capitalize">{record.breedingType}</Badge>
                        <span className="text-sm text-[#555555]">
                          {new Date(record.breedingDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {record.mateId && (
                      <p className="text-sm text-[#555555] mb-1">
                        Mate: {record.mate?.tagNumber} {record.mate?.name && `(${record.mate.name})`}
                      </p>
                    )}
                    {record.expectedDueDate && (
                      <p className="text-sm text-[#555555] mb-1">
                        Expected Due: {new Date(record.expectedDueDate).toLocaleDateString()}
                      </p>
                    )}
                    {record.notes && (
                      <p className="text-[#555555]">{record.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-[#555555] mx-auto mb-4" />
                <p className="text-[#555555] mb-4">No breeding records yet</p>
                <Button>Add First Breeding Record</Button>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      )}
      {activeTab === 'feed' && (
        <ModernCard>
          <ModernCardHeader className="flex flex-row items-center justify-between">
            <ModernCardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Feed & Nutrition
            </ModernCardTitle>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record Feeding
            </Button>
          </ModernCardHeader>
          <ModernCardContent>
            {animal.feedRecords && animal.feedRecords.length > 0 ? (
              <div className="space-y-4">
                {animal.feedRecords.map((record: any) => (
                  <div key={record.id} className="border border-[#E6E6E6] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{record.feedType}</p>
                        <p className="text-sm text-[#555555]">
                          {new Date(record.feedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{record.quantity} lbs</p>
                        {record.totalCost && (
                          <p className="text-sm text-[#555555]">${record.totalCost}</p>
                        )}
                      </div>
                    </div>
                    {record.notes && (
                      <p className="text-sm text-[#555555]">{record.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-[#555555] mx-auto mb-4" />
                <p className="text-[#555555] mb-4">No feed records yet</p>
                <Button>Record First Feeding</Button>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      )}
      {activeTab === 'financial' && (
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Information
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-[#1A1A1A]">Purchase Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Purchase Price:</span>
                    <span className="font-medium">${animal.purchasePrice || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Purchase Date:</span>
                    <span className="font-medium">
                      {animal.purchaseDate ? new Date(animal.purchaseDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Current Value:</span>
                    <span className="font-medium">${animal.currentValue || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-[#1A1A1A]">Cost Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Total Health Costs:</span>
                    <span className="font-medium">
                      ${animal.healthRecords?.reduce((sum: number, record: any) => sum + (record.cost || 0), 0) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Total Feed Costs:</span>
                    <span className="font-medium">
                      ${animal.feedRecords?.reduce((sum: number, record: any) => sum + (record.totalCost || 0), 0) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium text-[#1A1A1A]">Total Investment:</span>
                    <span className="font-bold">
                      ${(animal.purchasePrice || 0) + 
                        (animal.healthRecords?.reduce((sum: number, record: any) => sum + (record.cost || 0), 0) || 0) +
                        (animal.feedRecords?.reduce((sum: number, record: any) => sum + (record.totalCost || 0), 0) || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}
    </div>
  )
}