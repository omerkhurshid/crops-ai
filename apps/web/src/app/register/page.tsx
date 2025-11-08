import { RegisterForm } from '../../components/auth/register-form'
import { Navbar } from '../../components/navigation/navbar'
import Link from 'next/link'
export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-sage-800 mb-4">Increase Your Profits</h1>
            <p className="text-sage-600 text-lg">Join 1,200+ farmers earning $15K+ more per season</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <RegisterForm />
          </div>
          <div className="text-center">
            <p className="text-sage-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-sage-700 hover:text-sage-800 underline underline-offset-4">
                Sign in here
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