import { MessageCircle, Dot, Hash } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

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
  const [imageError, setImageError] = useState(false);

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
    <div className="px-5 py-3 border-b border-gray-800/60 bg-black">
      {activeTab === 'dms' && currentThread ? (
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 ring-2 ring-gray-800 shadow-lg">
            <img
              src={
                currentThread.isGroup
                  ? 'https://robohash.org/group.png'
                  : otherUser?.avatar_url || 'https://robohash.org/default.png'
              }
              alt="user avatar"
              className="w-full h-full object-cover"
            />
            {/* Online status indicator */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black"></div>
          </div>

          {/* Name and type */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-0.5">
              {currentThread.isGroup
                ? currentThread.name
                : otherUser?.username || 'User'}
            </h3>
            <p className="text-xs text-gray-400 flex items-center">
              {currentThread.isGroup ? (
                <>
                  <Dot className="w-3 h-3 text-green-400" />
                  Group Chat
                </>
              ) : (
                <>
                  <Dot className="w-3 h-3 text-green-400" />
                  Active now
                </>
              )}
            </p>
          </div>
        </div>
      ) : activeTab === 'communities' && currentCommunity ? (
        <div className="flex items-center space-x-3 justify-between">
          <div className="flex gap-3 items-center">
            {/* ✅ Community Picture Logic from CommunitySection */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden ${
                currentCommunity.profile_picture_url && !imageError
                  ? 'border border-transparent'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500 border border-white/30'
              } shadow-lg ring-2 ring-gray-800`}
            >
              {currentCommunity.profile_picture_url && !imageError ? (
                <Image
                  src={currentCommunity.profile_picture_url}
                  alt={currentCommunity.name || 'Community'}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Hash className="w-5 h-5 text-white" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-0.5">
                {currentCommunity.name}
              </h3>
              <p className="text-xs text-gray-400">
                Pool: <span className="text-blue-400 font-medium">$40000</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400">Min. Share</p>
            <p className="text-xs text-purple-400 font-semibold">10</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 pt-72 text-gray-400">
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
