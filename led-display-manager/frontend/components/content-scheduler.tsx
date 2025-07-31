'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'

interface ContentSchedulerProps {
  displayId: string
}

export default function ContentScheduler({ displayId }: ContentSchedulerProps) {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState<any[]>([])
  const [media, setMedia] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    contentType: 'media',
    contentId: '',
    startTime: '',
    endTime: '',
    repeatDays: [] as string[]
  })

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  useEffect(() => {
    fetchSchedules()
    fetchMedia()
  }, [displayId])

  const fetchSchedules = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/schedules?displayId=${displayId}`,
        {
          headers: {
            'Authorization': `Bearer ${user?.session?.access_token}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
    }
  }

  const fetchMedia = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/media`,
        {
          headers: {
            'Authorization': `Bearer ${user?.session?.access_token}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setMedia(data)
      }
    } catch (error) {
      console.error('Failed to fetch media:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/schedules`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.session?.access_token}`
          },
          body: JSON.stringify({
            ...formData,
            displayId
          })
        }
      )

      if (response.ok) {
        setShowForm(false)
        setFormData({
          contentType: 'media',
          contentId: '',
          startTime: '',
          endTime: '',
          repeatDays: []
        })
        fetchSchedules()
      }
    } catch (error) {
      console.error('Failed to create schedule:', error)
    }
  }

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/schedules/${scheduleId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.session?.access_token}`
          }
        }
      )

      if (response.ok) {
        fetchSchedules()
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error)
    }
  }

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      repeatDays: prev.repeatDays.includes(day)
        ? prev.repeatDays.filter(d => d !== day)
        : [...prev.repeatDays, day]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Content Schedule</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Schedule'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 bg-gray-700 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
              <select
                value={formData.contentId}
                onChange={(e) => setFormData({ ...formData, contentId: e.target.value })}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              >
                <option value="">Select content</option>
                {media.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.file_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Repeat Days</label>
              <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-2 py-1 text-xs rounded ${
                      formData.repeatDays.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {day.slice(0, 3).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Schedule
            </button>
          </form>
        )}

        {schedules.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No schedules created yet</p>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => {
              const mediaItem = media.find(m => m.id === schedule.content_id)
              return (
                <div key={schedule.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium">{mediaItem?.file_name || 'Unknown content'}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Start: {new Date(schedule.start_time).toLocaleString()}
                      </p>
                      {schedule.end_time && (
                        <p className="text-sm text-gray-400">
                          End: {new Date(schedule.end_time).toLocaleString()}
                        </p>
                      )}
                      {schedule.repeat_days && schedule.repeat_days.length > 0 && (
                        <p className="text-sm text-gray-400 mt-1">
                          Repeats: {schedule.repeat_days.map((d: string) => d.slice(0, 3).toUpperCase()).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        schedule.is_active ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {schedule.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}