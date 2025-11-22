import { LoginForm } from '../../components/auth/login-form'
import { Navbar } from '../../components/navigation/navbar'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#1A1A1A] mb-3 sm:mb-4">
              Welcome Back
            </h1>
            <p className="text-[#555555] text-base sm:text-lg">
              Sign in to your Cropple.ai account
            </p>
          </div>
          
          <div className="sage-card">
            <LoginForm />
          </div>
          
          <div className="text-center">
            <p className="text-[#555555] text-sm sm:text-base">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-[#7A8F78] hover:text-[#5E6F5A] transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-[#F3F4F6]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-[#555555]">
              <p>© 2024 Cropple.ai. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#555555]">
              <Link href="/privacy" className="hover:text-[#7A8F78] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#7A8F78] transition-colors">Terms</Link>
              <Link href="/help" className="hover:text-[#7A8F78] transition-colors">Help</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}