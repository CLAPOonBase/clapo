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
    <div className="w-full">
      {/* Main Tabs - Fixed container */}
      <div className="relative flex justify-between items-center py-2 rounded-2xl mb-3">
        {[
          { key: "dms", label: "Personal", icon: <MessageCircle className="w-4 h-4" /> },
          { key: "communities", label: "Communities", icon: <Users className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "dms" | "communities")}
            className={`flex items-center w-full justify-center py-2 gap-2 font-medium relative z-10 ${
              activeTab === tab.key ? "text-white" : "text-secondary"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}

        {/* Animated background highlight */}
        <motion.div
          className="left-0 absolute h-[30px] rounded-full"
          style={{
            boxShadow:
              "0px 1px 0.5px 0px rgba(255,255,255,0.5) inset, 0px 1px 2px 0px rgba(110,84,255,0.5), 0px 0px 0px 1px #6E54FF",
            backgroundColor: "#6E54FF",
          }}
          initial={false}
          animate={{
            left: activeTab === "dms" ? "5%" : "60%",
            width: "40%",
          }}
          
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </div>

      {/* Sub Navigation - Fixed height container to prevent layout shift */}
      <div className=" flex items-center">
        {activeTab === "communities" && (
          <motion.div 
            className="flex justify-start gap-2 items-center w-full"
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
                className={`relative px-3 py-1 text-sm font-medium whitespace-nowrap ${
                  communitySection === section.key ? "text-white bg-dark-700 rounded-full" : "text-slate-400"
                }`}
              >
                {section.label}
              </button>
            ))}

            {/* Plus button */}
            <button
              onClick={() => setShowCreateCommunityModal(true)}
              className="px-2 py-1 rounded-lg border border-gray-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200 ml-2 flex-shrink-0"
              title="Create Community"
            >
              <Plus className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};