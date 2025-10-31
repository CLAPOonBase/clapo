"use client";

import React, { useState, useRef } from 'react';
import { Film, X, Upload } from 'lucide-react';
import { useMunch } from '../hooks/useMunch';
import { getMentionTriggerInfo, replaceMentionText } from '../lib/mentionUtils';
import MentionAutocomplete from './MentionAutocomplete';
import { motion } from 'framer-motion';

interface MunchUploadProps {
  onClose: () => void;
}

export const MunchUpload: React.FC<MunchUploadProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mention state
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  const { createMunchVideo } = useMunch();

  // Handle caption change and mention detection
  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const newCursorPosition = e.target.selectionStart || 0;

    setCaption(newContent);
    setCursorPosition(newCursorPosition);

    // Check for mention trigger
    const mentionInfo = getMentionTriggerInfo(newContent, newCursorPosition);

    if (mentionInfo && mentionInfo.triggered) {
      setShowMentionAutocomplete(true);
      setMentionSearch(mentionInfo.searchText);
      setMentionStartPos(mentionInfo.startPos);

      // Calculate position for autocomplete dropdown
      if (captionRef.current) {
        const rect = captionRef.current.getBoundingClientRect();
        setMentionPosition({
          top: rect.top - 250,
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
      caption,
      mentionStartPos,
      cursorPosition,
      user.username
    );

    setCaption(newText);
    setShowMentionAutocomplete(false);

    // Set cursor position
    setTimeout(() => {
      if (captionRef.current) {
        captionRef.current.selectionStart = newCursorPosition;
        captionRef.current.selectionEnd = newCursorPosition;
        captionRef.current.focus();
      }
    }, 0);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }

      // Create video element to check duration
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = Math.floor(video.duration);

        if (duration > 60) {
          setError('Video must be 60 seconds or less');
          setSelectedFile(null);
          setPreviewUrl('');
          return;
        }

        setVideoDuration(duration);
        setSelectedFile(file);
        setError('');

        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      };

      video.src = URL.createObjectURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      console.log('📹 Munch video uploaded to storage:', uploadResult);
      console.log('📹 Video URL:', uploadResult.url);
      console.log('📹 Video duration:', videoDuration);

      // Create munch video with uploaded URL
      const createdVideo = await createMunchVideo(
        uploadResult.url,
        videoDuration,
        caption || undefined,
        uploadResult.thumbnail // if your upload endpoint provides a thumbnail
      );

      console.log('✅ Munch video created successfully in backend:', createdVideo);

      // Show success message
      alert('Video uploaded successfully!');

      // Reset form and close modal
      resetForm();
      onClose();

      // Stay on munch section - the parent component will refresh the feed
      // No need to reload the entire page

    } catch (error) {
      console.error('❌ Failed to upload munch video:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload video';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoClick = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCaption('');
    setPreviewUrl('');
    setVideoDuration(0);
    setError('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-black border-2 border-gray-700/70 rounded-xl p-4 w-full max-w-lg shadow-custom"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Create Munch</h3>
              <p className="text-sm text-gray-400">Upload a short video (max 60s)</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!selectedFile ? (
          /* File Selection */
          <div className="space-y-4">
            <button
              onClick={handleVideoClick}
              className="w-full flex flex-col items-center justify-center p-12 bg-gray-700/30 hover:bg-gray-600/30 rounded-xl border-2 border-dashed border-gray-600/50 hover:border-purple-500/50 transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Film className="w-8 h-8 text-white" />
              </div>
              <span className="text-white text-base font-medium mb-2">Choose Video</span>
              <span className="text-gray-400 text-sm">Maximum duration: 60 seconds</span>
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-2">
              <p className="text-xs text-gray-400 text-center">Tips for great Munch videos:</p>
              <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>Keep it under 60 seconds</li>
                <li>Use vertical format (9:16) for best results</li>
                <li>Good lighting and clear audio</li>
                <li>Engaging content from the first second</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Preview and Upload */
          <div className="space-y-4">
            {/* Video Preview */}
            <div className="relative bg-black rounded-xl overflow-hidden border-2 border-gray-700/70">
              <video
                src={previewUrl}
                controls
                className="w-full h-80 object-contain"
              />

              {/* Duration Badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 rounded-lg">
                <span className="text-white text-xs font-semibold">
                  {formatDuration(videoDuration)}
                </span>
              </div>

              {/* Remove Preview Button */}
              <button
                onClick={resetForm}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Caption Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Caption (optional)
              </label>
              <textarea
                ref={captionRef}
                value={caption}
                onChange={handleCaptionChange}
                placeholder="Add a caption... Use @username to mention someone"
                className="w-full px-3 py-2.5 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-purple-500/50 focus:outline-none transition-all duration-200 resize-none placeholder:text-gray-500"
                rows={3}
                maxLength={200}
              />
              <div className="text-right mt-1">
                <span className="text-xs text-gray-400">{caption.length}/200</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Share Munch
                  </>
                )}
              </button>

              <button
                onClick={handleClose}
                disabled={uploading}
                className="flex-1 px-6 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white text-sm font-medium rounded-full border border-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Mention Autocomplete */}
        {showMentionAutocomplete && (
          <MentionAutocomplete
            searchText={mentionSearch}
            onSelect={handleMentionSelect}
            onClose={() => setShowMentionAutocomplete(false)}
            position={mentionPosition}
            zIndex={60}
          />
        )}
      </motion.div>
    </motion.div>
  );
};
