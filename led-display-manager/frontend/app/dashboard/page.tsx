'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [displays, setDisplays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchDisplays()
    }
  }, [user])

  const fetchDisplays = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/displays`, {
        headers: {
          'Authorization': `Bearer ${(user as any)?.session?.access_token || ''}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setDisplays(data)
      }
    } catch (error) {
      console.error('Failed to fetch displays:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">LED Display Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">{user?.email}</span>
              <button
                onClick={() => router.push('/logout')}
                className="text-gray-300 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">My Displays</h2>
            <Link
              href="/dashboard/displays/add"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Display
            </Link>
          </div>

          {displays.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">No displays</h3>
              <p className="mt-1 text-sm text-gray-400">
                Get started by adding a new display.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/displays/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Display
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displays.map((display: any) => (
                <Link
                  key={display.id}
                  href={`/dashboard/displays/${display.id}`}
                  className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">{display.display_name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        display.status === 'online'
                          ? 'bg-green-900 text-green-300'
                          : display.status === 'offline'
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-red-900 text-red-300'
                      }`}
                    >
                      {display.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{display.location || 'No location set'}</p>
                  <p className="text-xs text-gray-500">ID: {display.vnnox_terminal_id}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}