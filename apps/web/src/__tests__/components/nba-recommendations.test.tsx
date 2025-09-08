/**
 * NBA Recommendations Component Tests
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import NBARecommendations from '../../components/dashboard/nba-recommendations'

// Mock the NBA recommendations hook
jest.mock('../../hooks/useNBARecommendations', () => ({
  useNBARecommendations: jest.fn(() => ({
    recommendations: [
      {
        id: 'rec-1',
        type: 'SPRAY',
        priority: 'HIGH',
        title: 'Apply Fungicide to North Field',
        description: 'Weather conditions are optimal for fungicide application',
        confidence: 85,
        totalScore: 78,
        timing: {
          idealStart: new Date('2024-05-01T06:00:00Z'),
          idealEnd: new Date('2024-05-01T18:00:00Z')
        },
        estimatedImpact: {
          revenue: 1500,
          costSavings: 500
        },
        explanation: 'High humidity detected, preventive fungicide application recommended',
        actionSteps: ['Check sprayer', 'Mix chemicals', 'Apply in morning'],
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    loading: false,
    error: null,
    generateRecommendations: jest.fn(),
    acceptRecommendation: jest.fn(),
    rejectRecommendation: jest.fn(),
    dismissRecommendation: jest.fn(),
    getUrgentRecommendations: jest.fn(() => []),
    getHighValueRecommendations: jest.fn(() => [])
  }))
}))

describe('NBA Recommendations Component', () => {
  const mockFarmId = 'farm-1'
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders successfully with recommendations', () => {
    render(<NBARecommendations farmId={mockFarmId} />)
    
    expect(screen.getByText('Next Best Actions')).toBeInTheDocument()
    expect(screen.getByText('Apply Fungicide to North Field')).toBeInTheDocument()
    expect(screen.getByText('Weather conditions are optimal for fungicide application')).toBeInTheDocument()
  })

  it('shows empty state when no recommendations', () => {
    const { useNBARecommendations } = require('../../hooks/useNBARecommendations')
    useNBARecommendations.mockReturnValue({
      recommendations: [],
      loading: false,
      error: null,
      generateRecommendations: jest.fn(),
      acceptRecommendation: jest.fn(),
      rejectRecommendation: jest.fn(),
      dismissRecommendation: jest.fn(),
      getUrgentRecommendations: jest.fn(() => []),
      getHighValueRecommendations: jest.fn(() => [])
    })

    render(<NBARecommendations farmId={mockFarmId} />)
    
    expect(screen.getByText('All caught up!')).toBeInTheDocument()
    expect(screen.getByText('No urgent actions needed right now.')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    const { useNBARecommendations } = require('../../hooks/useNBARecommendations')
    useNBARecommendations.mockReturnValue({
      recommendations: [],
      loading: true,
      error: null,
      generateRecommendations: jest.fn(),
      acceptRecommendation: jest.fn(),
      rejectRecommendation: jest.fn(),
      dismissRecommendation: jest.fn(),
      getUrgentRecommendations: jest.fn(() => []),
      getHighValueRecommendations: jest.fn(() => [])
    })

    render(<NBARecommendations farmId={mockFarmId} />)
    
    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows error state', () => {
    const { useNBARecommendations } = require('../../hooks/useNBARecommendations')
    useNBARecommendations.mockReturnValue({
      recommendations: [],
      loading: false,
      error: 'Failed to load recommendations',
      generateRecommendations: jest.fn(),
      acceptRecommendation: jest.fn(),
      rejectRecommendation: jest.fn(),
      dismissRecommendation: jest.fn(),
      getUrgentRecommendations: jest.fn(() => []),
      getHighValueRecommendations: jest.fn(() => [])
    })

    render(<NBARecommendations farmId={mockFarmId} />)
    
    expect(screen.getByText('Failed to load recommendations')).toBeInTheDocument()
  })

  it('handles refresh button click', async () => {
    const user = userEvent.setup()
    const mockGenerate = jest.fn()
    
    const { useNBARecommendations } = require('../../hooks/useNBARecommendations')
    useNBARecommendations.mockReturnValue({
      recommendations: [],
      loading: false,
      error: null,
      generateRecommendations: mockGenerate,
      acceptRecommendation: jest.fn(),
      rejectRecommendation: jest.fn(),
      dismissRecommendation: jest.fn(),
      getUrgentRecommendations: jest.fn(() => []),
      getHighValueRecommendations: jest.fn(() => [])
    })

    render(<NBARecommendations farmId={mockFarmId} />)
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    await user.click(refreshButton)
    
    expect(mockGenerate).toHaveBeenCalledWith({
      farmId: mockFarmId,
      excludeCompletedTasks: true,
      maxRecommendations: 8
    })
  })

  it('handles accept recommendation', async () => {
    const user = userEvent.setup()
    const mockAccept = jest.fn()
    
    const { useNBARecommendations } = require('../../hooks/useNBARecommendations')
    useNBARecommendations.mockReturnValue({
      recommendations: [
        {
          id: 'rec-1',
          type: 'SPRAY',
          priority: 'HIGH',
          title: 'Apply Fungicide to North Field',
          description: 'Weather conditions are optimal',
          confidence: 85,
          totalScore: 78,
          status: 'PENDING',
          estimatedImpact: { revenue: 1500 },
          timing: {},
          actionSteps: [],
          explanation: 'Test',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      loading: false,
      error: null,
      generateRecommendations: jest.fn(),
      acceptRecommendation: mockAccept,
      rejectRecommendation: jest.fn(),
      dismissRecommendation: jest.fn(),
      getUrgentRecommendations: jest.fn(() => []),
      getHighValueRecommendations: jest.fn(() => [])
    })

    render(<NBARecommendations farmId={mockFarmId} />)
    
    const acceptButton = screen.getByTitle('Accept recommendation')
    await user.click(acceptButton)
    
    expect(mockAccept).toHaveBeenCalledWith('rec-1', 'Accepted via dashboard')
  })

  it('handles reject recommendation', async () => {
    const user = userEvent.setup()
    const mockReject = jest.fn()
    
    const { useNBARecommendations } = require('../../hooks/useNBARecommendations')
    useNBARecommendations.mockReturnValue({
      recommendations: [
        {
          id: 'rec-1',
          type: 'SPRAY',
          priority: 'HIGH',
          title: 'Apply Fungicide to North Field',
          description: 'Weather conditions are optimal',
          confidence: 85,
          totalScore: 78,
          status: 'PENDING',
          estimatedImpact: { revenue: 1500 },
          timing: {},
          actionSteps: [],
          explanation: 'Test',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      loading: false,
      error: null,
      generateRecommendations: jest.fn(),
      acceptRecommendation: jest.fn(),
      rejectRecommendation: mockReject,
      dismissRecommendation: jest.fn(),
      getUrgentRecommendations: jest.fn(() => []),
      getHighValueRecommendations: jest.fn(() => [])
    })

    render(<NBARecommendations farmId={mockFarmId} />)
    
    const rejectButton = screen.getByTitle('Reject recommendation')
    await user.click(rejectButton)
    
    expect(mockReject).toHaveBeenCalledWith('rec-1', 'Rejected via dashboard')
  })

  it('shows recommendation details modal', async () => {
    const user = userEvent.setup()
    
    render(<NBARecommendations farmId={mockFarmId} />)
    
    const viewButton = screen.getByTitle('View details')
    await user.click(viewButton)
    
    // Modal should open with detailed information
    expect(screen.getByText('Apply Fungicide to North Field')).toBeInTheDocument()
    expect(screen.getByText('Financial Impact')).toBeInTheDocument()
    expect(screen.getByText('Action Steps')).toBeInTheDocument()
  })

  it('validates farm ID prop', () => {
    render(<NBARecommendations farmId="" />)
    
    expect(screen.getByText('Farm not selected')).toBeInTheDocument()
    expect(screen.getByText('Please select a farm to view recommendations')).toBeInTheDocument()
  })

  it('displays correct priority styling', () => {
    render(<NBARecommendations farmId={mockFarmId} />)
    
    const priorityBadge = screen.getByText('HIGH')
    expect(priorityBadge).toHaveClass('bg-orange-100', 'text-orange-800')
  })

  it('formats currency values correctly', () => {
    render(<NBARecommendations farmId={mockFarmId} />)
    
    expect(screen.getByText('$1,500 revenue')).toBeInTheDocument()
    expect(screen.getByText('$500 savings')).toBeInTheDocument()
  })

  it('shows confidence percentage', () => {
    render(<NBARecommendations farmId={mockFarmId} />)
    
    expect(screen.getByText('85% confidence')).toBeInTheDocument()
  })

  it('handles error boundary', () => {
    // Mock console.error to avoid noise in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    const ThrowError = () => {
      throw new Error('Test error')
    }
    
    const { useNBARecommendations } = require('../../hooks/useNBARecommendations')
    useNBARecommendations.mockImplementation(() => {
      throw new Error('Hook error')
    })

    render(<NBARecommendations farmId={mockFarmId} />)
    
    expect(screen.getByText('Recommendations Error')).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })
})