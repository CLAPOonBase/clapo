import { MessageCircle, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DMSectionProps {
  dmSection: 'threads' | 'search';
  state: any;
  session: any;
  selectedThread: string | null;
  onSelectThread: (threadId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onStartChat: (user: any) => void;
  unreadCounts?: { [threadId: string]: number }; // New prop for unread counts
  lastMessages?: { [threadId: string]: any }; // New prop for last message info
}

export const DMSection = ({
  dmSection,
  state,
  session,
  selectedThread,
  onSelectThread,
  searchQuery,
  setSearchQuery,
  onStartChat,
  unreadCounts = {},
  lastMessages = {}
}: DMSectionProps) => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [hasInitializedUsers, setHasInitializedUsers] = useState(false);
  const router = useRouter();

  const handleUserClick = (userId: string) => {
    // Store current page state and scroll position
    const currentState = {
      pathname: '/snaps',
      searchParams: 'page=messages',
      scrollY: window.scrollY,
      timestamp: Date.now()
    }
    
    // Store in sessionStorage for persistence across navigation
    sessionStorage.setItem('profileNavigationState', JSON.stringify(currentState))
    
    router.push(`/snaps/profile/${userId}`)
  };

  useEffect(() => {
    if (dmSection === 'search' && !hasInitializedUsers) {
      if (allUsers.length > 0) {
        setSearchResults(allUsers);
        setHasInitializedUsers(true);
      } else {
        fetchAllUsers();
      }
    }
  }, [dmSection, hasInitializedUsers]);

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('https://server.blazeswap.io/api/snaps/users/search?q=');
      const data = await response.json();
      if (data.users) {
        const filteredUsers = data.users.filter((user: any) => user.id !== session?.dbUser?.id);
        setAllUsers(filteredUsers);
        if (dmSection === 'search') {
          setSearchResults(filteredUsers);
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      searchUsers(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(allUsers);
      return;
    }

    try {
      const response = await fetch(
        `https://server.blazeswap.io/api/snaps/users/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (data.users) {
        setSearchResults(
          data.users.filter((user: any) => user.id !== session?.dbUser?.id)
        );
      }
    } catch (error) {
      console.error("Failed to search users:", error);
    }
  };

  const getOtherUser = (thread: any) => {
    if (!thread || !session?.dbUser?.id) return null;
    if (thread.isGroup) return null;
    return thread.participants?.find((p: any) => p.user_id !== session.dbUser.id) || null;
  };

  const formatLastMessageTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than 7 days
      return messageTime.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const truncateMessage = (content: string, maxLength: number = 40) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return dmSection === 'threads' ? (
    <div className="p-4">
      <div className="space-y-2">
        {!state.messageThreads ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">Loading chats...</p>
          </div>
        ) : state.messageThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm text-center">No chats yet<br />Start a conversation!</p>
          </div>
        ) : (
          state.messageThreads?.map((thread: any) => {
            const otherUser = getOtherUser(thread);
            const unreadCount = unreadCounts[thread.id] || 0;
            const lastMessage = lastMessages[thread.id];
            const hasUnread = unreadCount > 0;
            const isSelected = selectedThread === thread.id;
            
            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 text-white shadow-lg' 
                    : hasUnread
                    ? 'bg-gradient-to-r from-green-600/10 to-blue-600/10 border-green-500/30 text-white shadow-md'
                    : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!thread.isGroup && otherUser?.id) {
                        handleUserClick(otherUser.id);
                      }
                    }}
                    className="relative hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600 border-2 border-transparent transition-colors duration-200">
                      {otherUser?.avatar_url ? (
                        <img
                          src={otherUser.avatar_url}
                          alt={otherUser.username || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-white font-bold">
                          {otherUser?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    
                    {/* Online status indicator (you can add online status logic) */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!thread.isGroup && otherUser?.id) {
                            handleUserClick(otherUser.id);
                          }
                        }}
                        className={`font-semibold truncate ${hasUnread ? 'text-white' : ''} hover:underline cursor-pointer ${
                          !thread.isGroup && otherUser?.id ? 'hover:text-blue-300' : ''
                        }`}
                      >
                        {thread.isGroup ? thread.name : otherUser?.username || 'User'}
                      </button>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Timestamp */}
                        {lastMessage && (
                          <span className={`text-xs ${
                            hasUnread ? 'text-green-300' : 'text-slate-500'
                          }`}>
                            {formatLastMessageTime(lastMessage.created_at)}
                          </span>
                        )}
                        
                        {/* Unread count badge */}
                        {hasUnread && (
                          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Last message preview */}
                    {lastMessage && (
                      <div className={`text-sm truncate ${
                        hasUnread ? 'text-slate-200 font-medium' : 'text-slate-400'
                      }`}>
                        {lastMessage.sender_id === session?.dbUser?.id ? 'You: ' : ''}
                        {truncateMessage(lastMessage.content)}
                      </div>
                    )}
                  </div>
                </div>

                {/* New message pulse indicator */}
                {hasUnread && (
                  <div className="absolute inset-0 rounded-xl border-2 border-green-400/20 animate-pulse pointer-events-none"></div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  ) : (
    <div className="p-4">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchUsers(e.target.value);
            }}
            className="w-full pl-12 pr-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        {loadingUsers ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-3"></div>
            <p className="text-sm">Finding users...</p>
          </div>
        ) : searchResults.length > 0 ? (
          searchResults?.map((user: any) => (
            <div
              key={user.id}
              onClick={() => onStartChat(user)}
              className="group p-4 rounded-xl cursor-pointer transition-all duration-200 bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50 hover:border-slate-500/50 hover:shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserClick(user.id);
                  }}
                  className="w-12 h-12 rounded-full overflow-hidden bg-slate-600 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-white font-bold">
                      {user.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
                <div className="flex flex-row justify-between w-full min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(user.id);
                    }}
                    className="font-semibold text-white group-hover:text-blue-300 transition-colors hover:underline cursor-pointer text-left"
                  >
                    {user.username}
                  </button>
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <button className="text-xs bg-green-900 px-2 rounded-md hover:bg-green-800 transition-colors">
                      Add Friend
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Search className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};