'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'

interface MediaUploadProps {
  displayId: string
}

export default function MediaUpload({ displayId }: MediaUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [media, setMedia] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchMedia()
  }, [])

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/media/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.session?.access_token}`
          },
          body: formData
        }
      )

      if (response.ok) {
        setSelectedFile(null)
        setPreview(null)
        fetchMedia()
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handlePublish = async (mediaId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/media/${mediaId}/publish/${displayId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.session?.access_token}`
          }
        }
      )

      if (response.ok) {
        alert('Media published to display!')
      }
    } catch (error) {
      console.error('Failed to publish media:', error)
    }
  }

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/media/${mediaId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.session?.access_token}`
          }
        }
      )

      if (response.ok) {
        fetchMedia()
      }
    } catch (error) {
      console.error('Failed to delete media:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Upload Media</h2>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            {preview ? (
              <div className="space-y-4">
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      setPreview(null)
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/mp4"
                  onChange={handleFileSelect}
                />
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-400">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF, MP4 up to 50MB</p>
                </div>
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Media Library</h2>
        
        {media.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No media uploaded yet</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <div key={item.id} className="bg-gray-700 rounded-lg overflow-hidden">
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.file_name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-600 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-white text-sm truncate">{item.file_name}</p>
                  <p className="text-gray-400 text-xs">
                    {(item.file_size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handlePublish(item.id)}
                      className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}