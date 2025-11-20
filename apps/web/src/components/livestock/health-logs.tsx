'use client'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Stethoscope, Plus, Activity } from 'lucide-react'
interface HealthLogsProps {
  farmId: string
}
export function HealthLogs({ farmId }: HealthLogsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Health Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
              No Health Records
            </h3>
            <p className="text-[#555555] mb-6 max-w-sm mx-auto">
              Start tracking animal health by logging vaccinations, treatments, checkups, and other health events.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                className="bg-[#7A8F78] hover:bg-[#5E6F5A]"
                onClick={() => window.location.href = '/livestock/add-event'}
              >
                <Plus className="h-4 w-4 mr-2" />
                Log Health Event
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/livestock/vaccination-schedule'}
              >
                Set Up Vaccination Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}