interface MessageItemProps {
  message: {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    sender_username?: string;
    sender_avatar?: string;
  };
  isOwnMessage: boolean;
  showAvatar?: boolean; // Whether to show avatar and username
  isLastInGroup?: boolean; // Whether this is the last message in a group
}

export const MessageItem = ({ message, isOwnMessage, showAvatar = true, isLastInGroup = true }: MessageItemProps) => {
  return (
    <div className={`group flex items-start transition-all duration-200 hover:bg-slate-800/20 ${
      isOwnMessage ? 'flex-row-reverse' : 'flex-row'
    } ${showAvatar ? 'gap-3 p-3' : isOwnMessage ? 'pr-16 pl-3 py-1' : 'pl-16 pr-3 py-1'}`}>
      
      {/* Avatar - only show when showAvatar is true */}
      {showAvatar ? (
        <div className="flex-shrink-0">
          <img 
            src={message.sender_avatar || 'https://robohash.org/default.png'} 
            alt="Avatar" 
            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 shadow-sm ${
              isOwnMessage 
                ? 'border-blue-400/60 group-hover:border-blue-400/80' 
                : 'border-slate-500/50 group-hover:border-slate-400/70'
            }`}
          />
        </div>
      ) : (
        // Placeholder space to maintain alignment
        <div className="w-10 flex-shrink-0" />
      )}

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${
        isOwnMessage ? 'items-end' : 'items-start'
      } ${showAvatar ? 'gap-1' : 'gap-0.5'}`}>
        
        {/* Username - only show when showAvatar is true */}
        {showAvatar && message.sender_username && (
          <span className={`text-sm font-medium transition-colors duration-200 ${
            isOwnMessage 
              ? 'text-blue-300 group-hover:text-blue-200' 
              : 'text-slate-300 group-hover:text-slate-200'
          }`}>
            {message.sender_username}
          </span>
        )}

        {/* Message Bubble */}
        <div className={`relative rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 ${
          isOwnMessage 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600' 
            : 'bg-slate-800/60 text-slate-100 border border-slate-700/40 hover:bg-slate-800/80 hover:border-slate-600/50'
        } ${!showAvatar ? (isOwnMessage ? 'rounded-tr-md' : 'rounded-tl-md') : ''}`}>
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>
          
          {/* Message tail - only show on first message of group */}
          {showAvatar && (
            <div className={`absolute top-3 w-0 h-0 ${
              isOwnMessage 
                ? '-right-1 border-l-[8px] border-l-blue-600 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent' 
                : '-left-1 border-r-[8px] border-r-slate-800/60 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
            }`} />
          )}
        </div>

        {/* Timestamp - only show on last message of group */}
        {isLastInGroup && (
          <span className={`text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-200 ${
            isOwnMessage ? 'mr-2' : 'ml-2'
          }`}>
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
      </div>
    </div>
  );
};