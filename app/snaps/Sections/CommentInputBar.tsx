'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'

type CommentInputBarProps = {
  onClick: () => void
}

export default function CommentInputBar({ onClick }: CommentInputBarProps) {
  return (
    <div
      onClick={onClick}
      className="w-full bg-dark-700 hover:bg-dark-600 transition-all duration-200 px-4 py-3 rounded-xl flex items-center space-x-3 cursor-pointer "
    >
      <MessageCircle className="text-gray-400 w-5 h-5" />
      <span className="text-gray-400 text-sm">Write a comment...</span>
    </div>
  )
}
