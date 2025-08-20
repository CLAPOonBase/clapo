// components/UserActivityFeed.tsx

import React from 'react'

interface ActivityItem {
  activity_type: 'like' | 'comment' | 'retweet' | 'post_created'
  created_at: string
  post_content: string
  post_id: string
}

interface UserActivityFeedProps {
  username: string
  activity: ActivityItem[]
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'like':
      return (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5..." />
        </svg>
      )
    case 'comment':
      return (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01..." />
        </svg>
      )
    case 'retweet':
      return (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23 4v6h-6M1 20v-6h6..." />
        </svg>
      )
    case 'post_created':
      return (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2..." />
        </svg>
      )
    default:
      return null
  }
}

const getActivityText = (type: string) => {
  switch (type) {
    case 'like':
      return 'liked a post'
    case 'comment':
      return 'commented on a post'
    case 'retweet':
      return 'retweeted a post'
    case 'post_created':
      return 'created a post'
    default:
      return 'interacted with a post'
  }
}

export default function UserActivityFeed({ username, activity }: UserActivityFeedProps) {
  if (!activity || activity.length === 0) {
    return (
      <div 
      style={{
  boxShadow:
    "0px 1px 0.5px 0px rgba(255, 255, 255, 0.5) inset, 0px 1px 2px 0px rgba(26, 26, 26, 0.7), 0px 0px 0px 1px #1a1a1a",
  // borderRadius: "8px",
}}
      className="text-center py-8 min-h-96 mx-4 rounded-2xl bg-dark-800 text-gray-500 sticky top-20">
        <p>No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sticky top-20">
      {activity.map((activityItem, index) => (
        <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 mt-1">{getActivityIcon(activityItem.activity_type)}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-gray-900">@{username}</span>
              <span className="text-gray-500 text-sm">{getActivityText(activityItem.activity_type)}</span>
              <span className="text-gray-400 text-sm">{formatDate(activityItem.created_at)}</span>
            </div>
            <p className="text-gray-600 text-sm">{activityItem.post_content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
