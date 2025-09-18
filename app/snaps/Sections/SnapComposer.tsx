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
  Wallet,
} from 'lucide-react'
import MediaUpload, { MediaUploadHandle } from '@/app/components/MediaUpload'
import { useSession } from 'next-auth/react'
import { useApi } from '@/app/Context/ApiProvider'
import { usePostToken } from '@/app/hooks/usePostToken'
import { generatePostTokenUUID } from '@/app/lib/uuid'

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
  
  // Token creation parameters (quadratic pricing system)
  const [freebieCount, setFreebieCount] = useState(100) // Number of free tokens
  const [quadraticDivisor, setQuadraticDivisor] = useState(1) // Price curve steepness (1 = steep, higher = flatter)
  
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

  const showErrorToast = (message: string) => {
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
    
    // Check wallet connection for token creation
    if (!isConnected) {
      try {
        await connectWallet()
        // Continue with post creation after wallet connection
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        alert('Failed to connect wallet. Post will be created without token trading.')
      }
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
            // Generate a unique UUID for the token
            const tokenUuid = generatePostTokenUUID(postId)
            console.log('Generated token UUID:', tokenUuid)
            const tokenTxHash = await createPostToken(
              tokenUuid,
              content.trim(),
              mediaUrl || '',
              freebieCount,
              quadraticDivisor
            )
            console.log('✅ Post token created successfully, TX:', tokenTxHash)
            showSuccessToast(`Snap posted and token created! TX: ${tokenTxHash.slice(0, 10)}...`)
          } else {
            console.error('No post ID found in response:', response)
            showSuccessToast('Snap posted but no post ID found for token creation')
          }
        } catch (tokenError) {
          console.error('Failed to create post token:', tokenError)
          let errorMessage = 'Snap posted successfully, but token creation failed'
          
          if (tokenError.message?.includes('Post with this UUID already exists')) {
            errorMessage = 'Snap posted successfully, but token already exists for this post'
          } else if (tokenError.message?.includes('Insufficient')) {
            errorMessage = 'Snap posted successfully, but insufficient USDC for token creation'
          } else if (tokenError.message?.includes('reverted')) {
            errorMessage = 'Snap posted successfully, but token creation transaction failed'
          }
          
          showErrorToast(errorMessage)
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
  const canClickButton = (hasContent || mediaUrl) && !isSubmitting && !isOverLimit

  // Get button text and styling based on state
  const getSnapButtonContent = () => {
    if (isSubmitting) {
      return {
        text: isConnected ? 'Posting...' : 'Posting...',
        icon: <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />,
        className: 'bg-blue-600/80 text-white cursor-not-allowed'
      }
    }
    
    if (!isConnected) {
      return {
        text: 'Connect & Snap',
        icon: <Wallet className="w-4 h-4" />,
        className: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25'
      }
    }
    
    return {
      text: 'Snap',
      icon: <SendHorizonal className="w-4 h-4" />,
      className: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25'
    }
  }

  const snapButton = getSnapButtonContent()

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
            minRows={2}
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

        {/* Token Parameters - Only show when wallet is connected */}
   

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

            {/* Submit Button - Now handles wallet connection */}
            <button
              onClick={() => {
                console.log('🔍 Submit button clicked!')
                console.log('🔍 Button state:', { canClickButton, content, mediaUrl, isSubmitting, isOverLimit })
                handleSubmit()
              }}
              disabled={!canClickButton}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                canClickButton
                  ? snapButton.className
                  : isOverLimit
                    ? 'bg-red-600/50 text-red-300 cursor-not-allowed'
                    : 'bg-dark-700 text-dark-400 cursor-not-allowed'
              }`}
              title={isOverLimit ? 'Message exceeds 200 character limit' : ''}
            >
              {snapButton.icon}
              <span>{snapButton.text}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}