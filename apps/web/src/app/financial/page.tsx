'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FinancialDashboard } from '../../components/financial/financial-dashboard';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card';
import { InlineFloatingButton } from '../../components/ui/floating-button';
import { Badge } from '../../components/ui/badge';
import { AlertCircle, Plus, DollarSign, TrendingUp, BarChart, MapPin } from 'lucide-react';
import { Navbar } from '../../components/navigation/navbar';

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

    if (status === 'authenticated' && session?.user) {
      fetchFarms();
    }
  }, [status, router, session]);

  const fetchFarms = async () => {
    try {
      const response = await fetch('/api/farms');
      console.log('Farms API response status:', response.status);
      
      if (!response.ok) {
        console.error('Failed to fetch farms:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      } else {
        const data = await response.json();
        console.log('Farms data received:', data);
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
        <Navbar />
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
      <div className="minimal-page">
        <Navbar />
        <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <ModernCard variant="floating" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50 pb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-golden/20 to-wheat/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="h-10 w-10 text-earth-700" />
                </div>
                
                <ModernCardTitle className="text-3xl mb-4 text-sage-800">
                  Welcome to Financial Management
                </ModernCardTitle>
                
                <ModernCardDescription className="text-lg max-w-lg mx-auto">
                  Track your farm&apos;s income and expenses, generate profit insights, and forecast future profitability 
                  with AI-powered analytics.
                </ModernCardDescription>
              </ModernCardHeader>
              
              <ModernCardContent className="p-8">
                <div className="polished-card card-moss rounded-xl p-6 text-white mb-8">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-white/90 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Get Started</p>
                      <p className="opacity-90">
                        You need to set up at least one farm to start tracking your financial data. 
                        Create your first farm to begin managing your agricultural finances.
                      </p>
                    </div>
                  </div>
                </div>
                
                <InlineFloatingButton
                  onClick={handleCreateFarm}
                  icon={<Plus className="h-5 w-5" />}
                  label="Create Your First Farm"
                  showLabel={true}
                  variant="primary"
                  size="lg"
                  className="min-w-[250px]"
                />
              </ModernCardContent>
            </ModernCard>
          </div>
        </main>
      </div>
    );
  }

  // Multiple farms - farm selection
  if (farms.length > 1 && !selectedFarm) {
    return (
      <div className="minimal-page">
        <Navbar />
        
        {/* Animated Background with Floating Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-sage-50/80 to-earth-50/80 -z-10"></div>
        <div className="absolute top-20 left-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float">
          <DollarSign className="h-8 w-8 text-sage-600" />
        </div>
        <div className="absolute bottom-20 right-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '2s' }}>
          <TrendingUp className="h-8 w-8 text-sage-600" />
        </div>
        
        <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-16">
            {/* Enhanced Header with Icon */}
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-sage-100 to-earth-100 rounded-2xl relative overflow-hidden">
                  <DollarSign className="h-10 w-10 text-sage-700 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-sage-200/30 to-earth-200/30 animate-pulse-soft"></div>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-light text-sage-800 mb-6 tracking-tight">
                Financial Management
              </h1>
              <p className="text-xl text-sage-600 font-light leading-relaxed mb-4">
                Select a farm to view its financial performance and profitability insights
              </p>
              <Badge className="bg-sage-100 text-sage-700 border-sage-200">
                <BarChart className="h-4 w-4 mr-2" />
                AI-Powered Financial Analytics
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {farms.map((farm) => (
              <div key={farm.id} className="group">
                <div 
                  className="polished-card card-sage rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-soft"
                  onClick={() => setSelectedFarm(farm)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      Active
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{farm.name}</h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-white/90">
                      <span className="font-medium">{farm.totalArea.toFixed(1)}</span> hectares
                    </p>
                    {farm.location && (
                      <p className="text-sm text-white/80">{farm.location}</p>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-white/90">
                      <BarChart className="h-4 w-4" />
                      <span className="text-sm font-medium">View Financial Dashboard</span>
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Show financial dashboard for selected farm
  if (selectedFarm || farms.length === 1) {
    const farmToUse = selectedFarm || farms[0];
    return (
      <div className="minimal-page">
        <Navbar />
        
        {/* Subtle Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sage-50/30 to-earth-50/30 -z-10"></div>
        
        <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-16">
            {/* Enhanced Header with Icon and Asymmetric Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-gradient-to-br from-sage-100 to-earth-100 rounded-2xl relative overflow-hidden">
                    <DollarSign className="h-10 w-10 text-sage-700 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-sage-200/30 to-earth-200/30 animate-pulse-soft"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h1 className="text-4xl md:text-6xl font-light text-sage-800 tracking-tight">
                        Financial Management
                      </h1>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-xl text-sage-600 font-light">
                        Track income, expenses, and profitability for <span className="font-semibold text-sage-800">{farmToUse.name}</span>
                      </p>
                      <Badge className="bg-sage-100 text-sage-700 border-sage-200">
                        Live Data
                      </Badge>
                    </div>
                    <p className="text-sm text-sage-500 leading-relaxed">
                      Advanced financial analytics powered by real-time market data and AI-driven insights for precision agriculture profitability
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Farm Selector Card */}
              {farms.length > 1 && (
                <div className="lg:col-span-4">
                  <ModernCard variant="glass">
                    <ModernCardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-sage-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-sage-600" />
                          </div>
                          <div>
                            <p className="text-sm text-sage-500">Current Farm</p>
                            <p className="font-semibold text-sage-800">{farmToUse.name}</p>
                            <p className="text-sm text-sage-600">{farmToUse.totalArea.toFixed(1)} hectares</p>
                          </div>
                        </div>
                        <InlineFloatingButton
                          icon={<MapPin className="h-4 w-4" />}
                          label="Switch"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFarm(null)}
                        />
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                </div>
              )}
            </div>
          </div>
          
          {/* Financial Dashboard */}
          <FinancialDashboard farm={farmToUse} />
        </main>
      </div>
    );
  }

  return null;
}