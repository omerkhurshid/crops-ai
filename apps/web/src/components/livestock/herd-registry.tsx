'use client'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Users, Plus } from 'lucide-react'
interface HerdRegistryProps {
  farmId: string
}
export function HerdRegistry({ farmId }: HerdRegistryProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Herd Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-[#555555] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Animals Registered
            </h3>
            <p className="text-[#555555] mb-6 max-w-sm mx-auto">
              Start building your herd registry by adding individual animals with their details, health records, and tracking information.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                className="bg-[#7A8F78] hover:bg-[#5E6F5A]"
                onClick={() => window.location.href = '/livestock/add-animal'}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Animal
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/livestock/import'}
              >
                Import Herd Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}