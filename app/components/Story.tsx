"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Play, Pause, Volume2, VolumeX, Plus, Camera, Image } from "lucide-react";

type Story = {
  id: string;
  content: string;
  media_url: string;
  created_at: string;
  username: string;
  avatar: string;
  type: "video" | "image";
};

const Stories: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Add story form state
  const [newStoryContent, setNewStoryContent] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const sampleStories: Story[] = [
    {
      id: "f58a7695-b61a-462a-ab03-48edb729599",
      content: "For a reason",
      media_url:
        "https://snappostmedia.s3.ap-southeast-1.amazonaws.com/ed7ee794-9ba2-450d-b47f-3328052d9195/1756492371197-kavulkkglg.mp4",
      created_at: "2025-08-29T18:33:18.682Z",
      username: "BajjuHydra",
      avatar:
        "https://snappostmedia.s3.ap-southeast-1.amazonaws.com/ed7ee794-9ba2-450d-b47f-3328052d9195/1756827650755-28btl0haa0j.png",
      type: "video",
    },
    {
      id: "cb517203-c5ab-4ede-819d-8e5a1b96a7",
      content: "Clapo Logo",
      media_url:
        "https://snappostmedia.s3.ap-southeast-1.amazonaws.com/ed7ee794-9ba2-450d-b47f-3328052d9195/1756050279194-poyje5aehw.webp",
      created_at: "2025-08-24T15:44:49.079Z",
      username: "BajjuHydra",
      avatar:
        "https://snappostmedia.s3.ap-southeast-1.amazonaws.com/ed7ee794-9ba2-450d-b47f-3328052d9195/1756827650755-28btl0haa0j.png",
      type: "image",
    },
  ];

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
    // Load stories from localStorage and combine with sample stories
    const localStories = loadStoriesFromStorage();
    const validSampleStories = filterExpiredStories(sampleStories);
    const allStories = [...localStories, ...validSampleStories];
    setStories(allStories);

    // Clean up expired stories from localStorage
    if (localStories.length > 0) {
      saveStoriesToStorage(localStories);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isModalOpen && isPlaying) {
      const currentStory = stories[currentStoryIndex];
      const duration = currentStory?.type === "video" ? 15000 : 5000;

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
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isModalOpen, isPlaying, currentStoryIndex, stories]);

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

  const isVideo = (story: Story) => story.type === "video";

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
        {/* Add Story Button */}
        <div className="flex-shrink-0 cursor-pointer group" onClick={openAddModal}>
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 group-hover:border-purple-500 shadow-lg">
              <Plus size={24} className="text-gray-400 group-hover:text-purple-400 transition-colors duration-200" />
            </div>
          </div>
          <p className="text-xs text-center mt-2 truncate w-20 text-gray-400 group-hover:text-white transition-colors duration-200">Add Story</p>
        </div>

        {/* Existing Stories */}
        {stories.map((story, index) => (
          <div key={story.id} className="flex-shrink-0 cursor-pointer group" onClick={() => openStory(index)}>
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[2px] shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <div className="w-full h-full rounded-full bg-black p-[2px]">
                  <img
                    src="https://snappostmedia.s3.ap-southeast-1.amazonaws.com/ed7ee794-9ba2-450d-b47f-3328052d9195/1756827650755-28btl0haa0j.png"
                    alt={story.username}
                    className="w-full h-full rounded-full object-cover"
                    onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${story.username}` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-center mt-2 truncate w-20 text-secondary group-hover:text-white transition-colors duration-200">{story.username}</p>
          </div>
        ))}
      </div>

      {/* Add Story Modal */}
      {isAddModalOpen && (
        <div style={{ zIndex: 99999 }} className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="shadow-custom border-2 border-gray-700 rounded-3xl bg-black max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Add Story</h2>
                <button onClick={closeAddModal} className="text-gray-400 hover:text-gray-200 transition-colors duration-200">
                  <X size={24} />
                </button>
              </div>

              {/* File Input */}
              <div className="mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-600 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-purple-500 hover:bg-gray-800/50 transition-all duration-200"
                >
                  {selectedFile ? (
                    <div className="text-center">
                      {selectedFile.type.startsWith('video/') ? (
                        <Camera size={48} className="text-purple-500 mx-auto mb-3" />
                      ) : (
                        <Image size={48} className="text-purple-500 mx-auto mb-3" />
                      )}
                      <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400 mt-1">Click to change</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Plus size={48} className="text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-300">Select Image or Video</p>
                      <p className="text-xs text-gray-500 mt-1">Click to browse files</p>
                    </div>
                  )}
                </button>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3 text-gray-300">Preview:</p>
                  <div className="border border-gray-700 rounded-2xl overflow-hidden shadow-lg">
                    {selectedFile?.type.startsWith('video/') ? (
                      <video src={previewUrl} className="w-full h-48 object-cover" controls />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                    )}
                  </div>
                </div>
              )}

              {/* Content Input */}
              <div className="mb-8">
                <label className="block text-sm font-medium mb-3 text-gray-300">Caption (optional)</label>
                <textarea
                  value={newStoryContent}
                  onChange={(e) => setNewStoryContent(e.target.value)}
                  placeholder="Write a caption for your story..."
                  className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={closeAddModal}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-2xl hover:bg-gray-800/50 hover:text-white transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStory}
                  disabled={!selectedFile}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all duration-200 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed shadow-lg"
                >
                  Add Story
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Modal */}
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
              <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden shadow-lg">
                <img
                  src={stories[currentStoryIndex].avatar}
                  alt={stories[currentStoryIndex].username}
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${stories[currentStoryIndex].username}` }}
                />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{stories[currentStoryIndex].username}</p>
                <p className="text-gray-300 text-sm">{formatTimeAgo(stories[currentStoryIndex].created_at)}</p>
              </div>
            </div>
            <button 
              onClick={closeStory} 
              className="text-white hover:text-gray-300 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-200"
            >
              <X size={24} />
            </button>
          </div>

          {/* Story Content */}
          <div className="relative w-full h-full flex items-center justify-center">
            {isVideo(stories[currentStoryIndex]) ? (
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

            {stories[currentStoryIndex].content && (
              <div className="absolute bottom-28 left-4 right-4">
                <div className="bg-black bg-opacity-70 backdrop-blur-sm px-4 py-3 rounded-2xl border border-gray-700/50 shadow-lg">
                  <p className="text-white text-center text-base leading-relaxed">
                    {stories[currentStoryIndex].content}
                  </p>
                </div>
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

            {isVideo(stories[currentStoryIndex]) && (
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
    </div>
  );
};

export default Stories;