"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Play, Pause, Volume2, VolumeX } from "lucide-react";

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
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
    // ... rest of your stories here
  ];

  useEffect(() => {
    setStories(sampleStories);
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

  return (
    <div style={{ zIndex: 99999 }} className="w-full">
      {/* Stories Grid */}
      <div
        className={`flex gap-3 p-4 ${
          stories.length > 6 ? "overflow-x-auto scrollbar-hide" : "overflow-x-hidden scrollbar-hide"
        }`}
      >
        {stories.map((story, index) => (
          <div key={story.id} className="flex-shrink-0 cursor-pointer" onClick={() => openStory(index)}>
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <img
                    src={story.avatar}
                    alt={story.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-center mt-1 truncate w-20">{story.username}</p>
          </div>
        ))}
      </div>

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
                src={stories[currentStoryIndex].avatar}
                alt={stories[currentStoryIndex].username}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-white font-semibold text-sm">{stories[currentStoryIndex].username}</p>
                <p className="text-gray-300 text-xs">{formatTimeAgo(stories[currentStoryIndex].created_at)}</p>
              </div>
            </div>
            <button onClick={closeStory} className="text-white hover:text-gray-300">
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
              <div className="absolute bottom-20 left-4 right-4">
                <p className="text-white text-center bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                  {stories[currentStoryIndex].content}
                </p>
              </div>
            )}

            {/* Navigation Areas */}
            <div className="absolute inset-0 flex">
              <button className="flex-1 z-10" onClick={goToPrevStory} disabled={currentStoryIndex === 0}></button>
              <button className="flex-1 z-10" onClick={goToNextStory}></button>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-4 z-20">
            <button
              onClick={goToPrevStory}
              disabled={currentStoryIndex === 0}
              className="text-white hover:text-gray-300 disabled:opacity-50"
            >
              <ChevronLeft size={24} />
            </button>

            {isVideo(stories[currentStoryIndex]) && (
              <>
                <button onClick={togglePlayPause} className="text-white hover:text-gray-300">
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button onClick={toggleMute} className="text-white hover:text-gray-300">
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
              </>
            )}

            <button onClick={goToNextStory} className="text-white hover:text-gray-300">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
