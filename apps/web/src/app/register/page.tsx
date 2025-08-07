import { RegisterForm } from '../../components/auth/register-form'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-crops organic-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Crops.AI</h1>
          <p className="text-white/80 text-lg font-light">Create your farm management account</p>
        </div>
        
        <div className="card-gradient">
          <RegisterForm />
        </div>
        
        <div className="text-center">
          <p className="text-white/80">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-white hover:text-white/80 underline underline-offset-4">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}