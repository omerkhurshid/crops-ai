'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FinancialDashboard } from '../../components/financial/financial-dashboard';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { AlertCircle, Plus, DollarSign } from 'lucide-react';

interface Farm {
  id: string;
  name: string;
  totalArea: number;
  location?: string;
}

export default function FinancialPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchFarms();
    }
  }, [status, router]);

  const fetchFarms = async () => {
    try {
      const response = await fetch('/api/farms');
      if (response.ok) {
        const data = await response.json();
        setFarms(data.farms || []);
        
        // Auto-select first farm if only one exists
        if (data.farms?.length === 1) {
          setSelectedFarm(data.farms[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = () => {
    router.push('/farms/create');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  // No farms state
  if (farms.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Financial Management
              </h1>
              
              <p className="text-gray-600 mb-8">
                Track your farm's income and expenses, generate profit insights, and forecast future profitability 
                with AI-powered analytics.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Get Started</p>
                    <p>
                      You need to set up at least one farm to start tracking your financial data. 
                      Create your first farm to begin managing your agricultural finances.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleCreateFarm} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Farm
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Multiple farms - farm selection
  if (farms.length > 1 && !selectedFarm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Financial Management</h1>
            
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Farm</h2>
              <p className="text-gray-600 mb-6">
                Choose which farm you'd like to manage financially.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {farms.map((farm) => (
                  <Card 
                    key={farm.id} 
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-green-300"
                    onClick={() => setSelectedFarm(farm)}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{farm.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {farm.totalArea.toFixed(1)} hectares
                    </p>
                    {farm.location && (
                      <p className="text-xs text-gray-500">{farm.location}</p>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show financial dashboard for selected farm
  if (selectedFarm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Farm Selector (if multiple farms) */}
            {farms.length > 1 && (
              <div className="mb-6">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-lg font-semibold text-gray-900">Current Farm:</h2>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-green-600">{selectedFarm.name}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-600">
                          {selectedFarm.totalArea.toFixed(1)} hectares
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedFarm(null)}
                    >
                      Switch Farm
                    </Button>
                  </div>
                </Card>
              </div>
            )}
            
            {/* Financial Dashboard */}
            <FinancialDashboard farm={selectedFarm} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}