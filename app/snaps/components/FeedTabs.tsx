"use client";
import { memo } from "react";
import { motion } from "framer-motion";

interface FeedTabsProps {
  activeTab: "FOR YOU" | "FOLLOWING" | "COMMUNITY";
  onTabChange: (tab: "FOR YOU" | "FOLLOWING" | "COMMUNITY") => void;
}

const FeedTabs = memo(({ activeTab, onTabChange }: FeedTabsProps) => {
  return (
    <div className="bg-gray-700/70 rounded-full mt-2 p-1">
      <div>
        <div
          style={{ zIndex: 999 }}
          className="flex justify-around bg-black m-1 p-1 items-center rounded-full relative"
        >
          {(["FOR YOU", "FOLLOWING", "COMMUNITY"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`p-2 mb-2 font-semibold w-full relative z-10 text-xs sm:text-sm ${
                activeTab === tab ? "text-white" : "text-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}

          <motion.div
            className="absolute rounded-full"
            style={{
              height: "40px",
              boxShadow:
                "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
              backgroundColor: "#6E54FF",
              margin: "6px",
            }}
            initial={false}
            animate={{
              left:
                activeTab === "FOR YOU"
                  ? "0%"
                  : activeTab === "FOLLOWING"
                  ? "calc(33.33% + 0px)"
                  : "calc(66.66% + 0px)",
              width: "calc(33.33% - 6px)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>
      </div>
    </div>
  );
});

FeedTabs.displayName = "FeedTabs";

export default FeedTabs;