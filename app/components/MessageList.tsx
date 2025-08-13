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

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-3 relative scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
    >
      {[...messages]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={message.sender_id === currentUserId}
          />
        ))}

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
