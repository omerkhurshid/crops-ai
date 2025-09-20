import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { AdminMetrics } from '../../components/admin/admin-metrics'
import { UserAnalytics } from '../../components/admin/user-analytics'
import { SystemHealth } from '../../components/admin/system-health'
import { AdminHeader } from '../../components/admin/admin-header'
import { Shield, TrendingUp, Users, Activity, Database, Globe, AlertTriangle } from 'lucide-react'
import { prisma } from '../../lib/prisma'

export const dynamic = 'force-dynamic'

async function getAdminStats() {
  try {
    const [
      totalUsers,
      totalFarms,
      totalFields,
      activeUsers,
      recentRegistrations,
      usersByType,
      usersByRole,
      recentActivity
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total farms  
      prisma.farm.count(),
      
      // Total fields
      prisma.field.count(),
      
      // Active users (logged in last 30 days)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Recent registrations (last 7 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Users by type
      prisma.user.groupBy({
        by: ['userType'],
        _count: true
      }),
      
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      
      // Recent activity (sample of recent farms/fields created)
      prisma.farm.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true,
          owner: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    // Calculate growth metrics
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    
    const [usersLastMonth, usersTwoMonthsAgo] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonth
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: twoMonthsAgo,
            lt: lastMonth
          }
        }
      })
    ])

    const userGrowthRate = usersTwoMonthsAgo > 0 
      ? ((usersLastMonth - usersTwoMonthsAgo) / usersTwoMonthsAgo) * 100
      : 0

    return {
      totalUsers,
      totalFarms,
      totalFields,
      activeUsers,
      recentRegistrations,
      usersByType,
      usersByRole,
      recentActivity,
      userGrowthRate,
      usersLastMonth,
      usersTwoMonthsAgo
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return {
      totalUsers: 0,
      totalFarms: 0,
      totalFields: 0,
      activeUsers: 0,
      recentRegistrations: 0,
      usersByType: [],
      usersByRole: [],
      recentActivity: [],
      userGrowthRate: 0,
      usersLastMonth: 0,
      usersTwoMonthsAgo: 0
    }
  }
}

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Basic admin check - you might want to add a proper admin role check
  if (user.role !== 'ADMIN' && !user.email?.includes('admin') && !user.email?.endsWith('@cropple.ai')) {
    redirect('/dashboard')
  }

  const stats = await getAdminStats()

  return (
    <DashboardLayout>
      <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <AdminHeader user={user} />
        
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  {stats.recentRegistrations} new this week
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Farms</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalFarms.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  {stats.totalFields} fields total
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">User Growth</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.userGrowthRate > 0 ? '+' : ''}{stats.userGrowthRate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">
                  Month over month
                </p>
              </div>
              <div className="p-3 bg-sage-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-sage-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <UserAnalytics 
            usersByType={stats.usersByType}
            usersByRole={stats.usersByRole}
            recentActivity={stats.recentActivity}
          />
          
          <SystemHealth />
        </div>

        {/* Admin Metrics */}
        <AdminMetrics 
          totalUsers={stats.totalUsers}
          totalFarms={stats.totalFarms}
          totalFields={stats.totalFields}
          activeUsers={stats.activeUsers}
          userGrowthRate={stats.userGrowthRate}
        />
      </main>
    </DashboardLayout>
  )
}