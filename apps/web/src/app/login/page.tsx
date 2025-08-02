import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-crops-green-700 mb-2">Crops.AI</h1>
          <p className="text-gray-600">Welcome back to your farm management platform</p>
        </div>
        
        <LoginForm />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-crops-green-600 hover:text-crops-green-500">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}