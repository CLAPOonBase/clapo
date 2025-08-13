"use client"
import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Sidebar from './Sections/Sidebar'
import {SnapComposer} from './Sections/SnapComposer'
import SnapCard from './Sections/SnapCard'
// import ActivityFeed from './Sections/ActivityFeed'
import {ExplorePage} from './SidebarSection/ExplorePage'
import NotificationPage from './SidebarSection/NotificationPage'
import BookmarkPage from './SidebarSection/BookmarkPage' 
import {ProfilePage} from './SidebarSection/ProfilePage'
import SearchPage from './SidebarSection/SearchPage'
import MessagePage from './SidebarSection/MessagePage'
import { mockUsers } from '../lib/mockdata'
import ActivityPage from './SidebarSection/ActivityPage'
import { motion } from 'framer-motion'
import { useApi } from '../Context/ApiProvider'
import { PostSkeleton, LoadingSpinner } from '../components/SkeletonLoader'
import UserActivityFeed from './Sections/ActivityFeed'

export default function SocialFeedPage() {

  const [activeTab, setActiveTab] = useState<'FOR YOU' | 'FOLLOWING'>('FOR YOU')
  const [currentPage, setCurrentPage] = useState<'home' | 'explore' | 'notifications' | 'likes' | 'activity' | 'profile' | 'messages' | 'bookmarks' | 'search'>('home')
  const [followingPosts, setFollowingPosts] = useState<any[]>([])
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false)

  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [retweeted, setRetweeted] = useState<Set<number>>(new Set())
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set())
  const [hasInitializedData, setHasInitializedData] = useState(false)

  const { data: session, status } = useSession()
  const { state, fetchPosts, fetchNotifications, fetchActivities, getFollowingFeed } = useApi()

  useEffect(() => {
    if (status === 'authenticated' && session?.dbUser?.id && !hasInitializedData) {
      fetchPosts(session.dbUser.id)
      fetchNotifications(session.dbUser.id)
      fetchActivities(session.dbUser.id)
      setHasInitializedData(true)
    }
    
    if (status === 'unauthenticated') {
      setHasInitializedData(false)
    }
  }, [session, status, hasInitializedData])

  const loadFollowingFeed = async () => {
    if (!session?.dbUser?.id || isLoadingFollowing) return
    
    setIsLoadingFollowing(true)
    try {
      const response = await getFollowingFeed(session.dbUser.id, 50, 0)
      setFollowingPosts(response.posts || [])
    } catch (error) {
      console.error('Failed to load following feed:', error)
    } finally {
      setIsLoadingFollowing(false)
    }
  }

  const handleTabChange = (tab: 'FOR YOU' | 'FOLLOWING') => {
    setActiveTab(tab)
    if (tab === 'FOLLOWING') {
      loadFollowingFeed()
    }
  }

  const toggleSet = (set: Set<number>, id: number): Set<number> => {
    const newSet = new Set(set)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    return newSet
  }

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
            liked={liked.has(parseInt(allPosts[0].id))}
            bookmarked={bookmarked.has(parseInt(allPosts[0].id))}
            retweeted={retweeted.has(parseInt(allPosts[0].id))}
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
        return <ProfilePage user={mockUsers[0]} posts={[]} />
      case 'search':
        return <SearchPage />
      case 'messages':
        return <MessagePage />
      case 'home':
      default:
        return (
          <>
            <SnapComposer />

            <div className="sticky top-0 pt-4 backdrop-blur-sm">
              <div className="flex justify-around space-x-8 bg-dark-800 rounded-md pt-4">
                {['FOR YOU', 'FOLLOWING'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab as 'FOR YOU' | 'FOLLOWING')}
                    className={`pb-2 font-semibold ${
                      activeTab === tab ? 'text-white w-full border-b-4 border-orange-500' : 'text-gray-400 w-full hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              {activeTab === 'FOR YOU' ? (
                state.posts.loading ? (
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
                      liked={liked.has(parseInt(post.id))}
                      bookmarked={bookmarked.has(parseInt(post.id))}
                      retweeted={retweeted.has(parseInt(post.id))}
                      onLike={(id) => setLiked(toggleSet(liked, typeof id === 'string' ? parseInt(id) : id))}
                      onBookmark={(id) => setBookmarked(toggleSet(bookmarked, typeof id === 'string' ? parseInt(id) : id))}
                      onRetweet={(id) => setRetweeted(toggleSet(retweeted, typeof id === 'string' ? parseInt(id) : id))}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {status === 'authenticated' ? 'No posts yet. Be the first to share something!' : 'Sign in to see posts'}
                  </div>
                )
              ) : (
                isLoadingFollowing ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <PostSkeleton key={i} />
                    ))}
                  </div>
                ) : followingPosts.length > 0 ? (
                  followingPosts.map((post) => (
                    <SnapCard
                      key={post.id}
                      post={post}
                      liked={liked.has(parseInt(post.id))}
                      bookmarked={bookmarked.has(parseInt(post.id))}
                      retweeted={retweeted.has(parseInt(post.id))}
                      onLike={(id) => setLiked(toggleSet(liked, typeof id === 'string' ? parseInt(id) : id))}
                      onBookmark={(id) => setBookmarked(toggleSet(bookmarked, typeof id === 'string' ? parseInt(id) : id))}
                      onRetweet={(id) => setRetweeted(toggleSet(retweeted, typeof id === 'string' ? parseInt(id) : id))}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {status === 'authenticated' ? 'No posts from people you follow yet. Try following some users!' : 'Sign in to see posts'}
                  </div>
                )
              )}
            </div>
          </>
        )
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="w-12 h-12" />
      </div>
    )
  }

  // Don't render main content if session is not authenticated or dbUser is not loaded
  if (status === 'unauthenticated' || !session?.dbUser) {
    console.log('🔍 Session state:', { status, hasSession: !!session, hasDbUser: !!session?.dbUser });
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex-col md:flex-row mx-auto text-white flex">
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <div className="flex-1 m-4 md:m-0 rounded-md">
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
          </div>
        </div>
      </motion.div>
    )
  }

  console.log('🔍 Rendering main content with dbUser:', session?.dbUser);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className=" flex-col md:flex-row mx-auto text-white flex">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div className="flex-1 m-4 md:m-0 rounded-md">
          {renderContent()}
        </div>
        {currentPage !== 'messages' && session?.dbUser && (
          <div className="w-[300px] md:block hidden">
            <UserActivityFeed username={session.dbUser.username} activity={[]} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
