"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Play, Pause, Volume2, VolumeX, Plus, Eye } from "lucide-react";
import { useStories } from "@/app/hooks/useStories";
import { StoryUpload } from "./StoryUpload";
import { useSession } from "next-auth/react";

type Story = {
  id: string;
  media_url: string;
  media_type: "video" | "image";
  caption?: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    name?: string;
    avatar_url?: string;
  };
  view_count: number;
  has_viewed: boolean;
};

const Stories: React.FC = () => {
  const { data: session } = useSession();
  const { stories, loading, error, fetchFollowingStories, recordStoryView, getStoryViewers } = useStories();
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showViewersModal, setShowViewersModal] = useState<boolean>(false);
  const [storyViewers, setStoryViewers] = useState<any[]>([]);
  const [loadingViewers, setLoadingViewers] = useState<boolean>(false);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [dragY, setDragY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const bottomSheetRef = useRef<HTMLDivElement | null>(null);

  // Check if story is expired (older than 24 hours)
  const isStoryExpired = (createdAt: string): boolean => {
    const storyTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return currentTime - storyTime > twentyFourHours;
  };

  // Filter expired stories
  const filterExpiredStories = (storyList: Story[]): Story[] => {
    return storyList.filter(story => !isStoryExpired(story.created_at));
  };

  // Load stories from localStorage and filter expired ones
  const loadStoriesFromStorage = (): Story[] => {
    try {
      const stored = localStorage.getItem('user_stories');
      if (stored) {
        const parsedStories = JSON.parse(stored);
        return filterExpiredStories(parsedStories);
      }
    } catch (error) {
      console.error('Error loading stories from storage:', error);
    }
    return [];
  };

  // Save stories to localStorage
  const saveStoriesToStorage = (storyList: Story[]) => {
    try {
      localStorage.setItem('user_stories', JSON.stringify(storyList));
    } catch (error) {
      console.error('Error saving stories to storage:', error);
    }
  };

  useEffect(() => {
    fetchFollowingStories();
  }, []);

  useEffect(() => {
    console.log('showBottomSheet state changed:', showBottomSheet);
  }, [showBottomSheet]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isModalOpen && isPlaying && stories.length > 0) {
      const currentStory = stories[currentStoryIndex];
      if (currentStory) {
        // Record view when story is opened (only once per story)
        if (!viewedStories.has(currentStory.id)) {
          recordStoryView(currentStory.id);
          setViewedStories(prev => new Set(prev).add(currentStory.id));
        }
        
        const duration = currentStory.media_type === "video" ? 15000 : 5000;

        interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              goToNextStory();
              return 0;
            }
            return prev + 100 / (duration / 100);
          });
        }, 100);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isModalOpen, isPlaying, currentStoryIndex, stories, recordStoryView, viewedStories]);

  const openStory = (index: number) => {
    setCurrentStoryIndex(index);
    setIsModalOpen(true);
    setProgress(0);
    setIsPlaying(true);
  };

  const closeStory = () => {
    setIsModalOpen(false);
    setProgress(0);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const goToNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  const goToPrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const handleViewStoryViewers = async (storyId: string) => {
    console.log('handleViewStoryViewers called with storyId:', storyId);
    
    // Pause story progress immediately
    setIsPlaying(false);
    
    // Open bottom sheet immediately
    setShowBottomSheet(true);
    setDragY(0);
    setLoadingViewers(true);
    
    console.log('Bottom sheet should be opening now...');
    
    try {
      const viewers = await getStoryViewers(storyId);
      console.log('Viewers fetched:', viewers);
      setStoryViewers(viewers);
    } catch (error) {
      console.error('Failed to fetch story viewers:', error);
      // Don't show alert, just log the error
    } finally {
      setLoadingViewers(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return `${Math.floor(diffInDays / 7)}w`;
  };

  const isVideo = (story: Story) => story.media_type === "video";

  // Bottom sheet drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newY = Math.max(0, Math.min(300, touch.clientY - window.innerHeight + 200));
    setDragY(newY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Snap to positions
    if (dragY > 150) {
      setShowBottomSheet(false);
      setDragY(0);
      // Resume story playback when sheet is closed by dragging
      setIsPlaying(true);
    } else if (dragY > 50) {
      setDragY(100);
    } else {
      setDragY(0);
    }
  };

  const closeBottomSheet = () => {
    setShowBottomSheet(false);
    setDragY(0);
    // Resume story playback when closing viewers sheet
    setIsPlaying(true);
  };

  if (loading) {
    return (
      <div className="w-full p-4">
        <div className="flex gap-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gray-700 animate-pulse"></div>
              <div className="w-16 h-3 bg-gray-700 rounded animate-pulse mt-1 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Add new story
  const handleAddStory = () => {
    if (!selectedFile) return;

    const newStory: Story = {
      id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: newStoryContent,
      media_url: previewUrl,
      created_at: new Date().toISOString(),
      username: "You", // Replace with actual username
      avatar: "https://via.placeholder.com/100x100?text=You", // Replace with actual avatar
      type: selectedFile.type.startsWith('video/') ? 'video' : 'image'
    };

    // Add to stories list
    const updatedStories = [newStory, ...stories];
    setStories(updatedStories);

    // Save user stories to localStorage (excluding sample stories)
    const localStories = loadStoriesFromStorage();
    const updatedLocalStories = [newStory, ...localStories];
    saveStoriesToStorage(updatedLocalStories);

    // Reset form
    setNewStoryContent("");
    setSelectedFile(null);
    setPreviewUrl("");
    setIsAddModalOpen(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewStoryContent("");
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ zIndex: 99999 }} className="w-full">
      
      {/* Stories Grid */}
      <div
        className={`flex gap-4 p-6 ${
          stories.length > 5 ? "overflow-x-auto scrollbar-hide" : "overflow-x-hidden scrollbar-hide"
        }`}
      >
        {/* Upload Story Button */}
        <div className="flex-shrink-0 cursor-pointer" onClick={() => setShowUploadModal(true)}>
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gray-700 border-2 border-dashed border-gray-500 p-0.5 flex items-center justify-center">
              <Plus size={24} className="text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-center mt-1 truncate w-20 text-gray-400">Your Story</p>
        </div>

        {/* User Stories */}
        {stories.length === 0 && !loading && !error ? (
          <div className="flex-shrink-0 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400 text-xs">No stories yet</span>
            </div>
            <p className="text-xs text-center mt-1 text-gray-400">Create your first story!</p>
          </div>
        ) : (
          stories.map((story, index) => (
            <div key={story.id} className="flex-shrink-0 cursor-pointer" onClick={() => openStory(index)}>
              <div className="relative">
                <div className={`w-20 h-20 rounded-full p-0.5 ${
                  story.has_viewed 
                    ? 'bg-gray-600' 
                    : 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500'
                }`}>
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <img
                      src={story.user.avatar_url || '/default-avatar.png'}
                      alt={story.user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-center mt-1 truncate w-20">{story.user.username}</p>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <StoryUpload onClose={() => setShowUploadModal(false)} />
      )}

      {/* Modal */}
      {isModalOpen && stories[currentStoryIndex] && (
        <div style={{ zIndex: 99999 }} className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Progress Bars */}
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-0.5 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width:
                      index < currentStoryIndex
                        ? "100%"
                        : index === currentStoryIndex
                        ? `${progress}%`
                        : "0%",
                  }}
                ></div>
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20 mt-4">
            <div className="flex items-center gap-3">
              <img
                src={stories[currentStoryIndex].user.avatar_url || '/default-avatar.png'}
                alt={stories[currentStoryIndex].user.username}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-white font-semibold text-sm">{stories[currentStoryIndex].user.username}</p>
                <p className="text-gray-300 text-xs">{formatTimeAgo(stories[currentStoryIndex].created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Viewers button - only show for story owner */}
              {stories[currentStoryIndex].user.id === session?.dbUser?.id && (
                <button 
                  onClick={() => handleViewStoryViewers(stories[currentStoryIndex].id)}
                  disabled={loadingViewers}
                  className="flex items-center gap-1 px-2 py-1 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors disabled:opacity-50"
                  title="View story viewers"
                >
                  <Eye size={16} />
                  <span className="text-xs">{stories[currentStoryIndex].view_count}</span>
                </button>
              )}
              <button onClick={closeStory} className="text-white hover:text-gray-300">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Story Content */}
          <div className="relative w-full h-full flex items-center justify-center">
            {stories[currentStoryIndex].media_type === "video" ? (
              <video
                ref={videoRef}
                src={stories[currentStoryIndex].media_url}
                className="max-w-full max-h-full object-contain"
                autoPlay
                muted={isMuted}
                loop
              />
            ) : (
              <img
                src={stories[currentStoryIndex].media_url}
                alt="Story content"
                className="max-w-full max-h-full object-contain"
              />
            )}

            {stories[currentStoryIndex].caption && (
              <div className="absolute bottom-20 left-4 right-4">
                <p className="text-white text-center bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                  {stories[currentStoryIndex].caption}
                </p>
              </div>
            )}

            {/* Instagram-style Viewers Indicator at Bottom */}
            {stories[currentStoryIndex].user.id === session?.dbUser?.id && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Viewers button clicked for story:', stories[currentStoryIndex].id);
                    handleViewStoryViewers(stories[currentStoryIndex].id);
                  }}
                  className="px-4 py-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-all duration-200 shadow-lg pointer-events-auto"
                >
                  <span className="text-sm font-medium">story views</span>
                </button>
              </div>
            )}

            {/* Navigation Areas */}
            <div className="absolute inset-0 flex">
              <button className="flex-1 z-10" onClick={goToPrevStory} disabled={currentStoryIndex === 0}></button>
              <button className="flex-1 z-10" onClick={goToNextStory}></button>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-4 right-4 flex items-center justify-center gap-6 z-20">
            <button
              onClick={goToPrevStory}
              disabled={currentStoryIndex === 0}
              className="text-white hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition-all duration-200 shadow-lg"
            >
              <ChevronLeft size={24} />
            </button>

            {stories[currentStoryIndex].media_type === "video" && (
              <>
                <button 
                  onClick={togglePlayPause} 
                  className="text-white hover:text-purple-400 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition-all duration-200 shadow-lg"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button 
                  onClick={toggleMute} 
                  className="text-white hover:text-purple-400 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition-all duration-200 shadow-lg"
                >
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
              </>
            )}

            <button 
              onClick={goToNextStory} 
              className="text-white hover:text-purple-400 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition-all duration-200 shadow-lg"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Instagram-style Story Viewers Bottom Sheet */}
      {showBottomSheet && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 999999 }}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={closeBottomSheet}
            style={{ pointerEvents: showBottomSheet ? 'auto' : 'none' }}
          />
          
          {/* Bottom Sheet */}
          <div
            ref={bottomSheetRef}
            className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out pointer-events-auto border-t border-gray-700"
            style={{
              transform: `translateY(${Math.max(0, 200 - dragY)}px)`,
              height: `${Math.max(200, 400 - dragY)}px`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye size={20} className="text-gray-300" />
                  <h2 className="text-lg font-semibold text-white">
                    {storyViewers.length} {storyViewers.length === 1 ? 'viewer' : 'viewers'}
                  </h2>
                </div>
                <button 
                  onClick={closeBottomSheet}
                  className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingViewers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : storyViewers.length === 0 ? (
                <div className="text-center py-8">
                  <Eye size={48} className="mx-auto mb-3 text-gray-500" />
                  <p className="text-gray-400">No viewers yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {storyViewers.map((viewer) => (
                    <div key={viewer.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800 transition-colors">
                      <img 
                        src={viewer.avatar_url || '/default-avatar.png'} 
                        alt={viewer.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {viewer.name || viewer.username}
                        </p>
                        <p className="text-gray-400 text-sm truncate">
                          @{viewer.username}
                        </p>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(viewer.viewed_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;