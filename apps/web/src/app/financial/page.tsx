'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FinancialDashboard } from '../../components/financial/financial-dashboard';
import { UserFinancialDashboard } from '../../components/financial/user-financial-dashboard';
import { ProfitCalculator } from '../../components/financial/profit-calculator';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card';
import { InlineFloatingButton } from '../../components/ui/floating-button';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { TransactionModal } from '../../components/financial/transaction-modal';
import { AlertCircle, Plus, DollarSign, TrendingUp, BarChart, MapPin, ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/dashboard-layout';

interface Farm {
  id: string;
  name: string;
  totalArea: number;
  location?: string;
}

type ViewLevel = 'user' | 'farm' | 'field'

export default function FinancialPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('user');
  const [loading, setLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('INCOME');

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

      if (!response.ok) {

        const errorText = await response.text();
        console.error('Error response:', errorText);
      } else {
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

  const handleFarmSelect = async (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    if (farm) {
      setSelectedFarm(farm);
      setViewLevel('farm');
    }
  };

  const handleBackToUserView = () => {
    setSelectedFarm(null);
    setViewLevel('user');
  };

  const handleAddTransaction = (type: 'INCOME' | 'EXPENSE' = 'INCOME') => {
    setTransactionType(type);
    setShowTransactionModal(true);
  };

  const handleTransactionAdded = () => {
    setShowTransactionModal(false);
    // Refresh data by updating component state
    fetchFarms();
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  // No farms state
  if (farms.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
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
                  Track your farm's income and expenses, and get insights into profitability.
                </ModernCardDescription>
              </ModernCardHeader>
              
              <ModernCardContent className="p-8">
                <ModernCard variant="soft" className="mb-8">
                  <ModernCardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-moss-700 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium mb-1 text-moss-800">Get Started</p>
                        <p className="text-moss-700">
                          You need to set up at least one farm to start tracking your financial data. 
                          Create your first farm to begin managing your agricultural finances.
                        </p>
                      </div>
                    </div>
                  </ModernCardContent>
                </ModernCard>
                
                <InlineFloatingButton
                  onClick={handleCreateFarm}
                  icon={<Plus className="h-5 w-5" />}
                  label="Create Your First Farm"
                  showLabel={true}
                  variant="primary"
                  size="lg"
                  className="w-full sm:min-w-[250px]"
                />
              </ModernCardContent>
            </ModernCard>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        {viewLevel !== 'user' && (
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToUserView}
              className="text-sage-600 hover:text-sage-800 p-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolio Overview
            </Button>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-sage-800 mb-2">Financial Management</h1>
          <p className="text-lg text-sage-600">
            {viewLevel === 'user' 
              ? 'Comprehensive financial overview across all your farming operations'
              : `Financial details for ${selectedFarm?.name || 'selected farm'}`
            }
          </p>
        </div>

        {/* Content based on view level */}
        {viewLevel === 'user' && (
          <UserFinancialDashboard 
            onFarmSelect={handleFarmSelect}
            onAddTransaction={() => handleAddTransaction('INCOME')}
          />
        )}

        {viewLevel === 'farm' && selectedFarm && (
          <FinancialDashboard farm={selectedFarm} />
        )}

        {/* Global Transaction Modal */}
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          farmId={selectedFarm?.id || farms[0]?.id || ''}
          type={transactionType}
          onSuccess={handleTransactionAdded}
        />
      </div>
    </DashboardLayout>
  );
}