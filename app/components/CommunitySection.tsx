import { Users, Hash, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApi } from '../Context/ApiProvider';
import { CommunityMember } from '../types/api';

interface CommunitySectionProps {
  communitySection: 'my' | 'join' | 'create';
  state: any;
  session: any;
  selectedCommunity: string | null;
  onSelectCommunity: (communityId: string) => void;
  onJoinCommunity: (communityId: string) => void;
}

export const CommunitySection = ({
  communitySection,
  state,
  session,
  selectedCommunity,
  onSelectCommunity,
  onJoinCommunity
}: CommunitySectionProps) => {
  const { getCommunityMembers } = useApi();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const selectedCommunityData = state.communities?.find((community: any) => community.id === selectedCommunity);

  useEffect(() => {
    if (selectedCommunity && showMembers) {
      fetchMembers();
    }
  }, [selectedCommunity, showMembers]);

  const fetchMembers = async () => {
    if (!selectedCommunity) return;
    
    setLoadingMembers(true);
    try {
      console.log('🔍 Fetching members for community:', selectedCommunity);
      const response = await getCommunityMembers(selectedCommunity);
      console.log('🔍 Community members response:', response);
      setMembers(response.members || []);
      console.log('🔍 Set members:', response.members || []);
    } catch (error) {
      console.error('Failed to fetch community members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCommunityClick = (communityId: string) => {
    onSelectCommunity(communityId);
    setShowMembers(true);
  };

  const handleBackToCommunities = () => {
    setShowMembers(false);
    onSelectCommunity('');
  };

  if (showMembers && selectedCommunityData) {
    return (
      <div className="p-4">
        <div className="mb-4">
          <button
            onClick={handleBackToCommunities}
            className="flex items-center text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Communities
          </button>
          
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{selectedCommunityData.name}</div>
                <div className="text-sm text-slate-400">{selectedCommunityData.description}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {members.length} members
              </span>
              <span>Created by {selectedCommunityData.creator_username || 'Unknown'}</span>
            </div>
            <button
              onClick={() => {
                setShowMembers(false);
                onSelectCommunity(selectedCommunity);
              }}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
            >
              Start Chat
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white mb-3">Members</h3>
            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Users className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No members found</p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      {member.avatar_url ? (
                        <img 
                          src={member.avatar_url} 
                          alt={member.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {member.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{member.username}</div>
                      <div className="text-xs text-slate-400 truncate">{member.bio || 'No bio'}</div>
                    </div>
                    <div className="flex flex-col items-end text-xs text-slate-400">
                      <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                      {member.is_admin && (
                        <span className="text-purple-400 font-medium">Admin</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        {communitySection === 'my' ? (
          <div className="space-y-2">
            {state.communities?.filter((community: any) => community.user_joined_at)?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Users className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm text-center">No communities yet<br />Join or create one!</p>
              </div>
            ) : (
              state.communities?.filter((community: any) => community.user_joined_at)?.map((community: any) => (
                <div
                  key={community.id}
                  onClick={() => handleCommunityClick(community.id)}
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                    selectedCommunity === community.id 
                      ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 text-white shadow-lg' 
                      : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      selectedCommunity === community.id ? 'bg-purple-500' : 'bg-slate-600 group-hover:bg-slate-500'
                    }`}>
                      <Hash className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{community.name}</div>
                      <div className="text-xs opacity-70 truncate">{community.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs opacity-60">
                    <span>Created by {community.creator_username || 'Unknown'}</span>
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {community.member_count || 0}
                    </span>
                  </div>
                  {community.user_is_admin && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                        Admin
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : communitySection === 'join' ? (
          <div className="space-y-2">
            {state.communities?.filter((community: any) => !community.user_joined_at)?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Users className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">No communities to discover</p>
              </div>
            ) : (
              state.communities?.filter((community: any) => !community.user_joined_at)?.map((community: any) => (
                <div
                  key={community.id}
                  className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Hash className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white">{community.name}</div>
                      <div className="text-sm text-slate-400 truncate">{community.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {community.member_count || 0} members
                    </span>
                    <button
                      onClick={() => onJoinCommunity(community.id)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};