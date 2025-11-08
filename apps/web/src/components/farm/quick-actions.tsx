'use client'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from '../ui/dialog'
import { Plus, DollarSign, Sprout, Cat, CalendarDays } from 'lucide-react'
import { Badge } from '../ui/badge'
interface QuickActionsProps {
  farms: Array<{ id: string; name: string }>
}
export function QuickActions({ farms }: QuickActionsProps) {
  const [expenseDialog, setExpenseDialog] = useState(false)
  const [harvestDialog, setHarvestDialog] = useState(false)
  const [livestockDialog, setLivestockDialog] = useState(false)
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    try {
      const response = await fetch('/api/quick-actions/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId: formData.get('farm'),
          amount: parseFloat(formData.get('amount') as string),
          category: formData.get('category'),
          description: formData.get('description')
        })
      })
      if (response.ok) {
        setExpenseDialog(false)
        // Dashboard refresh functionality pending
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to log expense:', error)
    }
  }
  const handleHarvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    try {
      const response = await fetch('/api/quick-actions/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId: formData.get('farm'),
          fieldName: formData.get('fieldName'),
          cropType: formData.get('cropType'),
          quantity: parseFloat(formData.get('quantity') as string),
          qualityNotes: formData.get('qualityNotes')
        })
      })
      if (response.ok) {
        setHarvestDialog(false)
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to log harvest:', error)
    }
  }
  const handleLivestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    try {
      const response = await fetch('/api/quick-actions/livestock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId: formData.get('farm'),
          livestockType: formData.get('livestockType'),
          eventType: formData.get('eventType'),
          animalCount: parseInt(formData.get('animalCount') as string),
          notes: formData.get('notes')
        })
      })
      if (response.ok) {
        setLivestockDialog(false)
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to log livestock event:', error)
    }
  }
  return (
    <div className="flex items-center gap-2">
      {/* Add Expense */}
      <Dialog open={expenseDialog} onOpenChange={setExpenseDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-red-700 border-red-200 hover:bg-red-50">
            <DollarSign className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Farm Expense</DialogTitle>
            <DialogDescription>
              Record a new expense for your farming operations
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <Label htmlFor="farm-select">Farm</Label>
              <select 
                name="farm"
                id="farm-select"
                className="w-full mt-1 p-2 border border-sage-200 rounded-md"
                required
              >
                <option value="">Select Farm</option>
                {farms.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input name="amount" id="amount" type="number" step="0.01" placeholder="0.00" required />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select 
                  name="category"
                  id="category"
                  className="w-full mt-1 p-2 border border-sage-200 rounded-md"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="seeds">Seeds</option>
                  <option value="fertilizer">Fertilizer</option>
                  <option value="fuel">Fuel</option>
                  <option value="equipment">Equipment</option>
                  <option value="labor">Labor</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input name="description" id="description" placeholder="Brief description of expense" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setExpenseDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-sage-600 hover:bg-sage-700 text-white">
                Log Expense
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Log Harvest */}
      <Dialog open={harvestDialog} onOpenChange={setHarvestDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50">
            <Sprout className="h-4 w-4 mr-1" />
            Log Harvest
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Harvest Activity</DialogTitle>
            <DialogDescription>
              Record harvest data for yield tracking and revenue projection
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleHarvestSubmit} className="space-y-4">
            <div>
              <Label htmlFor="farm-harvest">Farm</Label>
              <select 
                name="farm"
                id="farm-harvest"
                className="w-full mt-1 p-2 border border-sage-200 rounded-md"
                required
              >
                <option value="">Select Farm</option>
                {farms.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="field-name">Field/Area</Label>
              <Input name="fieldName" id="field-name" placeholder="Field name or area description" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="crop-type">Crop Type</Label>
                <select 
                  name="cropType"
                  id="crop-type"
                  className="w-full mt-1 p-2 border border-sage-200 rounded-md"
                  required
                >
                  <option value="">Select Crop</option>
                  <option value="wheat">Wheat</option>
                  <option value="corn">Corn</option>
                  <option value="soybeans">Soybeans</option>
                  <option value="barley">Barley</option>
                  <option value="oats">Oats</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity (tons)</Label>
                <Input name="quantity" id="quantity" type="number" step="0.1" placeholder="0.0" required />
              </div>
            </div>
            <div>
              <Label htmlFor="quality-notes">Quality Notes</Label>
              <Textarea name="qualityNotes" id="quality-notes" placeholder="Optional quality assessment..." />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setHarvestDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-sage-600 hover:bg-sage-700 text-white">
                Log Harvest
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Livestock Event */}
      <Dialog open={livestockDialog} onOpenChange={setLivestockDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-amber-700 border-amber-200 hover:bg-amber-50">
            <Cat className="h-4 w-4 mr-1" />
            Livestock Event
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Livestock Event</DialogTitle>
            <DialogDescription>
              Record livestock health, breeding, or management activities
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLivestockSubmit} className="space-y-4">
            <div>
              <Label htmlFor="farm-livestock">Farm</Label>
              <select 
                name="farm"
                id="farm-livestock"
                className="w-full mt-1 p-2 border border-sage-200 rounded-md"
                required
              >
                <option value="">Select Farm</option>
                {farms.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="livestock-type">Animal Type</Label>
                <select 
                  name="livestockType"
                  id="livestock-type"
                  className="w-full mt-1 p-2 border border-sage-200 rounded-md"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="cattle">Cattle</option>
                  <option value="sheep">Sheep</option>
                  <option value="goats">Goats</option>
                  <option value="pigs">Pigs</option>
                  <option value="poultry">Poultry</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="event-type">Event Type</Label>
                <select 
                  name="eventType"
                  id="event-type"
                  className="w-full mt-1 p-2 border border-sage-200 rounded-md"
                  required
                >
                  <option value="">Select Event</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="breeding">Breeding</option>
                  <option value="calving">Calving/Birth</option>
                  <option value="health_check">Health Check</option>
                  <option value="treatment">Treatment</option>
                  <option value="death">Death/Loss</option>
                  <option value="sale">Sale</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="animal-count">Number of Animals</Label>
              <Input name="animalCount" id="animal-count" type="number" placeholder="1" required />
            </div>
            <div>
              <Label htmlFor="event-notes">Notes</Label>
              <Textarea name="notes" id="event-notes" placeholder="Additional details about the event..." />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setLivestockDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Log Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export function QuickActionButtons({ farms }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Today's Tasks Badge */}
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <CalendarDays className="h-3 w-3 mr-1" />
        3 Tasks Due
      </Badge>
      {/* Quick Actions */}
      <QuickActions farms={farms} />
    </div>
  )
}