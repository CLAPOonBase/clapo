import { MessageCircle, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '../Context/ApiProvider';

interface DMSectionProps {
  state: any;
  selectedThread: string | null;
  onSelectThread: (threadId: string) => void;
  onStartChat: (user: any) => void;
  unreadCounts?: { [threadId: string]: number };
  lastMessages?: { [threadId: string]: any };
  currentUserId?: string | null;
}

export const DMSection = ({
  state,
  selectedThread,
  onSelectThread,
  onStartChat,
  unreadCounts = {},
  lastMessages = {},
  currentUserId
}: DMSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [friends, setFriends] = useState<Set<string>>(new Set());
  const [avatarErrors, setAvatarErrors] = useState<Set<string>>(new Set());
  const [followingList, setFollowingList] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { followUser, getUserFollowing } = useApi();

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

  // Fetch following list
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!currentUserId) return;

      try {
        const response = await getUserFollowing(currentUserId, 1000, 0);
        console.log('📋 getUserFollowing response:', response);

        if (response?.following) {
          const followingIds = new Set<string>(
            response.following.map((user: any) => {
              // following_id is the actual user ID being followed, not the relationship ID
              const id = String(user.following_id || user.user_id || user.id);
              console.log('📋 Processing following user:', {
                username: user.username,
                relationshipId: user.id,
                actualUserId: user.following_id,
                extractedId: id
              });
              return id;
            })
          );
          setFollowingList(followingIds);
          console.log('📋 Following list loaded (count):', followingIds.size);
          console.log('📋 Following list IDs:', Array.from(followingIds));
        } else {
          console.log('📋 No following list in response');
        }
      } catch (error) {
        console.error('❌ Failed to fetch following list:', error);
      }
    };

    if (currentUserId) {
      fetchFollowing();
    }
  }, [currentUserId, getUserFollowing]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://server.blazeswap.io/api/snaps';
        const response = await fetch(`${apiUrl}/friends`);
        const data = await response.json();
        if (data.friends) {
          const friendIds = new Set<string>(data.friends.map((friend: any) => String(friend.id)));
          setFriends(friendIds);
        }
      } catch (error) {
        console.error('Failed to fetch friends:', error);
      }
    };

    if (currentUserId) {
      fetchFriends();
    }
  }, [currentUserId]);

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
      console.log('🔍 Searching for users with query:', query);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://server.blazeswap.io/api/snaps';
      const searchUrl = `${apiUrl}/users/search?q=${encodeURIComponent(query)}`;
      console.log('🔍 Search URL:', searchUrl);

      const response = await fetch(searchUrl);
      const data = await response.json();

      console.log('🔍 Search API response:', data);
      console.log('🔍 Current user ID:', currentUserId);

      if (data.users && currentUserId) {
        const filteredUsers = data.users.filter((user: any) =>
          user.id !== currentUserId && user.id !== String(currentUserId)
        );
        console.log('🔍 Filtered users:', filteredUsers.length);
        setSearchResults(filteredUsers);
      } else if (data.users) {
        console.log('🔍 No currentUserId, showing all users:', data.users.length);
        setSearchResults(data.users);
      }
    } catch (error) {
      console.error('❌ Failed to search users:', error);
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
    if (!thread || !currentUserId) {
      console.log('🔍 DMSection getOtherUser: Missing thread or userId', { thread, currentUserId });
      return null;
    }
    if (thread.isGroup) return null;

    const otherUser = thread.participants?.find(
      (p: any) => p.user_id !== currentUserId && p.user_id !== String(currentUserId)
    ) || null;

    console.log('🔍 DMSection getOtherUser result:', {
      threadId: thread.id,
      currentUserId,
      participants: thread.participants,
      otherUser
    });

    return otherUser;
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://server.blazeswap.io/api/snaps';
      const response = await fetch(`${apiUrl}/friends/add`, {
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

  // Handle follow user
  const handleFollowUser = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) {
      console.error('❌ Cannot follow: currentUserId is not set');
      return;
    }

    try {
      console.log('🔄 Attempting to follow user:', { userId, currentUserId });
      const result = await followUser(userId, { userId: currentUserId });
      console.log('✅ Follow API response:', result);

      // Add to following list locally
      setFollowingList(prev => {
        const newSet = new Set(prev);
        newSet.add(userId);
        console.log('✅ Updated following list:', Array.from(newSet));
        return newSet;
      });

      // Refresh the following list from server to ensure accuracy
      const response = await getUserFollowing(currentUserId, 1000, 0);
      if (response?.following) {
        const followingIds = new Set<string>(
          response.following.map((user: any) => String(user.following_id || user.user_id || user.id))
        );
        setFollowingList(followingIds);
        console.log('✅ Refreshed following list from server (count):', followingIds.size);
        console.log('✅ Refreshed following list IDs:', Array.from(followingIds));
      }
    } catch (error) {
      console.error('❌ Failed to follow user:', error);
    }
  };

  // Unified User Search Card Component
  const UserSearchCard = ({ user }: { user: any }) => {
    const isFriend = friends.has(user.id);
    const isFollowing = followingList.has(user.id);

    // Debug logging for each user card
    console.log('🔍 UserSearchCard check:', {
      username: user.username,
      userId: user.id,
      isFollowing,
      followingListSize: followingList.size,
      followingListSample: Array.from(followingList).slice(0, 3)
    });

    const handleCardClick = () => {
      console.log('🖱️ User card clicked:', {
        username: user.username,
        userId: user.id,
        isFollowing,
        willStartChat: isFollowing
      });

      if (isFollowing) {
        console.log('✅ User is followed, starting chat...');
        onStartChat(user);
      } else {
        console.log('⚠️ User is not followed, cannot start chat');
      }
    };

    return (
      <div
        onClick={handleCardClick}
        className={`w-full p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 text-slate-300 transition-all duration-200 ${
          isFollowing
            ? 'hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-white cursor-pointer'
            : 'cursor-default opacity-75'
        }`}
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
              <div className="flex items-center justify-center w-full h-full text-white font-bold text-sm">
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
              className="text-base font-semibold text-white hover:text-blue-300 transition-colors hover:underline cursor-pointer text-left truncate block"
            >
              {user.username}
            </button>
            <div className="text-sm text-slate-400 line-clamp-2 leading-tight">{user.bio || 'No bio available'}</div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between">
          {isFollowing ? (
            <div className="text-xs text-slate-400">
              Click to start conversation
            </div>
          ) : (
            <div className="text-xs text-amber-400 font-medium">
              Follow {user.username} to start chat !!
            </div>
          )}

          {/* Action Button */}
          {!isFollowing && (
            <button
              onClick={(e) => handleFollowUser(user.id, e)}
              className="px-4 py-2 bg-[#6e54ff] hover:bg-[#5940CC] text-white text-sm font-medium rounded-lg transition-all duration-200 min-w-[100px]"
            >
              Follow
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

    // Debug log
    console.log('🔍 ChatThreadCard rendering:', {
      threadId: thread.id,
      otherUser,
      avatarUrl: otherUser?.avatar_url || otherUser?.avatar,
      username: otherUser?.username
    });

    const avatarUrl = otherUser?.avatar_url || otherUser?.avatar;
    const username = otherUser?.username || otherUser?.name || 'User';
    const hasAvatarError = avatarErrors.has(thread.id);

    const handleAvatarError = () => {
      setAvatarErrors(prev => new Set(prev).add(thread.id));
    };

    return (
      <div
        onClick={() => onSelectThread(thread.id)}
        className={`w-full px-2.5 py-1.5 rounded-xl cursor-pointer transition-all duration-200 border ${
          isSelected
            ? 'bg-gray-700/30 border-[#6e54ff] text-white'
            : 'border-transparent text-slate-300 hover:bg-gray-700/20 hover:text-white'
        }`}
      >
        {/* Header Section */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!thread.isGroup && otherUser?.user_id) handleUserClick(otherUser.user_id);
            }}
            className="relative w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            {avatarUrl && !hasAvatarError ? (
              <img
                src={avatarUrl}
                alt={username}
                className="w-full h-full object-cover"
                onError={handleAvatarError}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-white font-bold text-sm">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Online Status Indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
          </button>
          <div className="flex-1 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!thread.isGroup && otherUser?.user_id) handleUserClick(otherUser.user_id);
              }}
              className={`text-sm font-semibold truncate block text-left transition-colors ${
                hasUnread ? "text-white" : "text-white"
              } ${!thread.isGroup && otherUser?.user_id ? "hover:text-blue-300 hover:underline" : ""}`}
            >
              {thread.isGroup ? thread.name : username}
            </button>
            {lastMessage && (
              <div className={`text-sm truncate leading-tight mt-0.5 ${
                hasUnread ? "text-slate-200 font-medium" : "text-slate-400"
              }`}>
                {lastMessage.sender_id === currentUserId || lastMessage.sender_id === String(currentUserId) ? "You: " : ""}
                {truncateMessage(lastMessage.content, 30)}
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
      <div className="mb-2 flex-shrink-0">
        <div className="relative px-2">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search chats or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-black text-white rounded-lg border border-gray-600/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all duration-200 text-xs"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {showSearchResults ? (
          <div className="space-y-2">
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
          <div className="space-y-1.5 px-1">
            {!state.messageThreads ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <MessageCircle className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-xs">Loading chats...</p>
              </div>
            ) : state.messageThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <MessageCircle className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-xs text-center">No chats yet<br />Start a conversation!</p>
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