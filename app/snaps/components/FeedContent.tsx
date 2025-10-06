"use client";
import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SnapCard from "../Sections/SnapCard";
import { PostSkeleton } from "../../components/LoadingComponents";
import type { ApiPost } from "../../types";

interface FeedContentProps {
  activeTab: "FOR YOU" | "FOLLOWING" | "COMMUNITY";
  allPosts: ApiPost[];
  followingPosts: ApiPost[];
  isLoadingPosts: boolean;
  isLoadingFollowing: boolean;
  status: "loading" | "authenticated" | "unauthenticated";
  liked: Set<number>;
  retweeted: Set<number>;
  bookmarked: Set<number>;
  onLike: (id: string | number) => void;
  onRetweet: (id: string | number) => void;
  onBookmark: (id: string | number) => void;
}

const FeedContent = memo(({
  activeTab,
  allPosts,
  followingPosts,
  isLoadingPosts,
  isLoadingFollowing,
  status,
  liked,
  retweeted,
  bookmarked,
  onLike,
  onRetweet,
  onBookmark,
}: FeedContentProps) => {
  const renderPostCard = (post: ApiPost) => (
    <SnapCard
      key={post.id}
      post={post}
      liked={liked.has(parseInt(post.id))}
      bookmarked={bookmarked.has(parseInt(post.id))}
      retweeted={retweeted.has(parseInt(post.id))}
      onLike={onLike}
      onBookmark={onBookmark}
      onRetweet={onRetweet}
    />
  );

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );

  return (
    <div className="mt-2 pt-2 rounded-2xl">
      <div className="">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0, y: -30 }}
            exit={{ opacity: 0, x: activeTab === "FOR YOU" ? 40 : -40 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {activeTab === "FOR YOU" && (
              isLoadingPosts ? (
                renderLoadingSkeleton()
              ) : allPosts.length > 0 ? (
                allPosts.map(renderPostCard)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {status === "authenticated" ? (
                    renderLoadingSkeleton()
                  ) : (
                    "Sign in to see posts"
                  )}
                </div>
              )
            )}

            {activeTab === "FOLLOWING" && (
              isLoadingFollowing ? (
                renderLoadingSkeleton()
              ) : followingPosts.length > 0 ? (
                followingPosts.map(renderPostCard)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {status === "authenticated"
                    ? "No posts from people you follow yet. Try following some users!"
                    : "Sign in to see posts"}
                </div>
              )
            )}

            {activeTab === "COMMUNITY" && (
              <div className="text-center py-8 text-gray-500">
                Community features coming soon!
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

FeedContent.displayName = "FeedContent";

export default FeedContent;