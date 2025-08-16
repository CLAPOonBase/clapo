import { motion } from 'framer-motion';
import { MessageCircle, Users, Plus, Search } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'dms' | 'communities';
  setActiveTab: (tab: 'dms' | 'communities') => void;
  dmSection: 'threads' | 'search';
  setDmSection: (section: 'threads' | 'search') => void;
  communitySection: 'my' | 'join' | 'create';
  setCommunitySection: (section: 'my' | 'join' | 'create') => void;
  setShowCreateCommunityModal: (show: boolean) => void;
}

export const TabNavigation = ({
  activeTab,
  setActiveTab,
  dmSection,
  setDmSection,
  communitySection,
  setCommunitySection,
  setShowCreateCommunityModal
}: TabNavigationProps) => (
  <div className="space-y-4">
    {/* Main Tabs */}
  <div className="relative flex gap-1 p-1 text-sm">
      {/* Messages */}
      <button
        onClick={() => setActiveTab("dms")}
        className={`relative flex items-center justify-center gap-2 py-3 px-4 font-medium flex-1 ${
          activeTab === "dms" ? "text-primary" : "text-secondary"
        }`}
      >
        <MessageCircle className="w-4 h-4" />
        <span>Messages</span>
        {activeTab === "dms" && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </button>

      {/* Communities */}
      <button
        onClick={() => setActiveTab("communities")}
        className={`relative flex items-center justify-center gap-2 py-3 px-4 font-medium flex-1 ${
          activeTab === "communities" ? "text-primary" : "text-secondary"
        }`}
      >
        <Users className="w-4 h-4" />
        <span>Communities</span>
        {activeTab === "communities" && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </button>
    </div>

    {/* Sub Navigation */}
    <div>
      {activeTab === "dms" && (
        <div className="relative flex justify-between gap-2 rounded-full w-full text-nowrap">
          <button
            onClick={() => setDmSection("threads")}
            className={`relative px-2 rounded-lg text-sm font-medium z-10 ${
              dmSection === "threads" ? "text-white" : "text-slate-400"
            }`}
          >
            My Chats
            {dmSection === "threads" && (
              <motion.div
                layoutId="dmSection"
                className="absolute inset-0 border border-secondary rounded-lg"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => setDmSection("search")}
            className={`relative px-2 rounded-lg text-sm font-medium z-10 ${
              dmSection === "search" ? "text-white" : "text-slate-400"
            }`}
          >
            Find Users
            {dmSection === "search" && (
              <motion.div
                layoutId="dmSection"
                className="absolute inset-0 border border-secondary rounded-lg"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
             
          </button>
          <div className='w-full flex justify-end'>
            <div className='px-2 flex items-center rounded-full border border-gray-800'>
                 <Search className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </div>

    {activeTab === 'communities' && (
      <div className="flex items-center justify-between w-full gap-2">
        <div className="flex gap-2 flex-1">
          <button
            onClick={() => setCommunitySection('my')}
            className={`px-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              communitySection === 'my'
                ? 'border text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            My Communities
          </button>
          <button
            onClick={() => setCommunitySection('join')}
            className={`px-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              communitySection === 'join'
                ? 'border text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Discover
          </button>
        </div>
        <button
          onClick={() => setShowCreateCommunityModal(true)}
          className="px-2 rounded-lg border hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200"
          title="Create Community"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    )}
  </div>
);