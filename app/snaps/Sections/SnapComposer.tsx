'use client'

import React, { useState, useRef, useEffect } from 'react'
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
  
  console.log('🔍 SnapComposer Debug:', {
    createPost: typeof createPost,
    fetchPosts: typeof fetchPosts,
    session,
    status,
    sessionDbUser: session?.dbUser,
    sessionDbUserId: session?.dbUser?.id,
    userId: session?.dbUser?.id
  })
  
  const [uploadedMedia, setUploadedMedia] = useState<{
    url: string
    name: string
    type: 'image' | 'video' | 'audio' | 'other'
  } | null>(null)

  const mediaUploadRef = useRef<MediaUploadHandle>(null)
  const userId = session?.dbUser?.id

  // Add useEffect to monitor session changes
  React.useEffect(() => {
    console.log('🔍 Session changed:', {
      status,
      session,
      userId,
      sessionDbUser: session?.dbUser
    })
  }, [session, status, userId])

  const actions = [
    { icon: ImageIcon, label: 'Photo', color: 'text-blue-400', type: 'image' },
    { icon: Video, label: 'Video', color: 'text-purple-400', type: 'video' },
    { icon: File, label: 'File', color: 'text-emerald-400', type: 'any' },
    { icon: Mic, label: 'Audio', color: 'text-amber-400', type: 'audio' },
  ]
  const handleMediaUpload = (url: string) => {
    // Now we get a permanent S3 URL, so we can use it directly
    setMediaUrl(url)
    
    // Extract file type from the URL or set a default
    const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i)
    const isAudio = url.match(/\.(mp3|wav|ogg|m4a)$/i)
    
    let mediaType: 'image' | 'video' | 'audio' | 'other' = 'other'
    if (isImage) mediaType = 'image'
    else if (isVideo) mediaType = 'video'
    else if (isAudio) mediaType = 'audio'

    setUploadedMedia({
      url,
      name: 'uploaded-file',
      type: mediaType,
    })
  }

  const handleRemoveMedia = () => {
    setMediaUrl(undefined)
    setUploadedMedia(null)
  }

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit function called!')
    
    // Check if there's any content or media
    if (!hasContent && !mediaUrl) {
      alert('Please add some content or media before posting')
      return
    }
    
    console.log('🔍 Submit Debug:', {
      session,
      sessionDbUser: session?.dbUser,
      sessionDbUserId: session?.dbUser?.id,
      userId,
      content: content.trim(),
      mediaUrl
    })
    
    if (!userId) {
      console.error('User ID is missing from session')
      alert('Please log in to create a post')
      return
    }

    setIsSubmitting(true)

    try {
      const postData = {
        userId,
        content: content.trim(),
        mediaUrl,
        parentPostId: undefined,
        isRetweet: false,
        retweetRefId: undefined,
      }

      console.log('🚀 About to call createPost with data:', postData)
      await createPost(postData)
      console.log('✅ createPost completed successfully')

      // Reset form immediately after successful post creation
      setContent('')
      setMediaUrl(undefined)
      setUploadedMedia(null)
      
      // Reset loading state immediately
      setIsSubmitting(false)
      
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Post created successfully!')
      }
      
      // Fetch posts in background (don't wait for it)
      fetchPosts(userId).catch(error => {
        console.error('Failed to fetch posts after creation:', error)
      })
      
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('Failed to create post. Please try again.')
      // Reset loading state on error
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
    if (!uploadedMedia) return null

    return (
      <div className="relative group mt-3">
        <div className="relative overflow-hidden rounded-lg flex justify-center bg-dark-800/50 border border-dark-700/50">
          {uploadedMedia.type === 'image' && (
            <Image
              src={uploadedMedia.url}
              alt={uploadedMedia.name}
              width={400}
              height={192}
              className="w-auto h-48 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          )}
          {uploadedMedia.type === 'video' && (
            <video
              src={uploadedMedia.url}
              className="w-auto h-48 object-cover rounded-lg"
              controls
            />
          )}
          {uploadedMedia.type === 'audio' && (
            <div className="p-6 flex items-center justify-center">
              <audio src={uploadedMedia.url} controls className="w-full" />
            </div>
          )}
          {uploadedMedia.type === 'other' && (
            <div className="p-6 flex items-center justify-center">
              <div className="text-center">
                {getMediaIcon(uploadedMedia.type)}
                <p className="mt-3 text-sm text-dark-400">
                  {uploadedMedia.name}
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
  const hasContent = content.trim().length > 0
  const canSubmit = (hasContent || mediaUrl) && !isSubmitting && !isOverLimit

  console.log('🔍 Submit Button Debug:', {
    content: content,
    contentTrimmed: content.trim(),
    contentTrimmedLength: content.trim().length,
    hasContent,
    mediaUrl,
    isSubmitting,
    isOverLimit,
    charCount,
    canSubmit
  })

  return (
    <div className="w-full bg-dark-800 backdrop-blur-sm rounded-xl p-5 shadow-xl">
      {/* Text Input */}
       <div className='flex'>
       <div className='rounded-full h-14 w-14'>
       <Image
  src={session?.dbUser?.avatar_url || session?.user?.image || '/4.png'}
  alt=""
  width={1000}
  height={1000}
  className="w-12 h-12 rounded-full "
/>

       </div>
      <div className="relative w-full ">
        <TextareaAutosize
          minRows={3}
          maxRows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="w-full resize-none bg-transparent p-2 rounded-md text-white placeholder-dark-400 text-base leading-relaxed focus:outline-none"
        />
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
     </div>

      {/* Hidden Media Upload Component */}
      <MediaUpload
        ref={mediaUploadRef}
        onMediaUploaded={handleMediaUpload}
        onMediaRemoved={handleRemoveMedia}
        userId={userId}
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
                // className={`flex items-center gap-2 px-3 py-2 rounded-lg ${color} ${
                className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-800/50 transition-all duration-200 ${color} ${
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
            onClick={() => {
              console.log('🔍 Submit button clicked!')
              console.log('🔍 Button state:', { canSubmit, content, mediaUrl, isSubmitting, isOverLimit })
              handleSubmit()
            }}
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