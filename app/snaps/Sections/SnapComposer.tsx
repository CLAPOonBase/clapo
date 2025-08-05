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
import MediaUpload,{MediaUploadHandle} from '@/app/components/MediaUpload'

// import MediaUpload, { MediaUploadHandle } from '../../components/MediaUpload'

// Dummy helpers – replace with your actual implementations
// import { createPost } from '@/lib/createPost'

// import { fetchPosts } from '@/lib/fetchPosts'
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

  const actions = [
    { icon: ImageIcon, label: 'Photo', color: 'text-green-500', type: 'image' },
    { icon: Video, label: 'Video', color: 'text-pink-500', type: 'video' },
    { icon: File, label: 'File', color: 'text-orange-500', type: 'any' },
    { icon: Mic, label: 'Audio', color: 'text-yellow-500', type: 'audio' },
  ]

  const handleMediaUpload = (url: string) => {
    // Use fetch to determine file type from Blob
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const type = blob.type
        let mediaType: 'image' | 'video' | 'audio' | 'other' = 'other'

        if (type.startsWith('image/')) mediaType = 'image'
        else if (type.startsWith('video/')) mediaType = 'video'
        else if (type.startsWith('audio/')) mediaType = 'audio'

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
      const postData = {
        userId,
        content: content.trim(),
        mediaUrl,
        parentPostId: undefined,
        isRetweet: false,
        retweetRefId: undefined,
      }

      await createPost(postData)

      setContent('')
      setMediaUrl(undefined)
      setUploadedMedia(null)
      // TODO: Replace with your actual toast/notification implementation
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Post created successfully!')
      }
      await fetchPosts(userId)
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderMediaPreview = () => {
    if (!uploadedMedia) return null

    return (
      <div className="relative group">
        <div className="relative overflow-hidden dark:bg-gray-800">
          {uploadedMedia.type === 'image' && (
            <Image
              src={uploadedMedia.url}
              alt={uploadedMedia.name}
              width={400}
              height={192}
              className="w-auto h-48 rounded-lg bg-transparent"
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

  return (
    <div className="w-full rounded-xl border border-dark-800 bg-dark-800 p-4">
     <div className='border border-secondary/20 mb-2 rounded-md p-2 flex items-center justify-center'>
       <TextareaAutosize
        minRows={2}
        maxRows={8}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full resize-none rounded-md border-secondary/20 placeholder:justify-center  appearance-none bg-transparent text-sm text-white placeholder:text-dark-500 focus:outline-none"
      />
     </div>

      <MediaUpload
        ref={mediaUploadRef}
        onMediaUploaded={handleMediaUpload}
        onMediaRemoved={handleRemoveMedia}
        userId={userId}
        className=""
      />

      {renderMediaPreview()}

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {actions.map(({ icon: Icon, label, color, type }) => (
            <button
              key={label}
              onClick={() => mediaUploadRef.current?.openFileDialog(type)}
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-all duration-200 group ${color} ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium hidden sm:inline">
                {label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <SendHorizonal className="w-4 h-4" />
            Snap
          </div>
        </button>
      </div>
    </div>
  )
}
