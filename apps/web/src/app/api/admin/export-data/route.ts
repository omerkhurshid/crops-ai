import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/session'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || (user.role !== 'ADMIN' && !user.email?.includes('admin') && !user.email?.endsWith('@cropple.ai'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get comprehensive analytics data
    const [
      users,
      farms,
      fields,
      weatherAlerts,
      financialTransactions
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          userType: true,
          createdAt: true,
          lastLoginAt: true,
          emailVerified: true
        }
      }),
      prisma.farm.findMany({
        select: {
          id: true,
          name: true,
          totalArea: true,
          createdAt: true,
          owner: {
            select: {
              id: true,
              email: true,
              userType: true
            }
          }
        }
      }),
      prisma.field.findMany({
        select: {
          id: true,
          name: true,
          area: true,
          createdAt: true,
          farm: {
            select: {
              id: true,
              name: true,
              owner: {
                select: {
                  id: true,
                  userType: true
                }
              }
            }
          }
        }
      }),
      prisma.weatherAlert.count(),
      prisma.financialTransaction.count()
    ])

    // Create CSV content
    const csvData = []
    
    // Add headers
    csvData.push([
      'Metric',
      'Value',
      'Category',
      'Date'
    ])

    const now = new Date().toISOString()

    // Add basic metrics
    csvData.push(['Total Users', users.length.toString(), 'Users', now])
    csvData.push(['Total Farms', farms.length.toString(), 'Farms', now])
    csvData.push(['Total Fields', fields.length.toString(), 'Fields', now])
    csvData.push(['Weather Alerts', weatherAlerts.toString(), 'System', now])
    csvData.push(['Financial Transactions', financialTransactions.toString(), 'Financial', now])

    // Add user type breakdown
    const userTypeBreakdown = users.reduce((acc, user) => {
      const type = user.userType || 'Unspecified'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(userTypeBreakdown).forEach(([type, count]) => {
      csvData.push([`Users - ${type}`, count.toString(), 'User Types', now])
    })

    // Add role breakdown
    const roleBreakdown = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(roleBreakdown).forEach(([role, count]) => {
      csvData.push([`Users - ${role}`, count.toString(), 'User Roles', now])
    })

    // Add registration trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentUsers = users.filter(user => new Date(user.createdAt) >= thirtyDaysAgo)
    csvData.push(['New Users (30d)', recentUsers.length.toString(), 'Growth', now])

    // Add activity metrics
    const activeUsers = users.filter(user => 
      user.lastLoginAt && new Date(user.lastLoginAt) >= thirtyDaysAgo
    )
    csvData.push(['Active Users (30d)', activeUsers.length.toString(), 'Engagement', now])
    
    // Calculate engagement rate
    const engagementRate = users.length > 0 ? (activeUsers.length / users.length * 100).toFixed(2) : '0'
    csvData.push(['Engagement Rate (%)', engagementRate, 'Engagement', now])

    // Add farm adoption rate
    const usersWithFarms = new Set(farms.map(farm => farm.owner.id)).size
    const adoptionRate = users.length > 0 ? (usersWithFarms / users.length * 100).toFixed(2) : '0'
    csvData.push(['Farm Adoption Rate (%)', adoptionRate, 'Adoption', now])

    // Add geographic distribution (mock data - would be real in production)
    csvData.push(['Average Farm Size (ha)', farms.length > 0 ? (farms.reduce((sum, farm) => sum + (farm.totalArea || 0), 0) / farms.length).toFixed(2) : '0', 'Farm Stats', now])
    csvData.push(['Average Fields per Farm', farms.length > 0 ? (fields.length / farms.length).toFixed(2) : '0', 'Farm Stats', now])

    // Convert to CSV string
    const csvString = csvData.map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    // Return CSV file
    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="crops-ai-analytics-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Export data error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}