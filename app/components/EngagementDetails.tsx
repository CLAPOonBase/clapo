import React, { useState } from 'react'

interface EngagementUser {
  user_id: string
  username: string
  avatar_url: string
}

interface EngagementDetailsProps {
  likes?: EngagementUser[]
  retweets?: EngagementUser[]
  bookmarks?: EngagementUser[]
  onClose: () => void
}

export default function EngagementDetails({ likes, retweets, bookmarks, onClose }: EngagementDetailsProps) {
  const [activeTab, setActiveTab] = useState<'likes' | 'retweets' | 'bookmarks'>('likes')

  const tabs = [
    { id: 'likes', label: 'Likes', count: likes?.length || 0 },
    { id: 'retweets', label: 'Retweets', count: retweets?.length || 0 },
    { id: 'bookmarks', label: 'Bookmarks', count: bookmarks?.length || 0 }
  ]

  const renderUserList = (users: EngagementUser[] | undefined) => {
    if (!users || users.length === 0) {
      return <div className="text-gray-400 text-center py-8">No {activeTab} yet</div>
    }

    return (
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.user_id} className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg">
            <div className="relative w-10 h-10">
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://robohash.org/default.png'
                }}
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">@{user.username}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Engagement Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="p-4 overflow-y-auto max-h-96">
          {activeTab === 'likes' && renderUserList(likes)}
          {activeTab === 'retweets' && renderUserList(retweets)}
          {activeTab === 'bookmarks' && renderUserList(bookmarks)}
        </div>
      </div>
    </div>
  )
} 