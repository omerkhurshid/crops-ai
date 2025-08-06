'use client'

import { useState } from 'react'

export default function TestLoginPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Get CSRF token
      const csrfRes = await fetch('/api/auth/csrf')
      const { csrfToken } = await csrfRes.json()

      // Attempt login
      const loginRes = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          csrfToken,
          email: 'demo@crops.ai',
          password: 'Demo123!',
          json: 'true'
        })
      })

      const data = await loginRes.text()
      
      try {
        const jsonData = JSON.parse(data)
        setResult({
          status: loginRes.status,
          data: jsonData,
          headers: Object.fromEntries(loginRes.headers.entries())
        })
      } catch {
        setResult({
          status: loginRes.status,
          data: data,
          headers: Object.fromEntries(loginRes.headers.entries())
        })
      }
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Login Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Credentials</h2>
          <p>Email: demo@crops.ai</p>
          <p>Password: Demo123!</p>
        </div>

        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-6"
        >
          {loading ? 'Testing...' : 'Test Login'}
        </button>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Result</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}