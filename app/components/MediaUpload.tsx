'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, Image, Video, Music, File } from 'lucide-react'
import { getFileType, validateFile } from '@/app/lib/s3'

interface MediaUploadProps {
  onMediaUploaded: (url: string) => void
  onMediaRemoved: () => void
  userId: string
  className?: string
}

interface UploadedMedia {
  url: string
  type: 'image' | 'video' | 'audio' | 'other'
  name: string
}

export default function MediaUpload({ 
  onMediaUploaded, 
  onMediaRemoved, 
  userId, 
  className = '' 
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      setError(validation.error)
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      const mediaType = getFileType(file)
      const uploadedMediaData: UploadedMedia = {
        url: result.url,
        type: mediaType,
        name: file.name,
      }

      setUploadedMedia(uploadedMediaData)
      onMediaUploaded(result.url)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [userId, onMediaUploaded])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleRemoveMedia = useCallback(() => {
    setUploadedMedia(null)
    onMediaRemoved()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onMediaRemoved])

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-6 h-6" />
      case 'video':
        return <Video className="w-6 h-6" />
      case 'audio':
        return <Music className="w-6 h-6" />
      default:
        return <File className="w-6 h-6" />
    }
  }

  const renderMediaPreview = () => {
    if (!uploadedMedia) return null

    return (
      <div className="relative group">
        <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          {uploadedMedia.type === 'image' && (
            <img
              src={uploadedMedia.url}
              alt={uploadedMedia.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          )}
          {uploadedMedia.type === 'video' && (
            <video
              src={uploadedMedia.url}
              className="w-full h-48 object-cover"
              controls
            />
          )}
          {uploadedMedia.type === 'audio' && (
            <div className="p-4 flex items-center justify-center">
              <audio src={uploadedMedia.url} controls className="w-full" />
            </div>
          )}
          {uploadedMedia.type === 'other' && (
            <div className="p-4 flex items-center justify-center">
              <div className="text-center">
                {getMediaIcon(uploadedMedia.type)}
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {uploadedMedia.name}
                </p>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleRemoveMedia}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (uploadedMedia) {
    return (
      <div className={className}>
        {renderMediaPreview()}
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <Upload className="w-12 h-12 mx-auto text-gray-400" />
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isUploading ? 'Uploading...' : 'Upload Media'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Drag and drop files here, or click to select
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Choose File'}
          </button>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>Supported: Images, Videos, Audio</p>
            <p>Max size: 50MB</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
} 