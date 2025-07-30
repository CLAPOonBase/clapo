"use client"
import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Sidebar from './Sections/Sidebar'
import SnapComposer from './Sections/SnapComposer'
import SnapCard from './Sections/SnapCard'
import ActivityFeed from './Sections/ActivityFeed'
import {ExplorePage} from './SidebarSection/ExplorePage'
import NotificationPage from './SidebarSection/NotificationPage'
import BookmarkPage from './SidebarSection/BookmarkPage' 
import {ProfilePage} from './SidebarSection/ProfilePage'
import SearchPage from './SidebarSection/SearchPage'
import MessagePage from './SidebarSection/MessagePage'
import { Post, ApiPost } from '../types'
import { mockActivity, mockPosts, mockUsers } from '../lib/mockdata'
import ActivityPage from './SidebarSection/ActivityPage'
import { motion } from 'framer-motion'
import { useApi } from '../Context/ApiProvider'
import { PostSkeleton, LoadingSpinner } from '../components/SkeletonLoader'

export default function SocialFeedPage() {

  const [activeTab, setActiveTab] = useState<'FOR YOU' | 'FOLLOWING'>('FOR YOU')
  const [currentPage, setCurrentPage] = useState<'home' | 'explore' | 'notifications' | 'likes' | 'activity' | 'profile' | 'messages' | 'bookmarks' | 'search'>('home')

  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [retweeted, setRetweeted] = useState<Set<number>>(new Set())
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set())

  const { data: session, status } = useSession()
  const { state, fetchPosts, fetchNotifications, fetchActivities } = useApi()

  // Debug logging
  useEffect(() => {
    console.log('🔍 Session Status:', status)
    console.log('🔍 Session Data:', session)
    console.log('🔍 API State:', state)
    console.log('🔍 User Authenticated:', state.user.isAuthenticated)
    console.log('🔍 Current User:', state.user.currentUser)
    console.log('🔍 Posts Count:', state.posts.posts.length)
  }, [session, status, state])

  console.log('for you posts:', state.posts.posts)

  useEffect(() => {
    // Fetch posts when session is available
    if (status === 'authenticated' && session?.dbUserId) {
      console.log('🚀 Fetching posts for user:', session.dbUserId)
      fetchPosts()
      fetchNotifications()
      fetchActivities()
    }
  }, [session, status])

  const toggleSet = (set: Set<number>, id: number): Set<number> => {
    const newSet = new Set(set)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    return newSet
  }

  // Only show API posts, no hardcoded data
  const allPosts = state.posts.posts

  const renderContent = () => {
    switch (currentPage) {
      case 'explore':
        return <ExplorePage />
      case 'notifications':
        return <NotificationPage />
      case 'likes':
        return allPosts.length > 0 ? (
          <SnapCard
            post={allPosts[0]}
            liked={liked.has(typeof allPosts[0].id === 'string' ? parseInt(allPosts[0].id) : allPosts[0].id)}
            bookmarked={bookmarked.has(typeof allPosts[0].id === 'string' ? parseInt(allPosts[0].id) : allPosts[0].id)}
            retweeted={retweeted.has(typeof allPosts[0].id === 'string' ? parseInt(allPosts[0].id) : allPosts[0].id)}
            onLike={(id) => setLiked(toggleSet(liked, typeof id === 'string' ? parseInt(id) : id))}
            onBookmark={(id) => setBookmarked(toggleSet(bookmarked, typeof id === 'string' ? parseInt(id) : id))}
            onRetweet={(id) => setRetweeted(toggleSet(retweeted, typeof id === 'string' ? parseInt(id) : id))}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">No posts available</div>
        )
      case 'bookmarks':
        return <BookmarkPage />
       case 'activity':
        return <ActivityPage />
      case 'profile':
        return <ProfilePage user={state.user.currentUser || mockUsers[0]} posts={allPosts} />
      case 'search':
        return <SearchPage />
      case 'messages':
        return <MessagePage />
      case 'home':
      default:
        return (
          <>
            <div className="sticky top-0 backdrop-blur-sm">
              <div className="flex justify-around space-x-8 bg-dark-800 rounded-md p-4">
                {['FOR YOU', 'FOLLOWING'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'FOR YOU' | 'FOLLOWING')}
                    className={`pb-2 font-semibold ${
                      activeTab === tab ? 'text-white w-full border-b-2 border-orange-500' : 'text-gray-400 w-full hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Show login prompt if not authenticated */}
            {status === 'unauthenticated' && (
              <div className="bg-dark-800 rounded-md p-6 my-4 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Welcome to Snaps!</h3>
                <p className="text-gray-400 mb-4">Sign in to start posting and engaging with others.</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => signIn('twitter')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Sign in with Twitter
                  </button>
                  <button
                    onClick={() => signIn()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Sign in with Email
                  </button>
                </div>
              </div>
            )}

            {status === 'authenticated' && session?.dbUser && (
              <div className="bg-dark-800 rounded-md p-4 my-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={session.dbUser.avatarUrl || 'https://robohash.org/default.png'} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = 'https://robohash.org/default.png';
                    }}
                  />
                  <div>
                    <h3 className="text-white font-semibold">
                      Welcome, {session.dbUser.username || 'User'}!
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {session.dbUser.bio || 'No bio available'}
                    </p>
                    {!session.dbUser.avatarUrl && (
                      <button
                        onClick={() => {
                          if (session.dbUserId) {
                            window.location.reload();
                          }
                        }}
                        className="text-blue-400 hover:text-blue-300 text-xs mt-1"
                      >
                        Refresh Profile Data
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (session.dbUserId) {
                          testUserProfile(session.dbUserId);
                        }
                      }}
                      className="text-green-400 hover:text-green-300 text-xs mt-1 ml-2"
                    >
                      Test API Response
                    </button>
                    <button
                      onClick={() => {
                        fixAvatarUrl();
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-xs mt-1 ml-2"
                    >
                      Fix Avatar URL
                    </button>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="ml-auto text-gray-400 hover:text-white text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {status === 'authenticated' && session?.twitterData && !session?.dbUser && (
              <div className="bg-blue-900/20 border border-blue-500/50 rounded-md p-4 my-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={session.twitterData.avatarUrl || 'https://robohash.org/default.png'} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = 'https://robohash.org/default.png';
                    }}
                  />
                  <div>
                    <h3 className="text-white font-semibold">
                      Welcome, {session.twitterData.username || 'User'}!
                    </h3>
                    <p className="text-blue-300 text-sm">
                      Please set your password to complete your account setup.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <SnapComposer />
            <div>
              {state.posts.loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <PostSkeleton key={i} />
                  ))}
                </div>
              ) : allPosts.length > 0 ? (
                allPosts.map((post) => (
                  <SnapCard
                    key={post.id}
                    post={post}
                    liked={liked.has(typeof post.id === 'string' ? parseInt(post.id) : post.id)}
                    bookmarked={bookmarked.has(typeof post.id === 'string' ? parseInt(post.id) : post.id)}
                    retweeted={retweeted.has(typeof post.id === 'string' ? parseInt(post.id) : post.id)}
                    onLike={(id) => setLiked(toggleSet(liked, typeof id === 'string' ? parseInt(id) : id))}
                    onBookmark={(id) => setBookmarked(toggleSet(bookmarked, typeof id === 'string' ? parseInt(id) : id))}
                    onRetweet={(id) => setRetweeted(toggleSet(retweeted, typeof id === 'string' ? parseInt(id) : id))}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {status === 'authenticated' ? 'No posts yet. Be the first to share something!' : 'Sign in to see posts'}
                </div>
              )}
            </div>
          </>
        )
    }
  }

  // Show loading spinner while session is loading
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="w-12 h-12" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className=" max-w-7xl flex-col md:flex-row mx-auto text-white flex">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div className="flex-1 m-4 md:m-0 rounded-md">
          {renderContent()}
        </div>
        {currentPage !== 'messages' && (
          <div className="w-[300px] md:block hidden">
            <ActivityFeed items={state.activities} loading={state.posts.loading} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
