// components/UserActivityFeed.tsx

import React from 'react'

interface ActivityItem {
  activity_type: 'sale' | 'purchase' | 'upload' | 'bid'
  created_at: string
  item_name: string
  quantity: number
  price: number
  user: string
  avatar: string
}

interface UserActivityFeedProps {
  username?: string
  activity?: ActivityItem[]
}

// Fake sales activity data
const fakeActivity: ActivityItem[] = [
  {
    activity_type: 'sale',
    created_at: '2024-08-25T14:30:00Z',
    item_name: 'TWILIGHT SKY',
    quantity: 21,
    price: 210.17,
    user: 'IAMTITAN',
    avatar: "https://robohash.org/iamtitan.png?size=500x500"
  },
  {
    activity_type: 'purchase',
    created_at: '2024-08-25T13:45:00Z',
    item_name: 'TWILIGHT SKY',
    quantity: 21,
    price: 210.17,
    user: 'IAMTITAN',
    avatar: "https://robohash.org/iamtitan.png?size=500x500"
  },
  {
    activity_type: 'upload',
    created_at: '2024-08-25T12:20:00Z',
    item_name: 'TWILIGHT SKY',
    quantity: 21,
    price: 210.17,
    user: 'IAMTITAN',
    avatar: "https://robohash.org/iamtitan.png?size=500x500"
  },
  {
    activity_type: 'bid',
    created_at: '2024-08-25T11:15:00Z',
    item_name: 'GOLDEN HOUR REFLECTION',
    quantity: 15,
    price: 145.50,
    user: 'PHOTOPRO',
    avatar: "https://robohash.org/photopro.png?size=500x500"
  },
  {
    activity_type: 'sale',
    created_at: '2024-08-25T10:30:00Z',
    item_name: 'URBAN NIGHTSCAPE',
    quantity: 8,
    price: 89.99,
    user: 'CITYSHOTS',
    avatar: "https://robohash.org/cityshots.png?size=500x500"
  },
  {
    activity_type: 'sale',
    created_at: '2024-08-25T09:45:00Z',
    item_name: 'MOUNTAIN SUNRISE',
    quantity: 12,
    price: 156.80,
    user: 'NATURELENS',
    avatar: "https://robohash.org/naturelens.png?size=500x500"
  },
  {
    activity_type: 'sale',
    created_at: '2024-08-25T08:20:00Z',
    item_name: 'ABSTRACT PATTERNS',
    quantity: 25,
    price: 312.75,
    user: 'ARTVISUAL',
    avatar: "https://robohash.org/artvisual.png?size=500x500"
  },
  {
    activity_type: 'sale',
    created_at: '2024-08-25T07:10:00Z',
    item_name: 'OCEAN WAVES',
    quantity: 18,
    price: 198.40,
    user: 'SEASCAPES',
    avatar: "https://robohash.org/seascapes.png?size=500x500"
  }
]

const getActivityIcon = (type: string) => {
  return null
}

const getActivityText = (item: ActivityItem) => {
  switch (item.activity_type) {
    case 'sale':
      return (
        <>
          <span className="text-red-400">sold</span>{' '}
          <span className="text-gray-400">{item.quantity}</span>{' '}
          <span className="text-gray-400">snaps of</span>{' '}
          <span className="text-white">{item.item_name}</span>
        </>
      )
    case 'purchase':
      return (
        <>
          <span className="text-green-400">bought</span>{' '}
          <span className="text-gray-400">{item.quantity}</span>{' '}
          <span className="text-gray-400">snaps of</span>{' '}
          <span className="text-white">{item.item_name}</span>
        </>
      )
    case 'upload':
      return (
        <>
          <span className="text-white">uploaded</span>{' '}
          <span className="text-gray-400">{item.quantity}</span>{' '}
          <span className="text-gray-400">snaps of</span>{' '}
          <span className="text-white">{item.item_name}</span>
        </>
      )
    case 'bid':
      return (
        <>
          <span className="text-white">bid on</span>{' '}
          <span className="text-gray-400">{item.quantity}</span>{' '}
          <span className="text-gray-400">snaps of</span>{' '}
          <span className="text-white">{item.item_name}</span>
        </>
      )
    default:
      return (
        <>
          <span className="text-white">interacted with</span>{' '}
          <span className="text-white">{item.item_name}</span>
        </>
      )
  }
}

export default function UserActivityFeed({ username, activity }: UserActivityFeedProps) {
  const displayActivity = activity && activity.length > 0 ? activity : fakeActivity

  return (
    <div className="text-white w-full max-w-lg">
      {/* Activity List */}
      <div className="max-h-72 overflow-y-auto">
        {displayActivity.map((activityItem, index) => (
          <div
            key={index}
            className="flex items-start p-3 hover:bg-gray-800 transition-colors"
          >
            <img
              src={activityItem.avatar}
              alt={activityItem.user}
              className="w-7 h-7 rounded-full mr-2 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white mb-1 truncate">
                {activityItem.user}
              </div>
              <div className="text-sm lowercase mb-1 leading-tight">
                {getActivityText(activityItem)}
              </div>
              <div className="flex items-center lowercase">
                {getActivityIcon(activityItem.activity_type)}
                <div className="text-sm font-semibold">
                  <span className="text-gray-400">for</span>{' '}
                  <span className="text-gray-400">${activityItem.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      
    </div>
  )
}
