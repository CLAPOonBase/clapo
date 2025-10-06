import { useRef, useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Array<{
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    sender_username?: string;
    sender_avatar?: string;
  }>;
  currentUserId: string | null;
}

// Helper function to determine message grouping
const getMessageGrouping = (
  messages: MessageListProps['messages'],
  currentIndex: number
) => {
  const currentMessage = messages[currentIndex];
  const prevMessage = messages[currentIndex - 1];
  const nextMessage = messages[currentIndex + 1];

  const isFirstInGroup = !prevMessage || prevMessage.sender_id !== currentMessage.sender_id;
  const isLastInGroup = !nextMessage || nextMessage.sender_id !== currentMessage.sender_id;

  return {
    isFirstInGroup,
    isLastInGroup,
    showAvatar: isLastInGroup // ✅ show avatar only on last message
  };
};

// Helper function to check if date separator is needed
const needsDateSeparator = (
  currentMessage: MessageListProps['messages'][0],
  prevMessage: MessageListProps['messages'][0] | undefined
) => {
  if (!prevMessage) return true;

  const currentDate = new Date(currentMessage.created_at);
  const prevDate = new Date(prevMessage.created_at);

  return (
    currentDate.getDate() !== prevDate.getDate() ||
    currentDate.getMonth() !== prevDate.getMonth() ||
    currentDate.getFullYear() !== prevDate.getFullYear()
  );
};

// Helper function to format date separator
const formatDateSeparator = (dateString: string) => {
  const messageDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return messageDate.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};


export const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);

  // Smooth scroll with Framer Motion
  const smoothScrollToBottom = () => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    animate(container.scrollTop, container.scrollHeight, {
      duration: 0.6,
      ease: 'easeInOut',
      onUpdate: (latest) => {
        container.scrollTop = latest;
      }
    });
    setNewMessageCount(0);
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottom) {
      setTimeout(() => {
        smoothScrollToBottom();
      }, 50);
    } else {
      setNewMessageCount((prev) => prev + 1);
    }
  }, [messages]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);

    if (isNearBottom) {
      setNewMessageCount(0);
    }
  };

  // Sort messages by created_at
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 relative scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
    >
      <div className="space-y-0">
        {sortedMessages.map((message, index) => {
          const { isFirstInGroup, isLastInGroup, showAvatar } = getMessageGrouping(sortedMessages, index);
          const prevMessage = sortedMessages[index - 1];
          const showDateSeparator = needsDateSeparator(message, prevMessage);

          return (
            <div key={message.id}>
              {/* Date Separator */}
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-800/60 text-gray-400 text-xs px-3 py-1 rounded-full border border-gray-700/50">
                    {formatDateSeparator(message.created_at)}
                  </div>
                </div>
              )}

              {/* Message */}
              <MessageItem
                message={message}
                isOwnMessage={message.sender_id === currentUserId}
                showAvatar={showAvatar}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
              />
            </div>
          );
        })}
      </div>

      {showScrollButton && (
        <button
          onClick={smoothScrollToBottom}
          className="absolute bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-xl transition-all duration-200 hover:scale-110 hover:shadow-2xl"
          title={`Scroll to bottom${newMessageCount > 0 ? ` (${newMessageCount} new)` : ''}`}
        >
          <ChevronDown className="w-5 h-5" />
          {newMessageCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
              {newMessageCount > 9 ? '9+' : newMessageCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};