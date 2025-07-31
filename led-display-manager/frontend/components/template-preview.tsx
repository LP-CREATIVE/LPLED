'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'

interface TemplatePreviewProps {
  template: any
}

export default function TemplatePreview({ template }: TemplatePreviewProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const handleUseTemplate = () => {
    if (!user) {
      router.push('/login')
      return
    }
    setShowModal(true)
  }

  return (
    <>
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
        <div className="aspect-video bg-gray-700 relative overflow-hidden">
          {template.preview_url ? (
            <img 
              src={template.preview_url} 
              alt={template.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">{template.template_data?.icon || '📄'}</div>
                <div className="text-gray-400 text-sm">Preview</div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-white font-medium mb-1">{template.name}</h3>
          <p className="text-gray-400 text-sm mb-3">{template.description || 'No description'}</p>
          <button
            onClick={handleUseTemplate}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Use Template
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Customize Template</h2>
            
            <div className="space-y-4">
              {template.template_data?.fields?.map((field: any, index: number) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {field.label}
                  </label>
                  {field.type === 'text' && (
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder={field.placeholder}
                    />
                  )}
                  {field.type === 'textarea' && (
                    <textarea
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      rows={3}
                      placeholder={field.placeholder}
                    />
                  )}
                  {field.type === 'color' && (
                    <input
                      type="color"
                      className="w-full h-10 bg-gray-700 border border-gray-600 rounded-md"
                    />
                  )}
                </div>
              ))}

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Template customization would be saved and sent to display')
                    setShowModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Apply to Display
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}