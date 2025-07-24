"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ActivityItem } from "@/app/types";

type Props = {
  items: ActivityItem[];
};

const ITEMS_PER_PAGE = 2;

export default function ActivityFeed({ items }: Props) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleSeeLess = () => {
    setVisibleCount((prev) => Math.max(ITEMS_PER_PAGE, prev - ITEMS_PER_PAGE));
  };

  const isExpanded = visibleCount > ITEMS_PER_PAGE;

  return (
    <div className={`mx-4 w-72 rounded-md sticky top-0 bg-dark-800 p-4 transition-all overflow-y-hidden duration-300 ${isExpanded ? "h-[600px]" : "h-[400px]"}`}>
      <h2 className="text-xl font-bold mb-4 border-b">
        ACTIVITY FEED
      </h2>

      <div className="space-y-4 overflow-y-auto h-full pr-1">
        <AnimatePresence>
          {items.slice(0, visibleCount).map((item) => (
            <motion.div
              key={item.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={item.user.avatar}
                alt={item.user.name}
                width={40}
                height={40}
                className="rounded-full w-10 h-10 object-cover"
              />

              <div className="flex-1">
                <div className="text-sm">
                  <span className="font-semibold text-white">
                    {item.user.name}
                  </span>
                  <span className="text-gray-400 ml-1">
                    {item.type === "like"
                      ? "liked a post"
                      : item.type === "retweet"
                      ? "retweeted"
                      : "followed someone"}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {item.user.handle}
                </div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {item.user.bio}
                </div>
                <div className="text-xs text-gray-600 mt-1">{item.timestamp}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="text-center mt-6 space-x-4">
          {visibleCount < items.length && (
            <button
              onClick={handleSeeMore}
              className="text-blue-500 hover:text-blue-400 text-sm"
            >
              SEE MORE
            </button>
          )}
          {visibleCount > ITEMS_PER_PAGE && (
            <button
              onClick={handleSeeLess}
              className="text-red-500 hover:text-red-400 text-sm"
            >
              SEE LESS
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
