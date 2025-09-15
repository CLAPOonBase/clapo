"use client"

import { useState, useEffect } from "react"
import { User, Post } from "@/app/types"
import { Ellipsis, Eye, Heart, MessageCircle, Repeat2, Bookmark, ThumbsUp, FileText } from "lucide-react"
import { useSession } from "next-auth/react"
import { useApi } from "../../Context/ApiProvider"
import { UpdateProfileModal } from "@/app/components/UpdateProfileModal"

type Props = {
  user?: User
  posts: Post[]
}

type Tab = "Posts" | "Activity" | "Followers"

export function ProfilePage({ user, posts }: Props) {
  const { data: session } = useSession()
  const { getUserProfile, updateUserProfile, getUserFollowers, getUserFollowing } = useApi()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("Posts")
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  
  // Follower/Following lists state
  const [followersList, setFollowersList] = useState<any[]>([])
  const [followingList, setFollowingList] = useState<any[]>([])
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false)
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false)
  const [showFollowersList, setShowFollowersList] = useState(false)
  const [showFollowingList, setShowFollowingList] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.dbUser?.id) {
        try {
          setLoading(true)
          const profileData = await getUserProfile(session.dbUser.id)
          console.log('🔍 Profile data from backend:', profileData)
          console.log('🔍 Avatar URL from backend:', profileData.profile?.avatar_url)
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

  const handleUpdateProfile = async (updateData: { username?: string; bio?: string; avatarUrl?: string }) => {
    if (!session?.dbUser?.id) return

    try {
      console.log('🔍 Updating profile with data:', updateData)
      const response = await updateUserProfile(session.dbUser.id, updateData)
      console.log('🔍 Update response:', response)
      
              if (response.profile) {
          console.log('🔍 Setting new profile:', response.profile)
          setProfile(response.profile)
          console.log('🔍 Profile updated successfully')
        }
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  const loadFollowersList = async () => {
    if (isLoadingFollowers || !session?.dbUser?.id) return
    
    setIsLoadingFollowers(true)
    try {
      const response = await getUserFollowers(session.dbUser.id, 100, 0)
      setFollowersList(response?.followers || [])
      setShowFollowersList(true)
    } catch (error) {
      console.error('Failed to load followers:', error)
    } finally {
      setIsLoadingFollowers(false)
    }
  }

  const loadFollowingList = async () => {
    if (isLoadingFollowing || !session?.dbUser?.id) return
    
    setIsLoadingFollowing(true)
    try {
      const response = await getUserFollowing(session.dbUser.id, 100, 0)
      setFollowingList(response?.following || [])
      setShowFollowingList(true)
    } catch (error) {
      console.error('Failed to load following:', error)
    } finally {
      setIsLoadingFollowing(false)
    }
  }

  if (loading) {
    return (
      <div className="text-white bg-black rounded-lg shadow-xl p-4">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-700/50 rounded-lg mb-4"></div>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-700/50 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-700/50 rounded mb-2"></div>
              <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-white bg-black rounded-lg shadow-xl p-4">
        <div className="text-center">
          <p className="text-gray-400">Failed to load profile</p>
        </div>
      </div>
    )
  }
  console.log('🔍 Profile data:', profile)

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'retweet': return <Repeat2 className="w-4 h-4 text-green-500" />
      case 'post_created': return <FileText className="w-4 h-4 text-purple-500" />
      default: return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityText = (activityType: string) => {
    switch (activityType) {
      case 'like': return 'Liked a post'
      case 'comment': return 'Commented on a post'
      case 'retweet': return 'Retweeted a post'
      case 'post_created': return 'Created a post'
      default: return 'Activity'
    }
  }

  return (
    <div className="text-white bg-black border-x-2 border-gray-700/70 rounded-lg shadow-xl overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 w-full bg-gradient-to-r from-blue-600 to-purple-600">
        <img
          src="https://pbs.twimg.com/profile_banners/1296970423851077632/1693025431/600x200"
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Profile Section */}
      <div className="relative px-6 -mt-16 flex items-end space-x-4">
        <div className="relative">
          <img
            src={profile.avatar_url || "https://robohash.org/default.png"}
            alt={profile.username}
            className="w-32 h-32 rounded-full -4 -dark-800 object-cover shadow-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://robohash.org/default.png";
            }}
          />
        </div>

        <div className="flex-1 flex justify-between items-end pb-4">
          <div className="flex gap-3">
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg px-6 py-2 text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg">
              Buy Ticket
            </button>
            <button 
              onClick={() => setShowUpdateModal(true)}
              className="bg-dark-700 hover:bg-dark-600 text-white  -gray-600 rounded-lg px-6 py-2 text-sm font-semibold transition-all duration-200"
            >
              Edit Profile
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all duration-200">
              <Ellipsis className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 pb-6">
        <h1 className="text-2xl font-bold text-white mb-1">{profile.username}</h1>
        <p className="text-gray-400 text-base mb-3">@{profile.username}</p>
        <p className="text-gray-300 text-sm leading-relaxed max-w-2xl mb-4">
          {profile.bio || 'Welcome to my profile! Connect with me and explore my content.'}
        </p>
        
        {/* Followers/Following Section */}
        <div className="flex items-center space-x-6 text-sm">
          <button 
            onClick={loadFollowingList}
            disabled={isLoadingFollowing}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-semibold text-white">{profile.following_count || 0}</span>
            <span className="text-gray-400">Following</span>
          </button>
          <button 
            onClick={loadFollowersList}
            disabled={isLoadingFollowers}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-semibold text-white">{profile.followers_count || 0}</span>
            <span className="text-gray-400">Followers</span>
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-black shadow-custom border-2 border-gray-700/70 p-4 rounded-xl text-center hover:bg-dark-600 transition-colors">
            <div className="text-2xl font-bold text-white mb-1">{profile.total_posts || 0}</div>
            <div className="text-sm text-gray-400 font-medium">Posts</div>
          </div>
          <div className="bg-black shadow-custom border-2 border-gray-700/70 p-4 rounded-xl text-center hover:bg-dark-600 transition-colors">
            <div className="text-2xl font-bold text-red-400 mb-1">{profile.total_likes_given || 0}</div>
            <div className="text-sm text-gray-400 font-medium">Likes</div>
          </div>
          <div className="bg-black shadow-custom border-2 border-gray-700/70 p-4 rounded-xl text-center hover:bg-dark-600 transition-colors">
            <div className="text-2xl font-bold text-blue-400 mb-1">{profile.total_comments_made || 0}</div>
            <div className="text-sm text-gray-400 font-medium">Comments</div>
          </div>
          <div className="bg-black shadow-custom border-2 border-gray-700/70 p-4 rounded-xl text-center hover:bg-dark-600 transition-colors">
            <div className="text-2xl font-bold text-green-400 mb-1">{profile.total_retweets_made || 0}</div>
            <div className="text-sm text-gray-400 font-medium">Retweets</div>
          </div>
          <div className="bg-black shadow-custom border-2 border-gray-700/70 p-4 rounded-xl text-center hover:bg-dark-600 transition-colors">
            <div className="text-2xl font-bold text-purple-400 mb-1">{profile.total_bookmarks_made || 0}</div>
            <div className="text-sm text-gray-400 font-medium">Bookmarks</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="-t -gray-700">
        <div className="flex px-6">
          {(["Posts", "Activity", "Followers"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-8 font-semibold text-sm transition-all duration-200 -b-2 ${
                activeTab === tab
                  ? 'text-white -blue-500' 
                  : 'text-gray-400 hover:text-white -transparent hover:-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "Posts" && (
          <div className="space-y-6">
            {profile.posts && profile.posts.length > 0 ? (
              <div className="space-y-4">
                {profile.posts.map((post: any) => (
                  <div key={post.id} className="bg-dark-700/50 rounded-lg p-4  -gray-700/50 hover:bg-dark-700 transition-all duration-200">
                    <div className="flex items-start space-x-4">
                      <img
                        src={profile.avatar_url || "https://robohash.org/default.png"}
                        alt={profile.username}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://robohash.org/default.png";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="font-semibold text-white">{profile.username}</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(post.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          {post.is_retweet && (
                            <div className="flex items-center space-x-1 text-green-400">
                              <Repeat2 className="w-4 h-4" />
                              <span className="text-sm font-medium">Retweeted</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-white mb-4 leading-relaxed">{post.content}</p>
                        
                        {/* Media content */}
                        {post.media_url && (
                          <div className="mb-4 rounded-lg overflow-hidden  -gray-600">
                            {post.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <img
                                src={post.media_url}
                                alt="Post media"
                                className="w-full max-h-96 object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            ) : post.media_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                              <video
                                src={post.media_url}
                                controls
                                className="w-full max-h-96"
                              />
                            ) : post.media_url.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
                              <div className="bg-dark-600 p-4">
                                <audio
                                  src={post.media_url}
                                  controls
                                  className="w-full"
                                />
                              </div>
                            ) : (
                              <div className="bg-dark-600 p-4 text-center">
                                <p className="text-gray-400 text-sm mb-2">Media file</p>
                                <a
                                  href={post.media_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                >
                                  View media
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {post.original_post_content && (
                          <div className="bg-black  -gray-600 rounded-lg p-4 mb-4">
                            <p className="text-gray-300 text-sm">
                              <span className="text-gray-400 font-medium">Original by @{post.original_post_username}:</span>
                              <br />
                              <span className="mt-1 block">{post.original_post_content}</span>
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.view_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.like_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comment_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Repeat2 className="w-4 h-4" />
                            <span>{post.retweet_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-dark-700 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">No posts yet</p>
                <p className="text-gray-500 text-sm mt-1">Start sharing your thoughts with the world!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "Activity" && (
          <div className="space-y-6">
            {profile.recent_activity && profile.recent_activity.length > 0 ? (
              <div className="space-y-4">
                {profile.recent_activity.map((activity: any, index: number) => (
                  <div key={index} className="bg-dark-700/50 rounded-lg p-4  -gray-700/50 hover:bg-dark-700 transition-all duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-dark-600  -gray-600 flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-semibold text-white">
                            {getActivityText(activity.activity_type)}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {new Date(activity.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{activity.post_content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-dark-700 rounded-full flex items-center justify-center">
                  <ThumbsUp className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">No recent activity</p>
                <p className="text-gray-500 text-sm mt-1">Your interactions will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "Followers" && (
          <div className="space-y-6">
            {/* Followers Section */}
            <div className="bg-dark-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-semibold">Followers ({profile.followers_count || 0})</h3>
                <button
                  onClick={loadFollowersList}
                  disabled={isLoadingFollowers}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors disabled:opacity-50"
                >
                  {isLoadingFollowers ? 'Loading...' : 'View All'}
                </button>
              </div>
              
              {isLoadingFollowers ? (
                <div className="text-center py-8 text-gray-400">Loading followers...</div>
              ) : (
                <div className="space-y-3">
                  {/* Show first 5 followers as preview */}
                  {followersList.slice(0, 5).map((follower: any) => (
                    <div key={follower.follower_id} className="flex items-center space-x-3 p-3 bg-dark-600 rounded-lg">
                      <img
                        src={follower.avatar_url || "https://robohash.org/default.png"}
                        alt={follower.username || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://robohash.org/default.png";
                        }}
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">{follower.username || 'Unknown User'}</div>
                        <div className="text-gray-400 text-sm">{follower.email || ''}</div>
                      </div>
                    </div>
                  ))}
                  
                  {followersList.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No followers yet
                    </div>
                  )}
                  
                  {followersList.length > 5 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={loadFollowersList}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                      >
                        View All {profile.followers_count || 0} Followers
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Following Section */}
            <div className="bg-dark-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-semibold">Following ({profile.following_count || 0})</h3>
                <button
                  onClick={loadFollowingList}
                  disabled={isLoadingFollowing}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors disabled:opacity-50"
                >
                  {isLoadingFollowing ? 'Loading...' : 'View All'}
                </button>
              </div>
              
              {isLoadingFollowing ? (
                <div className="text-center py-8 text-gray-400">Loading following...</div>
              ) : (
                <div className="space-y-3">
                  {/* Show first 5 following as preview */}
                  {followingList.slice(0, 5).map((following: any) => (
                    <div key={following.following_id} className="flex items-center space-x-3 p-3 bg-dark-600 rounded-lg">
                      <img
                        src={following.avatar_url || "https://robohash.org/default.png"}
                        alt={following.username || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://robohash.org/default.png";
                        }}
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">{following.username || 'Unknown User'}</div>
                        <div className="text-gray-400 text-sm">{following.email || ''}</div>
                      </div>
                    </div>
                  ))}
                  
                  {followingList.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      Not following anyone yet
                    </div>
                  )}
                  
                  {followingList.length > 5 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={loadFollowingList}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                      >
                        View All {profile.following_count || 0} Following
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Update Profile Modal */}
      <UpdateProfileModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdateProfile}
        currentProfile={profile}
      />

      {/* Followers List Modal */}
      {showFollowersList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowFollowersList(false)}>
          <div className="bg-black rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Followers</h3>
              <button
                onClick={() => setShowFollowersList(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Ellipsis className="w-5 h-5 rotate-90" />
              </button>
            </div>
            
            {isLoadingFollowers ? (
              <div className="text-center py-4 text-gray-400">Loading...</div>
            ) : followersList.length > 0 ? (
              <div className="space-y-3">
                {followersList.map((follower: any) => (
                  <div key={follower.follower_id} className="flex items-center space-x-3 p-3 bg-dark-700 rounded-lg">
                    <img
                      src={follower.avatar_url || "https://robohash.org/default.png"}
                      alt={follower.username || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://robohash.org/default.png";
                      }}
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{follower.username || 'Unknown User'}</div>
                      <div className="text-gray-400 text-sm">{follower.email || ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">No followers yet</div>
            )}
          </div>
        </div>
      )}

      {/* Following List Modal */}
      {showFollowingList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowFollowingList(false)}>
          <div className="bg-black rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Following</h3>
              <button
                onClick={() => setShowFollowingList(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Ellipsis className="w-5 h-5 rotate-90" />
              </button>
            </div>
            
            {isLoadingFollowing ? (
              <div className="text-center py-4 text-gray-400">Loading...</div>
            ) : followingList.length > 0 ? (
              <div className="space-y-3">
                {followingList.map((following: any) => (
                  <div key={following.following_id} className="flex items-center space-x-3 p-3 bg-dark-700 rounded-lg">
                    <img
                      src={following.avatar_url || "https://robohash.org/default.png"}
                      alt={following.username || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://robohash.org/default.png";
                      }}
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{following.username || 'Unknown User'}</div>
                      <div className="text-gray-400 text-sm">{following.email || ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">Not following anyone yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}