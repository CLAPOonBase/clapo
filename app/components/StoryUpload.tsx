"use client";

import React, { useState, useRef } from 'react';
import { Camera, Video, X, Send, Image as ImageIcon } from 'lucide-react';
import { useStories } from '@/app/hooks/useStories';

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
  
  const { createStory } = useStories();

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
      // Upload using the API route to avoid CORS issues
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
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Failed to upload story:', error);
      alert('Failed to upload story. Please try again.');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Create Story</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {!selectedFile ? (
          /* File Selection */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCameraClick}
                className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Camera size={32} className="text-white mb-2" />
                <span className="text-white text-sm">Photo</span>
              </button>
              
              <button
                onClick={handleVideoClick}
                className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Video size={32} className="text-white mb-2" />
                <span className="text-white text-sm">Video</span>
              </button>
            </div>
            
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
            <div className="relative bg-black rounded-lg overflow-hidden">
              {mediaType === 'image' ? (
                <img
                  src={previewUrl}
                  alt="Story preview"
                  className="w-full h-64 object-cover"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="w-full h-64 object-cover"
                />
              )}
              
              <button
                onClick={resetForm}
                className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            {/* Caption Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Caption (optional)
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption to your story..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                maxLength={150}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {caption.length}/150
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Share Story
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
