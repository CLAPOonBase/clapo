'use client'

import { Skeleton } from './ui/skeleton'

// Skeleton for post cards
export function PostSkeleton() {
  return (
    <div className="bg-dark-800 my-4 rounded-md p-4 animate-pulse">
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0"></div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-4 bg-gray-700 rounded w-20"></div>
            <div className="h-4 bg-gray-700 rounded w-16"></div>
            <div className="h-4 bg-gray-700 rounded w-12"></div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="flex justify-between">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-8"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-8"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-8"></div>
              </div>
            </div>
            <div className="w-5 h-5 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton for user profile
export function ProfileSkeleton() {
  return (
    <div className="bg-dark-800 rounded-md p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      </div>
    </div>
  )
}

// Skeleton for activity feed
export function ActivitySkeleton() {
  return (
    <div className="bg-dark-800 rounded-md p-4 animate-pulse">
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton for notifications
export function NotificationSkeleton() {
  return (
    <div className="bg-dark-800 rounded-md p-4 animate-pulse">
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-32 mb-1"></div>
              <div className="h-3 bg-gray-700 rounded w-24"></div>
            </div>
            <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton for search results
export function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-dark-800 rounded-md p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-700 rounded w-24 mb-1"></div>
              <div className="h-4 bg-gray-700 rounded w-32"></div>
            </div>
            <div className="w-20 h-8 bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Skeleton for post composer
export function ComposerSkeleton() {
  return (
    <div className="bg-dark-800 rounded-md my-4 p-4 animate-pulse">
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-20 bg-gray-700 rounded mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-12 h-10 bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="w-20 h-8 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Generic skeleton for any content
export function GenericSkeleton({ className = "h-4 bg-gray-700 rounded" }: { className?: string }) {
  return <div className={`animate-pulse ${className}`}></div>
}

// Loading spinner
export function LoadingSpinner({ size = "w-6 h-6" }: { size?: string }) {
  return (
    <div className={`animate-spin rounded-full border-b-2 border-orange-500 ${size}`}></div>
  )
} 