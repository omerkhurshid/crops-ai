import { RegisterForm } from '@/components/auth/register-form'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-crops-green-700 mb-2">Crops.AI</h1>
          <p className="text-gray-600">Create your farm management account</p>
        </div>
        
        <RegisterForm />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-crops-green-600 hover:text-crops-green-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}