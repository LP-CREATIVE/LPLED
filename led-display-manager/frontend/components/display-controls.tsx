'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'

interface DisplayControlsProps {
  display: any
}

export default function DisplayControls({ display }: DisplayControlsProps) {
  const { user } = useAuth()
  const [brightness, setBrightness] = useState(50)
  const [volume, setVolume] = useState(50)
  const [loading, setLoading] = useState<string | null>(null)

  const handleControl = async (endpoint: string, data: any) => {
    setLoading(endpoint)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/displays/${display.id}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.session?.access_token}`
          },
          body: JSON.stringify(data)
        }
      )
      if (!response.ok) {
        throw new Error('Control command failed')
      }
    } catch (error) {
      console.error(`Failed to ${endpoint}:`, error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Screen Controls</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Brightness: {brightness}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              onMouseUp={() => handleControl('brightness', { brightness })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Volume: {volume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              onMouseUp={() => handleControl('volume', { volume })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Power Controls</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleControl('power', { power: true })}
            disabled={loading === 'power'}
            className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Turn On
          </button>
          
          <button
            onClick={() => handleControl('power', { power: false })}
            disabled={loading === 'power'}
            className="px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Turn Off
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to reboot the display?')) {
              handleControl('reboot', {})
            }
          }}
          disabled={loading === 'reboot'}
          className="w-full mt-4 px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reboot Display
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Display Information</h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Terminal ID:</span>
            <span className="text-white">{display.vnnox_terminal_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className={`${display.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
              {display.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last Seen:</span>
            <span className="text-white">
              {display.last_seen ? new Date(display.last_seen).toLocaleString() : 'Never'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Created:</span>
            <span className="text-white">{new Date(display.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}