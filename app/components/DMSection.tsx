import { MessageCircle, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DMSectionProps {
  state: any;
  session: any;
  selectedThread: string | null;
  onSelectThread: (threadId: string) => void;
  onStartChat: (user: any) => void;
  unreadCounts?: { [threadId: string]: number };
  lastMessages?: { [threadId: string]: any };
}

export const DMSection = ({
  state,
  session,
  selectedThread,
  onSelectThread,
  onStartChat,
  unreadCounts = {},
  lastMessages = {}
}: DMSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [friends, setFriends] = useState<Set<string>>(new Set());
  const router = useRouter();

  const handleUserClick = (userId: string) => {
    const currentState = {
      pathname: '/snaps',
      searchParams: 'page=messages',
      scrollY: window.scrollY,
      timestamp: Date.now()
    };
    sessionStorage.setItem('profileNavigationState', JSON.stringify(currentState));
    router.push(`/snaps/profile/${userId}`);
  };

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('https://server.blazeswap.io/api/snaps/friends');
        const data = await response.json();
        if (data.friends) {
          const friendIds = new Set(data.friends.map((friend: any) => friend.id));
          setFriends(friendIds);
        }
      } catch (error) {
        console.error('Failed to fetch friends:', error);
      }
    };

    if (session?.dbUser?.id) {
      fetchFriends();
    }
  }, [session?.dbUser?.id]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setLoadingSearch(true);
    setShowSearchResults(true);
    try {
      const response = await fetch(
        `https://server.blazeswap.io/api/snaps/users/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (data.users) {
        const filteredUsers = data.users.filter((user: any) => user.id !== session?.dbUser?.id);
        setSearchResults(filteredUsers);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
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
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffInHours < 168) return messageTime.toLocaleDateString([], { weekday: 'short' });
    return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const truncateMessage = (content: string, maxLength: number = 40) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleAddFriend = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch('https://server.blazeswap.io/api/snaps/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: userId })
      });
      if (response.ok) {
        setFriends(prev => new Set(prev.add(userId)));
      }
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };

  // Unified User Search Card Component
  const UserSearchCard = ({ user }: { user: any }) => {
    const isFriend = friends.has(user.id);
    
    return (
      <div
        onClick={() => onStartChat(user)}
        className="w-full p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-white cursor-pointer transition-all duration-200"
      >
        {/* Header Section */}
        <div className="flex items-center space-x-3 mb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUserClick(user.id);
            }}
            className="w-12 h-12 rounded-full overflow-hidden bg-slate-600 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username || 'User'} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-white font-bold text-lg">
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUserClick(user.id);
              }}
              className="font-semibold text-white hover:text-blue-300 transition-colors hover:underline cursor-pointer text-left truncate block"
            >
              {user.username}
            </button>
            <div className="text-sm text-slate-400 line-clamp-2 leading-tight">{user.bio || 'No bio available'}</div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Click to start conversation
          </div>
          
          {/* Action Button */}
          {!isFriend && (
            <button
              onClick={(e) => handleAddFriend(user.id, e)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all duration-200 min-w-[100px]"
            >
              Add Friend
            </button>
          )}
        </div>
      </div>
    );
  };

  // Unified Chat Thread Card Component
  const ChatThreadCard = ({ thread }: { thread: any }) => {
    const otherUser = getOtherUser(thread);
    const unreadCount = unreadCounts[thread.id] || 0;
    const lastMessage = lastMessages[thread.id];
    const hasUnread = unreadCount > 0;
    const isSelected = selectedThread === thread.id;

    return (
      <div
        onClick={() => onSelectThread(thread.id)}
        className={`w-full px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 border ${
          isSelected
            ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 text-white shadow-lg'
            : ' border-none text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-white'
        }`}
      >
        {/* Header Section */}
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!thread.isGroup && otherUser?.id) handleUserClick(otherUser.id);
            }}
            className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-600 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            {otherUser?.avatar_url ? (
              <img src={otherUser.avatar_url} alt={otherUser.username || "User"} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-white font-bold text-lg">
                {otherUser?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            {/* Online Status Indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full"></div>
          </button>
          <div className="flex-1 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!thread.isGroup && otherUser?.id) handleUserClick(otherUser.id);
              }}
              className={`font-semibold truncate block text-left transition-colors ${
                hasUnread ? "text-white" : ""
              } ${!thread.isGroup && otherUser?.id ? "hover:text-blue-300 hover:underline" : ""}`}
            >
              {thread.isGroup ? thread.name : otherUser?.username || "User"}
            </button>
            {lastMessage && (
              <div className={`text-sm truncate leading-tight ${
                hasUnread ? "text-slate-200 font-medium" : "text-slate-400"
              }`}>
                {lastMessage.sender_id === session?.dbUser?.id ? "You: " : ""}
                {truncateMessage(lastMessage.content)}
              </div>
            )}
          </div>
        </div>

        {/* Footer Section */}
      
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="mb-4 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search chats or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {showSearchResults ? (
          <div className="space-y-3">
            {loadingSearch ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-3"></div>
                <p className="text-sm">Searching users...</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user: any) => (
                <UserSearchCard key={user.id} user={user} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Search className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">No users found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
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
              state.messageThreads
                .filter((thread: any) => {
                  if (!searchQuery) return true;
                  const otherUser = getOtherUser(thread);
                  const username = thread.isGroup ? thread.name : otherUser?.username || '';
                  return username.toLowerCase().includes(searchQuery.toLowerCase());
                })
                .map((thread: any) => (
                  <ChatThreadCard key={thread.id} thread={thread} />
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};