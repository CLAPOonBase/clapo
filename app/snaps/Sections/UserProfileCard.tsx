'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useApi } from '@/app/Context/ApiProvider'

type Props = {
  onManageClick?: () => void
}

export default function UserProfileCard({ onManageClick }: Props) {
  const { data: session } = useSession()
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


  if (loading) {
    return (
    <div className="group my-4 relative rounded-2xl border border-secondary/20 overflow-hidden bg-black transition-all duration-300 hover:shadow-xl hover:border-slate-600 p-4">
        <div className="h-28 bg-black rounded mb-4"></div>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-black rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-black rounded mb-2"></div>
            <div className="h-4 bg-black rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-secondary/20 bg-black p-6 text-white">
        <p>Failed to load profile</p>
      </div>
    )
  }

  const avatarUrl = profile.avatar_url || '/4.png'
  const coverUrl = '/default-cover.jpg'

  return (
    <div className="group my-4 relative rounded-2xl border border-secondary/20 overflow-hidden bg-black transition-all duration-300 hover:shadow-xl hover:border-slate-600">
      {/* Cover */}
      <div className="relative h-28 w-full overflow-hidden">
        <Image
          src="https://pbs.twimg.com/profile_banners/1296970423851077632/1693025431/600x200"
          alt="Cover"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
      </div>

      {/* User Info */}
      <div className="relative p-6 pb-4 pt-0">
        <div className="flex flex-col items-center -mt-10">
          <div className="relative w-20 h-20">
            <Image
              src={avatarUrl}
              alt={profile.username}
              width={80}
              height={80}
              className={`w-20 h-20 border-2 border-dark-900 object-cover ${profile.account_type === 'community' ? 'rounded-md' : 'rounded-full'}`}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement
                target.src = '/4.png'
              }}
            />
          </div>
          <h3 className="text-white font-bold text-sm mt-3">{profile.username}</h3>
          <p className="text-xs text-gray-400">@{profile.username}</p>
          <p className="text-xs text-gray-400 mt-1">{profile.bio || 'No bio available'}</p>
        </div>
      </div>

    </div>
  )
}
