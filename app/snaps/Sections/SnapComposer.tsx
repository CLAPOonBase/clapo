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
  CheckCircle,
} from 'lucide-react'
import MediaUpload, { MediaUploadHandle } from '@/app/components/MediaUpload'
import { useSession } from 'next-auth/react'
import { useApi } from '@/app/Context/ApiProvider'
import { usePostToken } from '@/app/hooks/usePostToken'

// Toast Component
const Toast = ({ 
  message, 
  isVisible, 
  onClose 
}: { 
  message: string
  isVisible: boolean
  onClose: () => void 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000) // Auto-dismiss after 3 seconds
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[300px]">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:bg-green-700 rounded p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function SnapComposer() {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | undefined>()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  
  // Token creation parameters
  const [tokenPrice, setTokenPrice] = useState('0.01')
  const [tokenIncrement, setTokenIncrement] = useState('0.01')
  const [freebieCount, setFreebieCount] = useState(100)
  
  const { createPost, fetchPosts } = useApi();
  const { createPostToken, isConnected, connectWallet, isConnecting, address } = usePostToken();
  const { data: session, status } = useSession();
  const { getUserProfile, updateUserProfile } = useApi()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.dbUser?.id) {
        try {
          setLoading(true)
          const profileData = await getUserProfile(session.dbUser.id)
          setProfile(profileData.profile)
        } catch (error) {
          console.error('Failed to fetch profile:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchProfile()
  }, [session?.dbUser?.id, getUserProfile])

  console.log("profile", profile)
  
  const [uploadedMedia, setUploadedMedia] = useState<{
    url: string
    name: string
    type: 'image' | 'video' | 'audio' | 'other'
  } | null>(null)

  const mediaUploadRef = useRef<MediaUploadHandle>(null)
  const userId = session?.dbUser?.id


  React.useEffect(() => {
    console.log('🔍 Session changed:', {
      status,
      session,
      userId,
      sessionDbUser: session?.dbUser
    })
  }, [session, status, userId])

  const actions = [
    { icon: ImageIcon, label: 'Photo', color: 'text-blue-400', type: 'image' as const },
    { icon: Video, label: 'Video', color: 'text-purple-400', type: 'video' as const },
    { icon: File, label: 'File', color: 'text-emerald-400', type: 'any' as const },
    { icon: Mic, label: 'Audio', color: 'text-amber-400', type: 'audio' as const },
  ]

  const showSuccessToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  const handleCloseToast = () => {
    setShowToast(false)
  }

  const handleMediaUpload = (url: string) => {
    setMediaUrl(url)
    
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
      mediaUrl,
      createPostToken: !!createPostToken,
      isConnected
    })
    
    if (!userId) {
      console.error('User ID is missing from session')
      alert('Please log in to create a post')
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

      console.log('🚀 About to call createPost with data:', postData)
      const response = await createPost(postData)
      console.log('✅ createPost completed successfully', response)

      // Always create post token if wallet is connected
      if (isConnected) {
        try {
          console.log('🚀 Creating post token...')
          const postId = response?.post?.id
          console.log('Post ID for token creation:', postId)
          if (postId) {
            const tokenTxHash = await createPostToken(
              postId,
              content.trim(),
              mediaUrl || '',
              tokenPrice,
              tokenIncrement,
              freebieCount
            )
            console.log('✅ Post token created successfully, TX:', tokenTxHash)
            showSuccessToast(`Snap posted and token created! TX: ${tokenTxHash.slice(0, 10)}...`)
          } else {
            console.error('No post ID found in response:', response)
            showSuccessToast('Snap posted but no post ID found for token creation')
          }
        } catch (tokenError) {
          console.error('Failed to create post token:', tokenError)
          showSuccessToast('Snap posted successfully, but token creation failed')
        }
      } else {
        showSuccessToast('Snap posted successfully! (Connect wallet to enable token trading)')
      }

      // Reset form immediately after successful post creation
      setContent('')
      setMediaUrl(undefined)
      setUploadedMedia(null)
      
      // Reset loading state immediately
      setIsSubmitting(false)
      
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
    if (!uploadedMedia || !uploadedMedia.url) return null

    return (
      <div className="relative group mt-3">
        <div className="relative overflow-hidden rounded-lg flex justify-center bg-black/50 border border-dark-700/50">
          {uploadedMedia.type === 'image' && (
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
  const hasContent = content.trim().length > 0
  const canSubmit = (hasContent || mediaUrl) && !isSubmitting && !isOverLimit

  return (
    <>
      {/* Toast Component */}
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={handleCloseToast}
      />
      
      <div className="w-full border-2 border-gray-700/70 shadow-custom backdrop-blur-sm rounded-xl p-2 shadow-xl">
        {/* Text Input */}
         <div className='flex'>
         <div className='rounded-full h-12 w-12'>
       <Image
        src={profile?.avatar_url && profile.avatar_url.trim() !== "" ? profile.avatar_url : "/4.png"}
        alt="profile avatar"
        width={1000}
        height={1000}
        className="w-12 h-12 rounded-full"
      />

         </div>
        <div className="relative w-full">
          <TextareaAutosize
            minRows={1}
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
                : 'text-dark-400 bg-black/50'
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
          userId={userId || ''}
          className="hidden"
        />

        {/* Media Preview */}
        {renderMediaPreview()}

        {/* Wallet Connection Status */}
        <div className="mt-4 p-3 rounded-lg border border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-600/20' : 'bg-gray-600/20'}`}>
                <CheckCircle className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-gray-400'}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  {isConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
                </div>
                <div className="text-xs text-gray-400">
                  {isConnected 
                    ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` 
                    : 'Connect wallet to enable token creation'
                  }
                </div>
              </div>
            </div>
            {!isConnected && (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm rounded-lg transition-colors"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        {/* Token Parameters */}
        {isConnected && (
          <div className="mt-4 p-3 rounded-lg border border-gray-700/50 bg-gray-800/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-blue-600/20 rounded-lg">
                <CheckCircle className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-sm font-medium text-white">Token Parameters</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Starting Price */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Starting Price (USDC)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={tokenPrice}
                  onChange={(e) => setTokenPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.01"
                />
              </div>
              
              {/* Price Increment */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Price Increment (USDC)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={tokenIncrement}
                  onChange={(e) => setTokenIncrement(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.01"
                />
              </div>
              
              {/* Freebie Count */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Free Shares</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={freebieCount}
                  onChange={(e) => setFreebieCount(parseInt(e.target.value) || 100)}
                  className="w-full px-3 py-2 bg-black border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                />
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Price starts at ${tokenPrice} and increases by ${tokenIncrement} per paid buyer. {freebieCount} free shares available.
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-dark-700/50 pt-4">
          <div className="flex items-center justify-between">
            {/* Media Actions */}
            <div className="flex items-center gap-4">
              {actions.map(({ icon: Icon, label, color, type }) => (
                <button
                  key={label}
                  onClick={() => mediaUploadRef.current?.openFileDialog(type)}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/50 transition-all duration-200 ${color} ${
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
    </>
  )
}