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
    activity_type: 'sale',
    created_at: '2024-08-25T13:45:00Z',
    item_name: 'TWILIGHT SKY',
    quantity: 21,
    price: 210.17,
    user: 'IAMTITAN',
    avatar: "https://robohash.org/iamtitan.png?size=500x500"
  },
  {
    activity_type: 'sale',
    created_at: '2024-08-25T12:20:00Z',
    item_name: 'TWILIGHT SKY',
    quantity: 21,
    price: 210.17,
    user: 'IAMTITAN',
    avatar: "https://robohash.org/iamtitan.png?size=500x500"
  },
  {
    activity_type: 'sale',
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
  switch (type) {
    case 'sale':
      return (
        <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 mt-1"></div>
      )
    case 'purchase':
      return (
        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
      )
    case 'upload':
      return (
        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
      )
    case 'bid':
      return (
        <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0 mt-1"></div>
      )
    default:
      return (
        <div className="w-3 h-3 bg-gray-500 rounded-full flex-shrink-0 mt-1"></div>
      )
  }
}

const getActivityText = (item: ActivityItem) => {
  switch (item.activity_type) {
    case 'sale':
      return `SOLD ${item.quantity} SNAPS OF ${item.item_name}`
    case 'purchase':
      return `BOUGHT ${item.quantity} SNAPS OF ${item.item_name}`
    case 'upload':
      return `UPLOADED ${item.quantity} SNAPS OF ${item.item_name}`
    case 'bid':
      return `BID ON ${item.quantity} SNAPS OF ${item.item_name}`
    default:
      return `INTERACTED WITH ${item.item_name}`
  }
}

export default function UserActivityFeed({ username, activity }: UserActivityFeedProps) {
  const displayActivity = activity && activity.length > 0 ? activity : fakeActivity

  return (
    <div className="text-white">
      {/* Activity List */}
      <div className="max-h-72 overflow-y-auto">
        {displayActivity.map((activityItem, index) => (
          <div 
            key={index} 
            className="flex items-start p-4 hover:bg-gray-800 transition-colors"
          >
            <img 
              src={activityItem.avatar} 
              alt={activityItem.user}
              className="w-8 h-8 rounded-full mr-3 flex-shrink-0"
            />
            <div className="flex-1">
              <div className="text-xs font-medium text-white mb-1">
                {activityItem.user}
              </div>
              <div className="text-xs text-gray-300 mb-1">
                {getActivityText(activityItem)}
              </div>
              <div className="flex items-center">
                {getActivityIcon(activityItem.activity_type)}
                <div className="text-xs font-semibold text-green-400 ml-2">
                  FOR ${activityItem.price.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      
    </div>
  )
}
