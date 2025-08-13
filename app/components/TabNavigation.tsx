import { MessageCircle, Users, Plus } from 'lucide-react';

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
  <>
    {/* Main Tabs */}
    <div className="flex space-x-2 p-1 rounded-lg">
      <button
        onClick={() => setActiveTab('dms')}
        className={`flex items-center space-x-2 py-2.5 justify-center transition-all duration-200 font-medium ${
          activeTab === 'dms' 
            ? 'border-b-2 border-primary text-white w-full' 
            : 'text-slate-400 hover:text-white hover:bg-slate-600/50 w-full'
        }`}
      >
        <MessageCircle className="w-4 h-4" />
        <span>DMs</span>
      </button>
      <button
        onClick={() => setActiveTab('communities')}
        className={`flex items-center space-x-2 py-2.5 justify-center transition-all duration-200 font-medium ${
          activeTab === 'communities' 
            ? 'border-b-2 border-primary text-white w-full' 
            : 'text-slate-400 hover:text-white hover:bg-slate-600/50 w-full'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>Communities</span>
      </button>
    </div>

    {/* Sub Tabs */}
    {activeTab === 'dms' && (
      <div className="flex space-x-2 mt-4 text-nowrap text-xs">
        <button
          onClick={() => setDmSection('threads')}
          className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
            dmSection === 'threads' 
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-600/30'
          }`}
        >
          My Chats
        </button>
        <button
          onClick={() => setDmSection('search')}
          className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
            dmSection === 'search' 
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-600/30'
          }`}
        >
          Find Users
        </button>
      </div>
    )}

    {activeTab === 'communities' && (
      <div className="flex items-center space-x-2 mt-4">
        <button
          onClick={() => setCommunitySection('my')}
          className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
            communitySection === 'my' 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-600/30'
          }`}
        >
          My Communities
        </button>
        <button
          onClick={() => setCommunitySection('join')}
          className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
            communitySection === 'join' 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-600/30'
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setShowCreateCommunityModal(true)}
          className="ml-auto p-1.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all duration-200 hover:scale-110"
          title="Create Community"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    )}
  </>
);