import { MessageCircle, Users, Dot, Hash } from 'lucide-react';

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
  const getOtherUserName = (thread: any) => {
    if (!thread || !session?.dbUser?.id) return 'User';
    if (thread.isGroup) return thread.name || 'Group Chat';
    
    const otherUser = thread.participants?.find((p: any) => p.user_id !== session.dbUser.id);
    return otherUser?.username || 'User';
  };

  return (
    <div className="px-6 py-2 border-b border-slate-700/50">
      {activeTab === 'dms' && currentThread ? (
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <img 
                src={
                  !currentThread.isGroup 
                    ? (currentThread.participants?.find((p: any) => p.user_id !== session?.dbUser?.id)?.avatarUrl || 'https://robohash.org/default.png')
                    : 'https://robohash.org/group.png'
                }
                alt="other user image"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
          <div> 
            <h3 className="text-xl font-bold text-white">
              {currentThread.isGroup 
                ? currentThread.name 
                : getOtherUserName(currentThread)}
            </h3>
            <p className="text-sm text-slate-400 flex items-center">
              <Dot className="w-4 h-4 mr-1" />
              {currentThread.isGroup ? 'Group Chat' : 'Direct Message'}
            </p>
          </div>
        </div>
      ) : activeTab === 'communities' && currentCommunity ? (
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Hash className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{currentCommunity.name}</h3>
            <p className="text-sm text-slate-400">{currentCommunity.description}</p>
          </div>
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