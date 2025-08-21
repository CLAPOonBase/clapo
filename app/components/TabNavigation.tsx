"use client";

import { motion } from "framer-motion";
import { MessageCircle, Users, Plus, Search } from "lucide-react";

interface TabNavigationProps {
  activeTab: "dms" | "communities";
  setActiveTab: (tab: "dms" | "communities") => void;
  dmSection: "threads" | "search";
  setDmSection: (section: "threads" | "search") => void;
  communitySection: "my" | "join" | "create";
  setCommunitySection: (section: "my" | "join" | "create") => void;
  setShowCreateCommunityModal: (show: boolean) => void;
}

export const TabNavigation = ({
  activeTab,
  setActiveTab,
  dmSection,
  setDmSection,
  communitySection,
  setCommunitySection,
  setShowCreateCommunityModal,
}: TabNavigationProps) => {
  const handleSearchClick = () => {
    // Switch to DMs tab if not already active
    if (activeTab !== "dms") {
      setActiveTab("dms");
    }
    // Switch to search section
    setDmSection("search");
  };

  return (
    <div
      className="bg-dark-800 mt-4 rounded-2xl space-y-4"
    >
      {/* Main Tabs */}
      <div className="relative flex justify-between items-center py-2 rounded-2xl">
        {[
          { key: "dms", label: "DM", icon: <MessageCircle className="w-4 h-4" /> },
          { key: "communities", label: "Communities", icon: <Users className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "dms" | "communities")}
            className={`flex items-center w-full justify-center py-2 font-medium relative z-10 ${
              activeTab === tab.key ? "text-white" : "text-secondary"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}

        {/* Animated background highlight */}
        <motion.div
          className="absolute h-[40px] rounded-full"
          style={{
            boxShadow:
              "0px 1px 0.5px 0px rgba(255,255,255,0.5) inset, 0px 1px 2px 0px rgba(110,84,255,0.5), 0px 0px 0px 1px #6E54FF",
            backgroundColor: "#6E54FF",
          }}
          initial={false}
          animate={{
            left: activeTab === "dms" ? "0%" : "50%",
            width: "50%",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </div>

      {/* Sub Navigation */}
      {activeTab === "dms" && (
        <div className="relative flex justify-between gap-2 items-center">
          {[
            { key: "threads", label: "My Chats" },
            { key: "search", label: "Find Users" },
          ].map((section) => (
            <button
              key={section.key}
              onClick={() => setDmSection(section.key as "threads" | "search")}
              className={`relative px-3 py-1 text-sm font-medium z-10 ${
                dmSection === section.key ? "text-white" : "text-slate-400"
              }`}
            >
              {section.label}
            </button>
          ))}

          {/* highlight bg for dms */}
          {/* <motion.div
            className="absolute top-0.5 h-[28px] rounded-lg"
            style={{
              boxShadow:
                "0px 1px 0.5px 0px rgba(255,255,255,0.5) inset, 0px 1px 2px 0px rgba(110,84,255,0.5), 0px 0px 0px 1px #6E54FF",
              backgroundColor: "#6E54FF",
            }}
            initial={false}
            animate={{
              left: dmSection === "threads" ? "2%" : "50%",
              width: "46%",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          /> */}

       
        </div>
      )}

      {activeTab === "communities" && (
        <div className="relative flex items-center justify-between w-full gap-2">
          {[
            { key: "my", label: "My Communities" },
            { key: "join", label: "Discover" },
          ].map((section) => (
            <button
              key={section.key}
              onClick={() => setCommunitySection(section.key as "my" | "join")}
              className={`relative px-3 py-1 text-sm font-medium z-10 ${
                communitySection === section.key ? "text-white" : "text-slate-400"
              }`}
            >
              {section.label}
            </button>
          ))}

          {/* highlight bg for communities */}
          {/* <motion.div
            className="absolute top-0.5 h-[28px] rounded-lg"
            style={{
              boxShadow:
                "0px 1px 0.5px 0px rgba(255,255,255,0.5) inset, 0px 1px 2px 0px rgba(110,84,255,0.5), 0px 0px 0px 1px #6E54FF",
              backgroundColor: "#6E54FF",
            }}
            initial={false}
            animate={{
              left: communitySection === "my" ? "2%" : "50%",
              width: "46%",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          /> */}

          {/* plus button */}
          <button
            onClick={() => setShowCreateCommunityModal(true)}
            className="px-2 py-1 rounded-lg border border-gray-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200 relative z-10"
            title="Create Community"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};