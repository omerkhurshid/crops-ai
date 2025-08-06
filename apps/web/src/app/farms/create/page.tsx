import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../lib/auth/session'
import { Navbar } from '../../../components/navigation/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'

export const dynamic = 'force-dynamic'

export default async function CreateFarmPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Farm</h1>
            <p className="text-gray-600">Add a new farm to your management portfolio</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Farm Details</CardTitle>
              <CardDescription>
                Enter the basic information for your new farm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="farm-name">Farm Name</Label>
                    <Input
                      id="farm-name"
                      type="text"
                      placeholder="Enter farm name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="farm-size">Farm Size (acres)</Label>
                    <Input
                      id="farm-size"
                      type="number"
                      placeholder="Enter size in acres"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="farm-location">Location</Label>
                  <Input
                    id="farm-location"
                    type="text"
                    placeholder="Enter farm location (address or coordinates)"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="farm-description">Description</Label>
                  <Textarea
                    id="farm-description"
                    placeholder="Describe your farm, soil type, current crops, etc."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="farm-type">Farm Type</Label>
                    <select
                      id="farm-type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-crops-green-500 focus:border-transparent"
                    >
                      <option value="">Select farm type</option>
                      <option value="crop">Crop Production</option>
                      <option value="livestock">Livestock</option>
                      <option value="mixed">Mixed Farming</option>
                      <option value="organic">Organic Farm</option>
                      <option value="greenhouse">Greenhouse</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="primary-crop">Primary Crop</Label>
                    <Input
                      id="primary-crop"
                      type="text"
                      placeholder="e.g., Corn, Wheat, Tomatoes"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-crops-green-600 hover:bg-crops-green-700">
                    Create Farm
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>After creating your farm, you can:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Add fields and crop zones</li>
                    <li>Set up weather monitoring</li>
                    <li>Configure irrigation systems</li>
                    <li>Start tracking farm activities</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}