export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-crops-green-700">
          Welcome to Crops.AI
        </h1>
        <p className="text-center text-lg text-gray-600 mb-12">
          AI-powered land and crop management platform for modern agriculture
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md border border-crops-green-200">
            <h2 className="text-xl font-semibold mb-3 text-crops-green-700">
              Weather Intelligence
            </h2>
            <p className="text-gray-600">
              Real-time weather data and hyperlocal forecasting for precise farm management
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-crops-green-200">
            <h2 className="text-xl font-semibold mb-3 text-crops-green-700">
              Satellite Monitoring
            </h2>
            <p className="text-gray-600">
              Track crop health and growth stages with advanced satellite imagery analysis
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-crops-green-200">
            <h2 className="text-xl font-semibold mb-3 text-crops-green-700">
              AI Recommendations
            </h2>
            <p className="text-gray-600">
              Get intelligent insights for planting, irrigation, and harvest optimization
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}