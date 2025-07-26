"use client"
import { useState } from 'react'
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
import { Post } from '../types'
import { mockActivity, mockPosts, mockUsers } from '../lib/mockdata'

export default function SocialFeedPage() {

  const [activeTab, setActiveTab] = useState<'FOR YOU' | 'FOLLOWING'>('FOR YOU')
  const [currentPage, setCurrentPage] = useState<'home' | 'explore' | 'notifications' | 'likes' | 'bookmarks' | 'profile' | 'messages' | 'search'>('home')

  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [retweeted, setRetweeted] = useState<Set<number>>(new Set())
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set())

  const toggleSet = (set: Set<number>, id: number): Set<number> => {
    const newSet = new Set(set)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    return newSet
  }

  const posts: Post[] = [
    {
      id: 1,
      author: 'ELON MUSK',
      handle: '@elonmusk',
      time: '2h',
      content: 'AI CAN SOLVE HUMANITY PROBLEMS. THE TIME IS NOW.',
      image: 'https://picsum.photos/seed/picsum/200/300',
      likes: 234,
      retweets: 45,
      comments: 67,
    },
    {
      id: 2,
      author: 'ELON MUSK',
      handle: '@elonmusk',
      time: '4h',
      content: 'CONTROL OF AI MEANS CONTROL OF THE UNIVERSE.',
      image: 'https://picsum.photos/200/300',
      likes: 189,
      retweets: 32,
      comments: 41,
    },
    {
      id: 3,
      author: 'ELON MUSK',
      handle: '@elonmusk',
      time: '6h',
      content: 'SCIENCE IS SLOW. AI IS FAST. ACT NOW.',
      image: 'https://picsum.photos/seed/picsum/200/300',
      likes: 312,
      retweets: 78,
      comments: 92,
    },
  ]


  const renderContent = () => {
    switch (currentPage) {
      case 'explore':
        return <ExplorePage />
      case 'notifications':
        return <NotificationPage />
      case 'likes':
        return <SnapCard
          post={posts[0]}
          liked={liked.has(posts[0].id)}
          bookmarked={bookmarked.has(posts[0].id)}
          retweeted={retweeted.has(posts[0].id)}
          onLike={(id) => setLiked(toggleSet(liked, id))}
          onBookmark={(id) => setBookmarked(toggleSet(bookmarked, id))}
          onRetweet={(id) => setRetweeted(toggleSet(retweeted, id))}
        />
      case 'bookmarks':
        return <BookmarkPage />
      case 'profile':
        return <ProfilePage user={mockUsers[0]} posts={mockPosts} />
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
            <SnapComposer />
            <div>
              {posts.map((post) => (
                <SnapCard
                  key={post.id}
                  post={post}
                  liked={liked.has(post.id)}
                  bookmarked={bookmarked.has(post.id)}
                  retweeted={retweeted.has(post.id)}
                  onLike={(id) => setLiked(toggleSet(liked, id))}
                  onBookmark={(id) => setBookmarked(toggleSet(bookmarked, id))}
                  onRetweet={(id) => setRetweeted(toggleSet(retweeted, id))}
                />
              ))}
            </div>
          </>
        )
    }
  }

  return (
    <div className=" max-w-7xl mx-auto text-white flex">
      <Sidebar setCurrentPage={setCurrentPage} />
      <div className="flex-1 rounded-md">
        {renderContent()}
      </div>
   {currentPage !== 'messages' && (
  <div className="w-[300px]">
    <ActivityFeed items={mockActivity} />
  </div>
)}


    </div>
  )
}
