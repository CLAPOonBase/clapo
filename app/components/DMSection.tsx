import { MessageCircle, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DMSectionProps {
  dmSection: 'threads' | 'search';
  state: any;
  session: any;
  selectedThread: string | null;
  onSelectThread: (threadId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onStartChat: (user: any) => void;
}

export const DMSection = ({
  dmSection,
  state,
  session,
  selectedThread,
  onSelectThread,
  searchQuery,
  setSearchQuery,
  onStartChat
}: DMSectionProps) => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [hasInitializedUsers, setHasInitializedUsers] = useState(false);

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
        setSearchResults(data.users.filter((user: any) => user.id !== session?.dbUser?.id));
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const getOtherUser = (thread: any) => {
    if (!thread || !session?.dbUser?.id) return null;
    if (thread.isGroup) return null;
    return thread.participants?.find((p: any) => p.user_id !== session.dbUser.id) || null;
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
            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  selectedThread === thread.id 
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 text-white shadow-lg' 
                    : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-600">
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
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                      {thread.isGroup ? thread.name : otherUser?.username || 'User'}
                    </div>
                  </div>
                </div>
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
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600">
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
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {user.username}
                  </div>
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <button className="text-xs bg-green-900 px-2 rounded-md">
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
