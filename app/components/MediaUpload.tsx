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

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        setIsUploading(true)
        try {
          // Create FormData for upload
          const formData = new FormData()
          formData.append('file', file)
          formData.append('userId', userId || 'temp')

          // Upload to S3 via API
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error('Upload failed')
          }

          const result = await response.json()
          
          if (result.success) {
            onMediaUploaded(result.url)
          } else {
            throw new Error(result.error || 'Upload failed')
          }
        } catch (error) {
          console.error('Failed to upload file:', error)
          // Fallback to local blob URL for now
          const fileUrl = URL.createObjectURL(file)
          onMediaUploaded(fileUrl)
        } finally {
          setIsUploading(false)
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
        />
      </div>
    )
  }
)

MediaUpload.displayName = 'MediaUpload'

export default MediaUpload
