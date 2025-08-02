import { render, screen } from '@testing-library/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card with default styles', () => {
      render(<Card data-testid="card">Card content</Card>)
      
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg border bg-card')
    })

    it('applies custom className', () => {
      render(<Card className="custom-card" data-testid="card">Content</Card>)
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-card')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(<Card ref={ref}>Card</Card>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardHeader', () => {
    it('renders header with proper spacing', () => {
      render(<CardHeader data-testid="card-header">Header content</CardHeader>)
      
      const header = screen.getByTestId('card-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('flex flex-col space-y-1.5 p-6')
    })
  })

  describe('CardTitle', () => {
    it('renders title with heading semantics', () => {
      render(<CardTitle>Card Title</CardTitle>)
      
      const title = screen.getByText('Card Title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-2xl font-semibold')
    })
  })

  describe('CardDescription', () => {
    it('renders description with muted color', () => {
      render(<CardDescription>Card description</CardDescription>)
      
      const description = screen.getByText('Card description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm text-muted-foreground')
    })
  })

  describe('CardContent', () => {
    it('renders content with padding', () => {
      render(<CardContent data-testid="card-content">Card content</CardContent>)
      
      const content = screen.getByTestId('card-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('p-6 pt-0')
    })
  })

  describe('CardFooter', () => {
    it('renders footer with flex layout', () => {
      render(<CardFooter data-testid="card-footer">Footer content</CardFooter>)
      
      const footer = screen.getByTestId('card-footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex items-center p-6 pt-0')
    })
  })

  describe('Complete Card', () => {
    it('renders full card structure correctly', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action Button</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByTestId('complete-card')).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
      expect(screen.getByText('Main content goes here')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument()
    })
  })
})