import { Navbar } from '../../../components/navigation/navbar'
import ClientFarmsPage from '../client-page'

export const dynamic = 'force-dynamic'

export default function DebugFarmsPage() {
  return (
    <div className="min-h-screen bg-agricultural">
      <div className="absolute inset-0 agricultural-overlay"></div>
      <Navbar />
      <ClientFarmsPage />
    </div>
  )
}