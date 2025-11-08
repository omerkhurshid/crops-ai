import { LoginForm } from '../../components/auth/login-form'
import { Navbar } from '../../components/navigation/navbar'
import Link from 'next/link'
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-sage-800 mb-3 sm:mb-4">Cropple.ai</h1>
            <p className="text-sage-600 text-base sm:text-lg px-2">Welcome back to your farm management platform</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-8">
            <LoginForm />
          </div>
          <div className="text-center px-2">
            <p className="text-sage-600 text-sm sm:text-base">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-sage-700 hover:text-sage-800 underline underline-offset-4">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-sage-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-sage-600">
              <p>© 2025 Cropple.ai. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-sage-600">Built with Next.js & AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}