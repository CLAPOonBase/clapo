import { useState, KeyboardEvent, useRef } from 'react';
import { Send, Image as ImageIcon, Video, X } from 'lucide-react';
import MentionAutocomplete from './MentionAutocomplete';
import { getMentionTriggerInfo, replaceMentionText } from '@/app/lib/mentionUtils';

interface MessageInputProps {
  onSend: (content: string, mediaUrl?: string) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSend, disabled }: MessageInputProps) => {
  const [messageContent, setMessageContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mention state
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);

  // Handle content change and mention detection
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    const newCursorPosition = e.target.selectionStart || 0;

    setMessageContent(newContent);
    setCursorPosition(newCursorPosition);

    // Check for mention trigger
    const mentionInfo = getMentionTriggerInfo(newContent, newCursorPosition);

    if (mentionInfo && mentionInfo.triggered) {
      setShowMentionAutocomplete(true);
      setMentionSearch(mentionInfo.searchText);
      setMentionStartPos(mentionInfo.startPos);

      // Calculate position for autocomplete dropdown
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setMentionPosition({
          top: rect.top - 250, // Show above input
          left: rect.left,
        });
      }
    } else {
      setShowMentionAutocomplete(false);
    }
  };

  // Handle mention selection
  const handleMentionSelect = (user: { id: string; username: string }) => {
    const { newText, newCursorPosition } = replaceMentionText(
      messageContent,
      mentionStartPos,
      cursorPosition,
      user.username
    );

    setMessageContent(newText);
    setShowMentionAutocomplete(false);

    // Set cursor position
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = newCursorPosition;
        inputRef.current.selectionEnd = newCursorPosition;
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleSend = async () => {
    if (!messageContent.trim() && !selectedFile) return;

    setIsUploading(true);
    try {
      let mediaUrl: string | undefined = undefined;

      // If there's a file, upload it first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          mediaUrl = data.url || data.fileUrl || data.media_url;
          console.log('✅ File uploaded successfully:', { mediaUrl, data });
        } else {
          console.error('Failed to upload file');
          alert('Failed to upload file. Please try again.');
          setIsUploading(false);
          return; // Don't send message if upload fails
        }
      }

      // Backend automatically detects @username mentions from content
      // Send the message with or without media
      console.log('📤 Sending message with media:', { content: messageContent.trim() || 'Sent a file', mediaUrl });
      onSend(messageContent.trim() || 'Sent a file', mediaUrl);

      // Reset form
      setMessageContent('');
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Please select an image or video file');
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileSelector = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* File Preview */}
      {filePreview && selectedFile && (
        <div className="relative inline-block max-w-xs">
          {selectedFile.type.startsWith('image/') ? (
            <img
              src={filePreview}
              alt="Preview"
              className="rounded-lg max-h-32 border-2 border-gray-700/70 shadow-lg"
            />
          ) : (
            <video
              src={filePreview}
              className="rounded-lg max-h-32 border-2 border-gray-700/70 shadow-lg"
              controls
            />
          )}
          <button
            onClick={handleRemoveFile}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200 shadow-lg hover:scale-110"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center space-x-2 bg-transparent rounded-full px-1 py-1 border border-gray-700/50">
        {/* Media Buttons */}
        <div className="flex items-center space-x-1 pl-2">
          <button
            onClick={() => openFileSelector('image/*')}
            disabled={disabled || isUploading}
            className="p-1.5 text-gray-400 hover:text-blue-400 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => openFileSelector('video/*')}
            disabled={disabled || isUploading}
            className="p-1.5 text-gray-400 hover:text-purple-400 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send video"
          >
            <Video className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Message... Type @ to mention"
            value={messageContent}
            onChange={handleContentChange}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2 bg-transparent text-sm text-white rounded-full focus:outline-none transition-all duration-200 placeholder-gray-500"
            disabled={disabled || isUploading}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={(!messageContent.trim() && !selectedFile) || disabled || isUploading}
          className="p-2 text-blue-500 hover:text-blue-400 disabled:text-gray-600 rounded-full transition-all duration-200 disabled:cursor-not-allowed mr-1"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mention Autocomplete */}
      {showMentionAutocomplete && (
        <MentionAutocomplete
          searchText={mentionSearch}
          onSelect={handleMentionSelect}
          onClose={() => setShowMentionAutocomplete(false)}
          position={mentionPosition}
        />
      )}
    </div>
  );
};