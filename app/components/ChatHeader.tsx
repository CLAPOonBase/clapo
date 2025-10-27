import { MessageCircle, Dot, Hash } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface ChatHeaderProps {
  activeTab: 'dms' | 'communities';
  currentThread: any;
  currentCommunity: any;
  currentUserId?: string | null;
}

export const ChatHeader = ({
  activeTab,
  currentThread,
  currentCommunity,
  currentUserId
}: ChatHeaderProps) => {
  const [imageError, setImageError] = useState(false);

  const getOtherUser = (thread: any) => {
    if (!thread || !currentUserId) return null;
    if (thread.isGroup) return null;

    console.log('🔍 ChatHeader getOtherUser:', {
      threadId: thread.id,
      participants: thread.participants,
      currentUserId
    });

    return thread.participants?.find(
      (p: any) => p.user_id !== currentUserId && p.user_id !== String(currentUserId)
    );
  };

  const otherUser = getOtherUser(currentThread);

  console.log('🔍 ChatHeader otherUser:', otherUser);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  return (
    <div className="px-5 py-3 border-b-2 border-gray-700/70 bg-black">
      {activeTab === 'dms' && currentThread ? (
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 ring-2 ring-gray-800 shadow-lg">
            {currentThread.isGroup ? (
              <img
                src="https://robohash.org/group.png"
                alt="group avatar"
                className="w-full h-full object-cover"
              />
            ) : otherUser?.avatar_url || otherUser?.avatar ? (
              <img
                src={otherUser.avatar_url || otherUser.avatar}
                alt={otherUser.username || 'user avatar'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${otherUser?.username || 'User'}&background=random`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-purple-500 to-pink-500">
                {getInitials(otherUser?.username || otherUser?.name)}
              </div>
            )}
            {/* Online status indicator */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black"></div>
          </div>

          {/* Name and type */}
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-0.5">
              {currentThread.isGroup
                ? currentThread.name
                : otherUser?.username || 'User'}
            </h3>
            <p className="text-sm text-gray-400 flex items-center">
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
              <h3 className="text-base font-semibold text-white mb-0.5">
                {currentCommunity.name}
              </h3>
              <p className="text-sm text-gray-400">
                Pool: <span className="text-blue-400 font-medium">$40000</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-400">Min. Share</p>
            <p className="text-sm text-purple-400 font-semibold">10</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 pt-72 text-gray-400">
          <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-base font-medium mb-2">
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
