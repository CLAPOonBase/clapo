"use client";
import { memo } from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner = memo(({ size = "md", className = "" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-gray-600 border-t-purple-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";

interface PostSkeletonProps {
  className?: string;
}

const PostSkeleton = memo(({ className = "" }: PostSkeletonProps) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-700">
        {/* User header */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/6"></div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 mb-4">
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-4/5"></div>
          <div className="h-4 bg-gray-700 rounded w-3/5"></div>
        </div>

        {/* Image placeholder */}
        <div className="h-48 bg-gray-700 rounded-lg mb-4"></div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-6">
            <div className="w-8 h-8 bg-gray-700 rounded"></div>
            <div className="w-8 h-8 bg-gray-700 rounded"></div>
            <div className="w-8 h-8 bg-gray-700 rounded"></div>
          </div>
          <div className="w-8 h-8 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
});

PostSkeleton.displayName = "PostSkeleton";

interface PageLoadingProps {
  message?: string;
}

const PageLoading = memo(({ message = "Loading..." }: PageLoadingProps) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white">
      <LoadingSpinner size="lg" />
      <motion.p
        className="mt-4 text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {message}
      </motion.p>
    </div>
  );
});

PageLoading.displayName = "PageLoading";

export { LoadingSpinner, PostSkeleton, PageLoading };