"use client"

import { useState, useEffect } from "react"
import { User, Post } from "@/app/types"
import { Ellipsis } from "lucide-react"
import { useSession } from "next-auth/react"
import { useApi } from "../../Context/ApiProvider"

type Props = {
  user?: User
  posts: Post[]
}

type Tab = "Posts" | "Activity"

export function ProfilePage({ user, posts }: Props) {
  const { data: session } = useSession()
  const { getUserProfile } = useApi()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("Posts")

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
      <div className="text-white bg-dark-800 rounded-md p-6">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-700 rounded-md mb-4"></div>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-white bg-dark-800 rounded-md p-6">
        <p>Failed to load profile</p>
      </div>
    )
  }

  return (
    <div className="text-white bg-dark-800 rounded-md">
      <div className="relative h-48 w-full">
        <img
          src="/default-cover.jpg"
          alt="Cover"
          className="w-full h-full object-cover bg-black rounded-md"
        />
      </div>
      <div className="relative px-4 -mt-14 flex items-end space-x-4">
        <div className="relative">
          <img
            src={profile.avatar_url || "https://robohash.org/default.png"}
            alt={profile.username}
            className="w-24 h-24 rounded-full border-4 border-dark-900 object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://robohash.org/default.png"
            }}
          />
        </div>

        <div className="flex-1 flex justify-between items-end">
          <div className="flex gap-2">
            <button className="text-[#E4761B] bg-white rounded px-3 py-1 text-xs font-bold hover:text-white hover:bg-[#E4761B] transition">
              Buy Ticket
            </button>
            <button className="bg-[#23272B] text-primary rounded px-3 py-1 text-xs font-bold">
              Edit Profile
            </button>
            <Ellipsis className="text-gray-400 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold text-white">{profile.username}</h2>
        <p className="text-gray-400 text-sm">@{profile.username}</p>
                            <p className="text-gray-400 text-xs mt-1">{profile.bio || 'No bio available'}</p>
      </div>

      <div className="mt-6">
        <div className="flex justify-around space-x-4 bg-dark-800 p-2 border-b border-secondary">
          {(["Posts", "Activity"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4">
          {activeTab === "Posts" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">User Posts</h3>
              {profile.posts && profile.posts.length > 0 ? (
                <div className="space-y-4">
                  {profile.posts.map((post: any) => (
                    <div key={post.id} className="bg-dark-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={profile.avatar_url || "https://robohash.org/default.png"}
                          alt={profile.username}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://robohash.org/default.png"
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-white">{profile.username}</span>
                            <span className="text-gray-400 text-sm">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                            {post.is_retweet && (
                              <span className="text-green-500 text-sm">🔁 Retweeted</span>
                            )}
                  </div>
                          <p className="text-white mb-3">{post.content}</p>
                          
                          {/* Media content */}
                          {post.media_url && (
                            <div className="mb-3 rounded-lg overflow-hidden">
                              {post.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img
                                  src={post.media_url}
                                  alt="Post media"
                                  className="w-full max-h-96 object-cover rounded-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                  }}
                                />
                              ) : post.media_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                <video
                                  src={post.media_url}
                                  controls
                                  className="w-full max-h-96 rounded-lg"
                                />
                              ) : post.media_url.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
                                <div className="bg-gray-800 rounded-lg p-4">
                                  <audio
                                    src={post.media_url}
                                    controls
                                    className="w-full"
                                  />
                                </div>
                              ) : (
                                <div className="bg-gray-800 rounded-lg p-4 text-center">
                                  <p className="text-gray-400 text-sm">Media file</p>
                                  <a
                                    href={post.media_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 text-sm"
                                  >
                                    View media
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {post.original_post_content && (
                            <div className="bg-dark-800 rounded p-3 mb-3">
                              <p className="text-gray-300 text-sm">
                                <span className="text-gray-400">Original by @{post.original_post_username}:</span> {post.original_post_content}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <span>👁️ {post.view_count}</span>
                            <span>❤️ {post.like_count}</span>
                            <span>💬 {post.comment_count}</span>
                            <span>🔄 {post.retweet_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No posts yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Activity" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              {profile.recent_activity && profile.recent_activity.length > 0 ? (
                <div className="space-y-4">
                  {profile.recent_activity.map((activity: any, index: number) => (
                    <div key={index} className="bg-dark-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                          {activity.activity_type === 'like' && <span className="text-white">❤️</span>}
                          {activity.activity_type === 'comment' && <span className="text-white">💬</span>}
                          {activity.activity_type === 'retweet' && <span className="text-white">🔄</span>}
                          {activity.activity_type === 'post_created' && <span className="text-white">📝</span>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-white">
                              {activity.activity_type === 'like' && 'Liked a post'}
                              {activity.activity_type === 'comment' && 'Commented on a post'}
                              {activity.activity_type === 'retweet' && 'Retweeted a post'}
                              {activity.activity_type === 'post_created' && 'Created a post'}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{activity.post_content}</p>
                        </div>
                      </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No recent activity</p>
              </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center mt-6">
            <div className="bg-dark-700 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{profile.total_posts || 0}</div>
              <div className="text-sm text-gray-400">Posts</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-500">{profile.total_likes_given || 0}</div>
              <div className="text-sm text-gray-400">Likes</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-500">{profile.total_comments_made || 0}</div>
              <div className="text-sm text-gray-400">Comments</div>
                  </div>
            <div className="bg-dark-700 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-500">{profile.total_retweets_made || 0}</div>
              <div className="text-sm text-gray-400">Retweets</div>
              </div>
            <div className="bg-dark-700 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-500">{profile.total_bookmarks_made || 0}</div>
              <div className="text-sm text-gray-400">Bookmarks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
