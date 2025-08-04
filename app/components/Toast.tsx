import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Bookmark, Heart, Repeat2, MessageCircle } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'like' | 'unlike' | 'retweet' | 'unretweet' | 'bookmark' | 'unbookmark' | 'comment'
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getIcon = () => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'unlike':
        return <Heart className="w-5 h-5 text-gray-400" />
      case 'retweet':
        return <Repeat2 className="w-5 h-5 text-green-500" />
      case 'unretweet':
        return <Repeat2 className="w-5 h-5 text-gray-400" />
      case 'bookmark':
        return <Bookmark className="w-5 h-5 text-purple-500" />
      case 'unbookmark':
        return <Bookmark className="w-5 h-5 text-gray-400" />
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-dark-800 border border-gray-700 rounded-lg p-4 shadow-lg flex items-center space-x-3 min-w-[200px] animate-in slide-in-from-right">
      {getIcon()}
      <span className="text-white font-medium">{message}</span>
    </div>
  )
} 