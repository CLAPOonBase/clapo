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
    const [inputKey, setInputKey] = useState(0) // to force re-render of <input>
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      openFileDialog: (type = 'any') => {
        setAcceptType(type)
        setInputKey((prev) => prev + 1) // reset input to apply new accept filter
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
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/avi',
        'video/mkv',
        'video/flv',
        'video/wmv',
        'video/m4v',
        'video/3gp',
        'video/ts',
        'video/mts',
        'video/m2ts',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/aac',
        'audio/flac',
        'audio/wma',
        'audio/opus',
        'audio/aiff',
        'audio/pcm',
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-black rounded-lg p-6 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">Uploading to S3...</p>
            </div>
          </div>
        )}
      </div>
    )
  }
)

MediaUpload.displayName = 'MediaUpload'

export default MediaUpload
