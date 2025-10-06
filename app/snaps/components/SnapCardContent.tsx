'use client'
import React from 'react'
import { Post, ApiPost } from '@/app/types'

interface SnapCardContentProps {
  post: Post | ApiPost
}

export default function SnapCardContent({ post }: SnapCardContentProps) {
  const isApiPost = 'user_id' in post
  const content = isApiPost ? post.content : post.content
  const mediaUrl = isApiPost ? post.media_url : post.image

  return (
    <div className="mb-4">
      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
        {content}
      </p>

      {mediaUrl && (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img
            src={mediaUrl}
            alt="Post media"
            className="w-full h-auto object-cover max-h-96"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>
      )}
    </div>
  )
}