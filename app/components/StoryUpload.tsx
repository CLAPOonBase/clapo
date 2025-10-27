"use client";

import React, { useState, useRef } from 'react';
import { Camera, Video, X, Send, Upload } from 'lucide-react';
import { useStories } from '../hooks/useStories';
import { getMentionTriggerInfo, replaceMentionText } from '../lib/mentionUtils';
import MentionAutocomplete from './MentionAutocomplete';

interface StoryUploadProps {
  onClose: () => void;
}

export const StoryUpload: React.FC<StoryUploadProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Mention state
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  
  const { createStory } = useStories();

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
      setSelectedFile(file);
      
      // Determine media type
      if (file.type.startsWith('video/')) {
        setMediaType('video');
      } else if (file.type.startsWith('image/')) {
        setMediaType('image');
      }
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

const handleUpload = async () => {
  if (!selectedFile) return;
  
  setUploading(true);
  
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
    console.log('Story uploaded successfully:', uploadResult.url);
    
    // Create story with uploaded URL
    await createStory(uploadResult.url, mediaType, caption || undefined);

    console.log('✅ Story created successfully!');

    // Reset form and close modal
    resetForm();
    onClose();

    // Story will appear automatically via useStories hook

  } catch (error) {
    console.error('❌ Failed to upload story:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload story';
    alert(`Failed to upload story: ${errorMessage}. Please try again.`);
  } finally {
    setUploading(false);
  }
};


  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCaption('');
    setPreviewUrl('');
    setMediaType('image');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border-2 border-gray-700/70 rounded-xl p-4 w-full max-w-lg shadow-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
              backgroundColor: "#6E54FF",
              boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
            }}>
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Create Story</h3>
              <p className="text-sm text-gray-400">Share a moment with your friends</p>
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

        {!selectedFile ? (
          /* File Selection */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Photo Button */}
              <button
                onClick={handleCameraClick}
                className="flex flex-col items-center justify-center p-8 bg-gray-700/30 hover:bg-gray-600/30 rounded-xl border border-gray-600/30 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{
                  backgroundColor: "#6E54FF",
                  boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                }}>
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-sm font-medium">Photo</span>
              </button>
              
              {/* Video Button */}
              <button
                onClick={handleVideoClick}
                className="flex flex-col items-center justify-center p-8 bg-gray-700/30 hover:bg-gray-600/30 rounded-xl border border-gray-600/30 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{
                  backgroundColor: "#6E54FF",
                  boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                }}>
                  <Video className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-sm font-medium">Video</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-400 text-center">
              Select a photo or video to share as your story
            </p>
            
            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          /* Preview and Upload */
          <div className="space-y-4">
            {/* Media Preview */}
            <div className="relative bg-black rounded-xl overflow-hidden border-2 border-gray-700/70">
              {mediaType === 'image' ? (
                <img
                  src={previewUrl}
                  alt="Story preview"
                  className="w-full h-80 object-cover"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="w-full h-80 object-cover"
                />
              )}
              
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
                placeholder="Add a caption to your story... Use @username to mention someone"
                className="w-full px-3 py-2.5 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 resize-none placeholder:text-gray-500"
                rows={3}
                maxLength={150}
              />
              <div className="text-right mt-1">
                <span className="text-xs text-gray-400">{caption.length}/150</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-6 py-2 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{
                  backgroundColor: uploading ? "#6B7280" : "#6E54FF",
                  boxShadow: uploading ? "none" : "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                }}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Share Story
                  </>
                )}
              </button>

              <button
                onClick={handleClose}
                disabled={uploading}
                className="flex-1 px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white text-sm font-medium rounded-full border border-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
};