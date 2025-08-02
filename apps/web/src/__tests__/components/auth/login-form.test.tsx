import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { LoginForm } from '../../../components/auth/login-form'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('LoginForm', () => {
  const mockPush = jest.fn()
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    })
    jest.clearAllMocks()
  })

  it('renders login form with all elements', () => {
    render(<LoginForm />)

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByText('Enter your credentials to access your Crops.AI account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument()
  })

  it('updates input values when user types', () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('submits form with correct credentials', async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      })
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error message on failed login', async () => {
    mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })

  it('shows loading state during sign in', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ ok: true, error: null }), 100)
    ))

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })
  })

  it('handles Google sign in', () => {
    render(<LoginForm callbackUrl="/custom-callback" />)

    const googleButton = screen.getByRole('button', { name: 'Sign in with Google' })
    fireEvent.click(googleButton)

    expect(mockSignIn).toHaveBeenCalledWith('google', { 
      callbackUrl: '/custom-callback' 
    })
  })

  it('uses custom callback URL when provided', async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null })

    render(<LoginForm callbackUrl="/custom-dashboard" />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-dashboard')
    })
  })

  it('handles network errors gracefully', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'))

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument()
    })
  })

  it('requires email and password fields', () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')

    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  it('clears error message when retrying', async () => {
    mockSignIn.mockResolvedValueOnce({ ok: false, error: 'CredentialsSignin' })
      .mockResolvedValueOnce({ ok: true, error: null })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    // First attempt - should show error
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })

    // Second attempt - error should clear
    fireEvent.change(emailInput, { target: { value: 'correct@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument()
    })
  })
})