"use client";
import { Camera, Video, FileText, Calendar, PencilLine, Send } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useApi } from "../../Context/ApiProvider";
import { ComposerSkeleton } from "../../components/SkeletonLoader";
import Toast from "../../components/Toast";
import MediaUpload from "../../components/MediaUpload";

export default function SnapComposer() {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
  const [focused, setFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { createPost, fetchPosts } = useApi();
  const { data: session, status } = useSession();

  // Show skeleton if not authenticated
  if (status === 'loading') {
    return <ComposerSkeleton />;
  }

  if (status === 'unauthenticated') {
    return <ComposerSkeleton />;
  }

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!(session as any)?.dbUser?.id) return;

    const userId = (session as any).dbUser.id;
    setIsSubmitting(true);
    
    try {
      const postData = {
        userId,
        content: content.trim(),
        mediaUrl: mediaUrl, 
        parentPostId: undefined,
        isRetweet: false,
        retweetRefId: undefined
      };
      
      await createPost(postData);
      
      setContent("");
      setMediaUrl(undefined);
      setToast({ message: 'Post created successfully!', type: 'success' });
      
      await fetchPosts(userId);
    } catch (error) {
      console.error("Failed to create post:", error);
      setToast({ message: 'Failed to create post', type: 'error' });
    } finally {
      setIsSubmitting(false);
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
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Media Upload */}
          {(session as any)?.dbUser?.id && (
            <div className="px-4 sm:px-6 mb-4">
              <MediaUpload
                onMediaUploaded={(url) => setMediaUrl(url)}
                onMediaRemoved={() => setMediaUrl(undefined)}
                userId={(session as any).dbUser.id}
                className="mb-4"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
            {actions.map(({ icon: Icon, label, color }) => (
              <button
                key={label}
                disabled={isSubmitting}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-all duration-200 group ${color} ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
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
              disabled={!content.trim() || isSubmitting || !(session as any)?.dbUser?.id}
              className={`flex items-center gap-2 px-6 text-white mx-4 py-2 rounded-full font-medium transition-all duration-200 ${
                content.trim() && !isSubmitting && (session as any)?.dbUser?.id
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSubmitting ? 'Posting...' : 'Post'}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}