"use client"
import { useState } from 'react'
import Image from 'next/image'
import { MessageCircle, Repeat2, Heart, Share, Bookmark, MoreHorizontal, X } from 'lucide-react'
import { Post } from '@/app/types'

type Props = {
  post: Post
  liked: boolean
  bookmarked: boolean
  retweeted: boolean
  onLike: (id: number) => void
  onRetweet: (id: number) => void
  onBookmark: (id: number) => void
}

export default function SnapCard({ post, liked, bookmarked, retweeted, onLike, onRetweet, onBookmark }: Props) {
  const [showImageModal, setShowImageModal] = useState(false)

  return (
    <>
      <div className="bg-dark-800 my-4 rounded-md p-4">
        <div className="flex space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">EM</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-bold">{post.author}</span>
              <span className="text-gray-500">{post.handle}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">{post.time}</span>
              <div className="ml-auto">
                <MoreHorizontal className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer" />
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-3">{post.content}</p>
            {post.image && (
              <div className="mb-3 cursor-pointer" onClick={() => setShowImageModal(true)}>
                <Image
                  src={post.image}
                  alt="Post media"
                  width={600}
                  height={300}
                  className="rounded-2xl w-full h-64 object-cover"
                />
              </div>
            )}
            <div className='flex justify-between text-secondary'>

  <div className="flex items-center space-x-4 text-gray-500">
              <button className="flex items-center space-x-2 hover:text-blue-500" onClick={() => {}}>
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.comments}</span>
              </button>
              <button className={`flex items-center space-x-2 hover:text-green-500 ${retweeted ? 'text-green-500' : ''}`} onClick={() => onRetweet(post.id)}>
                <Repeat2 className="w-5 h-5" />
                <span className="text-sm">{post.retweets + (retweeted ? 1 : 0)}</span>
              </button>
              <button className={`flex items-center space-x-2 hover:text-red-500 ${liked ? 'text-red-500' : ''}`} onClick={() => onLike(post.id)}>
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span className="text-sm">{post.likes + (liked ? 1 : 0)}</span>
              </button>
            
              <button className="hover:text-blue-500">
                <Share className="w-5 h-5" />
              </button>
            </div>
              <button className={`hover:text-blue-500 ${bookmarked ? 'text-blue-500' : ''}`} onClick={() => onBookmark(post.id)}>
                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          
          </div>
        </div>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="relative w-auto h-56 p-4">
            <button
              className="absolute top-2 right-2 text-white hover:text-red-500"
              onClick={() => setShowImageModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <Image
              src={post.image||""}
              alt="Enlarged post image"
              width={1000}
              height={600}
              className="rounded-xl w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
