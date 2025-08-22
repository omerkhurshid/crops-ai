import { RegisterForm } from '../../components/auth/register-form'
import { Navbar } from '../../components/navigation/navbar'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-agricultural">
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
      
      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-white/80">
              <p>© 2025 Crops.AI. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">Built with Next.js & AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}