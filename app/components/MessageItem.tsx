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
}

export const MessageItem = ({ message, isOwnMessage }: MessageItemProps) => {
  return (
    <div
      className={`group flex justify-center items-center gap-2 px-2 rounded-xl transition-all duration-200
        ${isOwnMessage ? 'flex-row-reverse text-right justify-end' : 'justify-start'}
        ${!isOwnMessage ? 'hover:bg-slate-800/30' : ''}`}
    >
      <div className="relative flex-shrink-0">
        <img 
          src={message.sender_avatar || 'https://robohash.org/default.png'} 
          alt="Avatar" 
          className={`w-10 h-10 rounded-full border-2 transition-colors
            ${isOwnMessage ? 'border-blue-500/50' : 'border-slate-600/50 group-hover:border-slate-500/50'}`}
        />
      </div>
      <div className={`flex-1 min-w-0 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className={`flex flex-col items-center mb-2 ${isOwnMessage ? 'justify-end flex-row-reverse' : ''}`}>
          <span className={`font-semibold flex w-full text-white group-hover:text-blue-300 transition-colors  ${isOwnMessage 
              ? 'ml-auto justify-end' 
              : 'justify-start'
            }`}>
          </span>
        </div>
        <div
          className={`rounded-xl px-3 inline-block max-w-[80%]
            ${isOwnMessage 
              ? 'bg-blue-900/40 ml-auto' 
              : 'bg-slate-800/40 text-slate-200 border-slate-700/30 mr-auto'
            }`}
        >
          <p className="break-words break-all whitespace-pre-wrap text-wrap max-w-96">{message.content}</p>
            <span className={`text-[8px] text-slate-400 text-wrap w-40 rounded-full ${isOwnMessage 
              ? 'ml-auto' 
              : ''
            }`}
            >
            {new Date(message.created_at).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};