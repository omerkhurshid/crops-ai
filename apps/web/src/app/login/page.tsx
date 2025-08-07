import { LoginForm } from '../../components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-crops organic-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Crops.AI</h1>
          <p className="text-white/80 text-lg font-light">Welcome back to your farm management platform</p>
        </div>
        
        <div className="card-gradient">
          <LoginForm />
        </div>
        
        <div className="text-center">
          <p className="text-white/80">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-white hover:text-white/80 underline underline-offset-4">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}