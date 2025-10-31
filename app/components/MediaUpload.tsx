// ============================================
// FRONTEND: components/MediaUpload.tsx
// ============================================
import React, {
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'

export interface MediaUploadHandle {
  openFileDialog: (type?: 'image' | 'video' | 'audio' | 'any') => void
}

interface MediaUploadProps {
  onMediaUploaded: (url: string) => void
  onMediaRemoved: () => void
  userId: string
  className?: string
}

export interface UploadedMedia {
  url: string
  type: string
  name: string
}

const MediaUpload = forwardRef<MediaUploadHandle, MediaUploadProps>(
  ({ onMediaUploaded, onMediaRemoved, userId, className = '' }, ref) => {
    const [acceptType, setAcceptType] = useState<'image' | 'video' | 'audio' | 'any'>('any')
    const [inputKey, setInputKey] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      openFileDialog: (type = 'any') => {
        setAcceptType(type)
        setInputKey((prev) => prev + 1) 
        setTimeout(() => {
          fileInputRef.current?.click()
        }, 0)
      },
    }))

    const getAcceptMime = () => {
      switch (acceptType) {
        case 'image':
          return 'image/*'
        case 'video':
          return 'video/*'
        case 'audio':
          return 'audio/*'
        default:
          return '*/*'
      }
    }

    const validateFile = (file: File): { isValid: boolean; error?: string } => {
      const maxSize = 100 * 1024 * 1024 // 100MB
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/ogg', 'video/avi',
        'video/mkv', 'video/flv', 'video/wmv', 'video/m4v',
        'video/3gp', 'video/ts', 'video/mts', 'video/m2ts',
        'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac',
        'audio/flac', 'audio/wma', 'audio/opus', 'audio/aiff', 'audio/pcm',
      ]

      if (file.size > maxSize) {
        return { isValid: false, error: 'File size must be less than 100MB' }
      }

      if (!allowedTypes.includes(file.type)) {
        return { isValid: false, error: 'File type not supported' }
      }

      return { isValid: true }
    }

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !userId) return

      const validation = validateFile(file)
      if (!validation.isValid) {
        alert(validation.error || 'Invalid file')
        return
      }

      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          let errorMessage = 'Upload failed'
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || 'Upload failed'
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError)
            if (response.status === 413) {
              errorMessage = 'File too large. Please try a smaller file.'
            } else if (response.status === 408) {
              errorMessage = 'Upload timeout. Please try again.'
            } else if (response.status >= 500) {
              errorMessage = 'Server error. Please try again later.'
            }
          }
          throw new Error(errorMessage)
        }

        const result = await response.json()
        
        onMediaUploaded(result.url)
      } catch (error) {
        console.error('Failed to upload file:', error)
        alert(error instanceof Error ? error.message : 'Failed to upload file. Please try again.')
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }

    return (
      <div className={className}>
        <input
          key={inputKey}
          ref={fileInputRef}
          type="file"
          accept={getAcceptMime()}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        {isUploading && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4">
              {/* Animated upload icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto relative">
                  {/* Outer rotating ring */}
                  <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-purple-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>

                  {/* Inner pulsing circle */}
                  <div className="absolute inset-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Upload text */}
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-lg">Uploading Media</h3>
                <p className="text-gray-400 text-sm">Please wait while we upload your file...</p>

                {/* Animated dots */}
                <div className="flex justify-center gap-1 mt-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

MediaUpload.displayName = 'MediaUpload'

export default MediaUpload