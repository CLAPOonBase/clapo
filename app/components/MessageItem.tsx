import { useRouter } from 'next/navigation';
import { renderTextWithMentions } from '@/app/lib/mentionUtils';

interface MessageItemProps {
  message: {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    sender_username?: string;
    sender_avatar?: string;
    media_url?: string;
  };
  isOwnMessage: boolean;
  showAvatar?: boolean; // Whether to show avatar and username (first message in group)
  isLastInGroup?: boolean; // Whether this is the last message in a group
  isFirstInGroup?: boolean; // Whether this is the first message in a group
}

export const MessageItem = ({ 
  message, 
  isOwnMessage,
  showAvatar = false,
  isLastInGroup = false,
  isFirstInGroup = false
}: MessageItemProps) => {
  const router = useRouter();

  // Handle mention click navigation
  const handleMentionClick = async (userId: string, username: string) => {
    if (userId) {
      // We have the user ID, navigate directly
      router.push(`/snaps/profile/${userId}`)
    } else {
      // We don't have the user ID, search for the user by username
      try {
        console.log('Searching for user:', username)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.blazeswap.io/api/snaps'}/users/search?q=${username}&limit=1`)
        const data = await response.json()
        
        if (data.users && data.users.length > 0) {
          const user = data.users.find((u: any) => u.username === username)
          if (user) {
            router.push(`/snaps/profile/${user.id}`)
            return
          }
        }
        
        // User not found
        console.log(`User ${username} not found`)
      } catch (error) {
        console.error('Error finding user:', error)
      }
    }
  }

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

  return (
    <div className={`group flex items-start transition-all duration-200 ${
      isOwnMessage ? 'flex-row-reverse' : 'flex-row'
    } ${
      isOwnMessage ? 'px-4 py-0.5' : 'px-3 py-0.5'
    } ${isLastInGroup ? 'mb-2' : 'mb-0.5'}`}>

      {/* Avatar - only show for other users on first message */}
      {!isOwnMessage && isFirstInGroup ? (
        <div className="flex-shrink-0 mt-4">
          <button
            onClick={() => handleUserClick(message.sender_id)}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img
              src={message.sender_avatar || 'https://robohash.org/default.png'}
              alt="Avatar"
              className="w-7 h-7 rounded-full"
            />
          </button>
        </div>
      ) : !isOwnMessage ? (
        // Placeholder space to maintain alignment for grouped messages
        <div className="w-7 flex-shrink-0" />
      ) : null}

      {/* Message Content */}
      <div className={`flex flex-col max-w-[75%] ${
        isOwnMessage ? 'items-end' : 'items-start'
      } ${isOwnMessage ? '' : 'ml-2'}`}>

        {/* Username - only show on first message of group */}
        {!isOwnMessage && isFirstInGroup && message.sender_username && (
          <button
            onClick={() => handleUserClick(message.sender_id)}
            className="text-sm font-semibold text-gray-400 hover:text-gray-300 transition-colors duration-200 hover:underline cursor-pointer mb-1"
          >
            {message.sender_username}
          </button>
        )}

        {/* Message Bubble */}
        <div className={`relative rounded-3xl transition-all duration-200 ${
          message.media_url ? 'p-0' : 'px-4 py-2'
        } ${
          isOwnMessage
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800/80 text-white'
        }`}>

          {/* Media Attachment */}
          {message.media_url && (
            <div className="rounded-2xl overflow-hidden mb-1">
              {message.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={message.media_url}
                  alt="Shared image"
                  className="max-w-full max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.media_url, '_blank')}
                />
              ) : message.media_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                <video
                  src={message.media_url}
                  controls
                  className="max-w-full max-h-64 object-contain"
                />
              ) : (
                <a
                  href={message.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 hover:underline text-blue-300 text-xs"
                >
                  View attachment
                </a>
              )}
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <p className={`text-base leading-relaxed break-words whitespace-pre-wrap ${
              message.media_url ? 'px-4 py-2' : ''
            }`}>
              {renderTextWithMentions(
                message.content,
                undefined,
                handleMentionClick
              )}
            </p>
          )}

        </div>

        {/* Timestamp - only show on last message of group */}
        {isLastInGroup && (
          <span className={`text-[10px] text-gray-500 transition-colors duration-200 mt-1 ${
            isOwnMessage ? 'mr-1' : 'ml-1'
          }`}>
            {(() => {
              const messageDate = new Date(message.created_at);
              const today = new Date();
              const isToday = messageDate.toDateString() === today.toDateString();

              if (isToday) {
                return messageDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });
              } else {
                return messageDate.toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric'
                }) + ' ' + messageDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
            })()}
          </span>
        )}
      </div>
    </div>
  );
};

// Helper function to determine message grouping
export const getMessageGrouping = (messages: MessageItemProps['message'][], currentIndex: number) => {
  const currentMessage = messages[currentIndex];
  const prevMessage = messages[currentIndex - 1];
  const nextMessage = messages[currentIndex + 1];
  
  const isFirstInGroup = !prevMessage || prevMessage.sender_id !== currentMessage.sender_id;
  const isLastInGroup = !nextMessage || nextMessage.sender_id !== currentMessage.sender_id;
  
  return {
    isFirstInGroup,
    isLastInGroup,
    showAvatar: isFirstInGroup
  };
};

// Usage example:
export const MessageList = ({ messages }: { messages: MessageItemProps['message'][] }) => {
  return (
    <div className="flex flex-col space-y-0">
      {messages.map((message, index) => {
        const { isFirstInGroup, isLastInGroup, showAvatar } = getMessageGrouping(messages, index);
        const isOwnMessage = message.sender_id === 'current_user_id'; // Replace with actual logic
        
        return (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={isOwnMessage}
            showAvatar={showAvatar}
            isFirstInGroup={isFirstInGroup}
            isLastInGroup={isLastInGroup}
          />
        );
      })}
    </div>
  );
};