"use client";

import { motion } from "framer-motion";
import { MessageCircle, Users, Plus } from "lucide-react";

interface TabNavigationProps {
  activeTab: "dms" | "communities";
  setActiveTab: (tab: "dms" | "communities") => void;
  communitySection: "my" | "join" | "create";
  setCommunitySection: (section: "my" | "join" | "create") => void;
  setShowCreateCommunityModal: (show: boolean) => void;
}

export const TabNavigation = ({
  activeTab,
  setActiveTab,
  communitySection,
  setCommunitySection,
  setShowCreateCommunityModal,
}: TabNavigationProps) => {
  return (
    <div className="w-60">
      {/* Main Tabs - Fixed container */}
      <div className="bg-gray-700/50 rounded-full mb-0 p-0.5">
        <div>
          <div
            className="flex justify-around bg-black m-0.5 p-0.5 items-center rounded-full relative"
          >
            {[
              { key: "dms", label: "Personal", icon: <MessageCircle className="w-3 h-3" /> },
              { key: "communities", label: "Communities", icon: <Users className="w-3 h-3" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "dms" | "communities")}
                className={`py-1.5 my-0.5 font-semibold w-full relative z-10 text-sm ${
                  activeTab === tab.key ? "text-white" : "text-gray-400"
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Animated background highlight */}
            <motion.div
              className="absolute rounded-full"
              style={{
                height: "30px",
                boxShadow:
                  "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
                backgroundColor: "#6E54FF",
                margin: "4px",
              }}
              initial={false}
              animate={{
                left: activeTab === "dms" ? "0%" : "calc(50% + 0px)",
                width: "calc(50% - 4px)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>
        </div>
      </div>

      {/* Sub Navigation - Fixed height container to prevent layout shift */}
      <div className="flex items-center min-h-[28px]">
        {activeTab === "communities" && (
          <motion.div
            className="flex justify-start gap-2 mt-2 items-center w-full"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {[
              { key: "my", label: "Joined" },
              { key: "join", label: "Discover" },
            ].map((section) => (
              <button
                key={section.key}
                onClick={() => setCommunitySection(section.key as "my" | "join")}
                className={`relative px-2.5 py-1 text-sm font-medium whitespace-nowrap rounded-full transition-all duration-200 ${
                  communitySection === section.key
                    ? "text-white bg-gray-700/50 border border-gray-600/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
                }`}
              >
                {section.label}
              </button>
            ))}

            {/* Plus button */}
            <button
              onClick={() => setShowCreateCommunityModal(true)}
              className="px-1.5 py-1 rounded-full border border-gray-700/50 hover:bg-gray-700/30 text-gray-400 hover:text-white transition-all duration-200 ml-0.5 flex-shrink-0"
              title="Create Community"
            >
              <Plus className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};