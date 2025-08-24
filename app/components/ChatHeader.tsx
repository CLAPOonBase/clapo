import { MessageCircle, Dot, Hash } from 'lucide-react';

interface ChatHeaderProps {
  activeTab: 'dms' | 'communities';
  currentThread: any;
  currentCommunity: any;
  session: any;
}

export const ChatHeader = ({
  activeTab,
  currentThread,
  currentCommunity,
  session
}: ChatHeaderProps) => {
  const getOtherUser = (thread: any) => {
    if (!thread || !session?.dbUser?.id) return null;
    if (thread.isGroup) return null;
    return thread.participants?.find(
      (p: any) => p.user_id !== session.dbUser.id
    );
  };

  const otherUser = getOtherUser(currentThread);


    const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };
  return (
    <div className="px-6 py-2 border-b border-slate-700/50">
      {activeTab === 'dms' && currentThread ? (
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500">
            <img
              src={
                currentThread.isGroup
                  ? 'https://robohash.org/group.png'
                  : otherUser?.avatar_url || 'https://robohash.org/default.png'
              }
              alt="user avatar"
              className="w-full h-full object-cover"
            />

          </div>

          {/* Name and type */}
          <div>
            <h3 className="text-xl font-bold text-white">
              {currentThread.isGroup
                ? currentThread.name
                : otherUser?.username || 'User'}
            </h3>
            <p className="text-xs text-slate-400 flex items-center">
              {currentThread.isGroup ? 'Group Chat' : ''}
            </p>
          </div>
          
        </div>
      ) : activeTab === 'communities' && currentCommunity ? (
        <div className="flex items-center space-x-4 justify-between">
       <div className='flex gap-4 items-center'>
           <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Hash className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {currentCommunity.name}
            </h3>
            {/* <p className="text-sm text-slate-400">
              {currentCommunity.description}
            </p> */}
                      <span>Pool: <span>$40000</span></span>

          </div>
       </div>
            <span>Min. Share <span>10</span></span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
          <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">
            {activeTab === 'dms'
              ? 'Select a conversation'
              : 'Select a community'}
          </p>
          <p className="text-sm opacity-75">
            {activeTab === 'dms'
              ? 'Choose from your chats to begin messaging'
              : 'Choose from your communities to begin messaging'}
          </p>
        </div>
      )}
    </div>
  );
};
