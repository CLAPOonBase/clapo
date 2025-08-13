import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSend, disabled }: MessageInputProps) => {
  const [messageContent, setMessageContent] = useState('');

  const handleSend = () => {
    if (messageContent.trim()) {
      onSend(messageContent.trim());
      setMessageContent('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex items-end space-x-2">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Type your message..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full px-6 py-2 bg-slate-700/50 text-white rounded-2xl border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
          disabled={disabled}
        />
      </div>
      
      <button
        onClick={handleSend}
        disabled={!messageContent.trim() || disabled}
        className="py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};