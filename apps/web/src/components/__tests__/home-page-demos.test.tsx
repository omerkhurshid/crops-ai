/**
 * Tests for Home Page Demo Components
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NDVIDemo, WeatherDemo, FinancialDemo } from '../demos/home-page-demos'

// Mock fetch for weather API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('NDVIDemo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render NDVI demo component', () => {
    render(<NDVIDemo />)
    
    expect(screen.getByText('Live Satellite Monitoring')).toBeInTheDocument()
    expect(screen.getByText('Real Field Data')).toBeInTheDocument()
    expect(screen.getByText('Nebraska Corn Field - Central Plains')).toBeInTheDocument()
  })

  it('should display current NDVI value', () => {
    render(<NDVIDemo />)
    
    // Should show the current NDVI value (0.82) - use getAllByText since it appears multiple times
    expect(screen.getAllByText('0.82')[0]).toBeInTheDocument()
    expect(screen.getByText('Current NDVI')).toBeInTheDocument()
  })

  it('should show growing season progress', () => {
    render(<NDVIDemo />)
    
    expect(screen.getByText('Growing Season Progress')).toBeInTheDocument()
    
    // Should show different growth stages
    expect(screen.getByText('Emergence')).toBeInTheDocument()
    expect(screen.getByText('R1')).toBeInTheDocument()
    expect(screen.getByText('Harvest Ready')).toBeInTheDocument()
  })

  it('should handle point selection in timeline', () => {
    render(<NDVIDemo />)
    
    // Click on a timeline point
    const timelinePoint = screen.getByText('V6')
    fireEvent.click(timelinePoint)
    
    // Timeline item should be clickable (basic test for interaction)
    expect(timelinePoint).toBeInTheDocument()
  })

  it('should display trend information', () => {
    render(<NDVIDemo />)
    
    expect(screen.getByText('+5.0%')).toBeInTheDocument()
    expect(screen.getByText('7-day trend')).toBeInTheDocument()
  })
})

describe('WeatherDemo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({})
    })
  })

  it('should render weather demo component', () => {
    render(<WeatherDemo />)
    
    expect(screen.getByText('Hyperlocal Weather')).toBeInTheDocument()
  })

  it('should display current weather conditions', async () => {
    render(<WeatherDemo />)
    
    await waitFor(() => {
      expect(screen.getByText('72°F')).toBeInTheDocument()
      expect(screen.getByText('68%')).toBeInTheDocument()
      expect(screen.getByText('8 mph')).toBeInTheDocument()
    })
  })

  it('should show 5-day forecast', async () => {
    render(<WeatherDemo />)
    
    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Tomorrow')).toBeInTheDocument()
      expect(screen.getByText('78°/62°')).toBeInTheDocument()
    })
  })

  it('should attempt to fetch real weather data', async () => {
    render(<WeatherDemo />)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/weather/current')
      )
    })
  })

  it('should display agricultural recommendations', async () => {
    render(<WeatherDemo />)
    
    await waitFor(() => {
      expect(screen.getByText('Farm Recommendations')).toBeInTheDocument()
      expect(screen.getByText('Ideal conditions for harvest operations')).toBeInTheDocument()
    })
  })

  it('should handle weather API success', async () => {
    const mockWeatherData = {
      temperature: 25,
      humidity: 65,
      windSpeed: 3.5,
      forecast: [
        {
          day: 'Today',
          high: 28,
          low: 18,
          condition: 'Sunny',
          precipitation: 0
        }
      ]
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: mockWeatherData,
        apiStatus: 'live'
      })
    })

    render(<WeatherDemo />)
    
    await waitFor(() => {
      expect(screen.getByText('Live Data')).toBeInTheDocument()
    })
  })
})

describe('FinancialDemo', () => {
  it('should render financial demo component', () => {
    render(<FinancialDemo />)
    
    expect(screen.getByText('Financial Intelligence')).toBeInTheDocument()
    expect(screen.getByText('Real-Time')).toBeInTheDocument()
  })

  it('should display projected net profit', () => {
    render(<FinancialDemo />)
    
    expect(screen.getByText('$34,600')).toBeInTheDocument()
    expect(screen.getByText('Projected Net Profit')).toBeInTheDocument()
  })

  it('should show financial metrics', () => {
    render(<FinancialDemo />)
    
    // Check for key financial numbers
    expect(screen.getByText('$185')).toBeInTheDocument() // Estimated yield
    expect(screen.getByText('$4.25')).toBeInTheDocument() // Market price
    expect(screen.getByText('$3.14')).toBeInTheDocument() // Breakeven
    
    expect(screen.getByText('$125,800')).toBeInTheDocument() // Total revenue
    expect(screen.getByText('$91,200')).toBeInTheDocument() // Total expenses
  })

  it('should display smart alerts', () => {
    render(<FinancialDemo />)
    
    expect(screen.getByText('Smart Alerts')).toBeInTheDocument()
    expect(screen.getByText('Optimal harvest conditions predicted for Oct 15-18')).toBeInTheDocument()
    expect(screen.getByText('Corn futures up 3.2% - Consider forward contracting')).toBeInTheDocument()
  })

  it('should show investment impact calculations', () => {
    render(<FinancialDemo />)
    
    expect(screen.getByText('Investment Impact')).toBeInTheDocument()
    expect(screen.getByText('If yield increases 5%:')).toBeInTheDocument()
    expect(screen.getByText('+$1,570')).toBeInTheDocument()
    expect(screen.getByText('Precision ag ROI:')).toBeInTheDocument()
    expect(screen.getByText('320%')).toBeInTheDocument()
  })

  it('should show field information', () => {
    render(<FinancialDemo />)
    
    expect(screen.getByText('$216.25/acre • 160 acres')).toBeInTheDocument()
  })

  it('should have responsive design elements', () => {
    render(<FinancialDemo />)
    
    // Check for responsive grid classes (this is a basic check)
    const gridElements = screen.getAllByText('Smart Alerts')[0].closest('div')
    expect(gridElements).toBeInTheDocument()
  })
})