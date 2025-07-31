'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import DisplayControls from '@/components/display-controls'
import MediaUpload from '@/components/media-upload'
import ContentScheduler from '@/components/content-scheduler'

export default function DisplayDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [display, setDisplay] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('control')

  useEffect(() => {
    fetchDisplay()
  }, [params.id])

  const fetchDisplay = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/displays/${params.id}`,
        {
          headers: {
            'Authorization': `Bearer ${user?.session?.access_token}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setDisplay(data)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch display:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!display) {
    return null
  }

  const tabs = [
    { id: 'control', name: 'Control', icon: '🎛️' },
    { id: 'media', name: 'Media', icon: '🖼️' },
    { id: 'schedule', name: 'Schedule', icon: '📅' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-300 hover:text-white flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center">
              <span
                className={`px-3 py-1 text-sm rounded-full ${
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
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">{display.display_name}</h1>
            <p className="text-gray-400 mt-1">{display.location || 'No location set'}</p>
            <p className="text-gray-500 text-sm mt-2">Terminal ID: {display.vnnox_terminal_id}</p>
          </div>

          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm flex items-center
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-8">
            {activeTab === 'control' && <DisplayControls display={display} />}
            {activeTab === 'media' && <MediaUpload displayId={display.id} />}
            {activeTab === 'schedule' && <ContentScheduler displayId={display.id} />}
            {activeTab === 'settings' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Display Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                    <input
                      type="text"
                      defaultValue={display.display_name}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      defaultValue={display.location}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}