"use client";
import { Camera, Video, FileText, Calendar, PencilLine, Send } from "lucide-react";
import { useState } from "react";

export default function SnapComposer() {
  const [content, setContent] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = () => {
    if (content.trim()) {
      console.log("Posting:", content);
      setContent("");
    }
  };

  const actions = [
    { icon: Camera, label: "Photo", color: "text-secondary hover:text-blue-300" },
    { icon: Video, label: "Video", color: "text-secondary hover:text-red-300" },
    { icon: FileText, label: "File", color: "text-secondary hover:text-green-300" },
    { icon: Calendar, label: "Event", color: "text-secondary hover:text-purple-300" }
  ];

  return (
    <div className="">
      <div className={`bg-dark-800 rounded-md my-4 shadow-xl transition-all duration-300 ${
        focused ? 'ring-2 ring-blue-500/50 shadow-2xl' : 'shadow-lg'
      }`}>
        {/* Main input area */}
        <div className="py-4 sm:py-6">
          <div className="flex items-start gap-3 px-4 sm:px-6">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center">
              <PencilLine className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="What's on your mind?"
                className="w-full bg-transparent text-white text-lg placeholder-gray-400 outline-none resize-none min-h-[3rem] max-h-32"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '3rem'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
            {actions.map(({ icon: Icon, label, color }) => (
              <button
                key={label}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-all duration-200 group ${color}`}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Bottom bar with character count and post button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-400">
              {content.length > 0 && (
                <span className={content.length > 280 ? 'text-red-400' : ''}>
                  {content.length}/280
                </span>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className={`flex items-center gap-2 px-6 text-white mx-4 py-2 rounded-full font-medium transition-all duration-200 ${
                content.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}