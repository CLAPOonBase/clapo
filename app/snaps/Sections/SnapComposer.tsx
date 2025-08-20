'use client'

import React, { useState, useRef } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Image from 'next/image'
import {
  Image as ImageIcon,
  Video,
  File,
  Mic,
  SendHorizonal,
  X,
} from 'lucide-react'
import MediaUpload, { MediaUploadHandle } from '@/app/components/MediaUpload'
import { useSession } from 'next-auth/react'
import { useApi } from '@/app/Context/ApiProvider'

export function SnapComposer() {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | undefined>()
  const { createPost, fetchPosts } = useApi();
  const { data: session, status } = useSession();
  const [uploadedMedia, setUploadedMedia] = useState<{
    url: string
    name: string
    type: 'image' | 'video' | 'audio' | 'other'
  } | null>(null)

  const mediaUploadRef = useRef<MediaUploadHandle>(null)
  const userId = session?.dbUser?.id

  // Debug session data
  console.log('🔍 SnapComposer Session Debug:', {
    status,
    session,
    dbUser: session?.dbUser,
    userId,
    sessionKeys: session ? Object.keys(session) : []
  })

  const actions = [
    { icon: ImageIcon, label: 'Photo', color: 'text-blue-400 border-blue-300 hover:text-blue-300', type: 'image' },
    { icon: Video, label: 'Video', color: 'text-purple-400 border-purple-300 hover:text-purple-300', type: 'video' },
    { icon: File, label: 'File', color: 'text-emerald-400 border-emerald-300 hover:text-emerald-300', type: 'any' },
    { icon: Mic, label: 'Audio', color: 'text-amber-400 border-amber-300 hover:text-amber-300', type: 'audio' },
  ]

  const handleMediaUpload = (url: string) => {
    console.log('🔍 handleMediaUpload called with URL:', url)
    
    // Check if it's an S3 URL (starts with https://snappostmedia.s3)
    if (url.startsWith('https://snappostmedia.s3')) {
      // For S3 URLs, determine type from the URL extension
      const urlLower = url.toLowerCase()
      let mediaType: 'image' | 'video' | 'audio' | 'other' = 'other'
      
      if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || urlLower.includes('.png') || urlLower.includes('.gif') || urlLower.includes('.webp')) {
        mediaType = 'image'
      } else if (urlLower.includes('.mp4') || urlLower.includes('.webm') || urlLower.includes('.ogg') || urlLower.includes('.mov')) {
        mediaType = 'video'
      } else if (urlLower.includes('.mp3') || urlLower.includes('.wav') || urlLower.includes('.m4a')) {
        mediaType = 'audio'
      }

      console.log('✅ Setting S3 media:', { url, type: mediaType })
      setUploadedMedia({
        url,
        name: 'uploaded-file',
        type: mediaType,
      })
      setMediaUrl(url)
    } else {
      // For local blob URLs, fetch and determine type
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const type = blob.type
          let mediaType: 'image' | 'video' | 'audio' | 'other' = 'other'

          if (type.startsWith('image/')) mediaType = 'image'
          else if (type.startsWith('video/')) mediaType = 'video'
          else if (type.startsWith('audio/')) mediaType = 'audio'

          console.log('✅ Setting blob media:', { url, type: mediaType })
          setUploadedMedia({
            url,
            name: 'uploaded-file',
            type: mediaType,
          })
          setMediaUrl(url)
        })
        .catch((err) => {
          console.error('Failed to parse uploaded media', err)
        })
    }
  }

  const handleRemoveMedia = () => {
    setMediaUrl(undefined)
    setUploadedMedia(null)
  }

  const handleSubmit = async () => {
    if (!content.trim() && !mediaUrl) return
    if (!userId) {
      console.error('User ID is missing from session')
      return
    }

    setIsSubmitting(true)

    try {
      console.log('🚀 Submitting post with data:', { userId, content: content.trim(), mediaUrl })
      
      const postData = {
        userId,
        content: content.trim(),
        mediaUrl,
        parentPostId: undefined,
        isRetweet: false,
        retweetRefId: undefined,
      }

      const response = await createPost(postData)
      console.log('✅ Post created successfully:', response)

      setContent('')
      setMediaUrl(undefined)
      setUploadedMedia(null)
      
      // Refresh posts to show the new post
      await fetchPosts(userId)
    } catch (error) {
      console.error('❌ Failed to create post:', error)
      // You can add a toast notification here instead of alert
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-8 h-8 text-dark-400" />
      case 'video': return <Video className="w-8 h-8 text-dark-400" />
      case 'audio': return <Mic className="w-8 h-8 text-dark-400" />
      default: return <File className="w-8 h-8 text-dark-400" />
    }
  }

  const renderMediaPreview = () => {
    if (!uploadedMedia || !uploadedMedia.url) return null

    return (
      <div className="relative group mt-3">
        <div className="relative overflow-hidden rounded-lg flex justify-center bg-dark-800/50 border border-dark-700/50">
          {uploadedMedia.type === 'image' && uploadedMedia.url && (
            <Image
              src={uploadedMedia.url}
              alt={uploadedMedia.name || 'Uploaded image'}
              width={400}
              height={192}
              className="w-auto h-48 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          )}
          {uploadedMedia.type === 'video' && uploadedMedia.url && (
            <video
              src={uploadedMedia.url}
              className="w-auto h-48 object-cover rounded-lg"
              controls
            />
          )}
          {uploadedMedia.type === 'audio' && uploadedMedia.url && (
            <div className="p-6 flex items-center justify-center">
              <audio src={uploadedMedia.url} controls className="w-full" />
            </div>
          )}
          {uploadedMedia.type === 'other' && (
            <div className="p-6 flex items-center justify-center">
              <div className="text-center">
                {getMediaIcon(uploadedMedia.type)}
                <p className="mt-3 text-sm text-dark-400">
                  {uploadedMedia.name || 'Uploaded file'}
                </p>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleRemoveMedia}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const charCount = content.length
  const isOverLimit = charCount > 200
  const canSubmit = (content.trim() || mediaUrl) && !isSubmitting && !isOverLimit

  return (
    <div className="w-full bg-dark-800 backdrop-blur-sm rounded-xl p-5 shadow-xl">
      {/* Text Input */}
      <div className="relative">
        <TextareaAutosize
          minRows={3}
          maxRows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="w-full resize-none bg-dark-700 p-2 rounded-md text-white placeholder-dark-400 text-base leading-relaxed focus:outline-none"
        />
        {/* Character Counter */}
         
          <div className={`absolute bottom-2 right-2 text-xs font-medium px-2 py-1 rounded ${
            isOverLimit 
              ? 'text-red-400 bg-red-900/20' 
              : charCount > 180 
                ? 'text-amber-400 bg-amber-900/20'
                : 'text-dark-400 bg-dark-800/50'
          }`}>
            {charCount}/200
          </div>
        
      </div>

      {/* Hidden Media Upload Component */}
      <MediaUpload
        ref={mediaUploadRef}
        onMediaUploaded={handleMediaUpload}
        onMediaRemoved={handleRemoveMedia}
        userId={userId || ''}
        className="hidden"
      />

      {/* Media Preview */}
      {renderMediaPreview()}

      {/* Divider */}
      <div className="border-t border-dark-700/50 mt-4 pt-4">
        <div className="flex items-center justify-between">
          {/* Media Actions */}
          <div className="flex items-center gap-4">
            {actions.map(({ icon: Icon, label, color, type }) => (
              <button
                key={label}
                onClick={() => mediaUploadRef.current?.openFileDialog()}
                disabled={isSubmitting}
                className={`flex border border-opacity-30 items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-800/50 transition-all duration-200 ${color} ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                title={label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium hidden md:inline">
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              canSubmit
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25'
                : isOverLimit
                  ? 'bg-red-600/50 text-red-300 cursor-not-allowed'
                  : 'bg-dark-700 text-dark-400 cursor-not-allowed'
            }`}
            title={isOverLimit ? 'Message exceeds 200 character limit' : ''}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <SendHorizonal className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Posting...' : 'Snap'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}