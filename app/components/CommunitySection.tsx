import { Users, Hash, ArrowLeft, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApi } from '../Context/ApiProvider';
import { CommunityMember } from '../types/api';
import { useRouter } from 'next/navigation';
import { CommunityProfileSettings } from './CommunityProfileSettings';

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
  const router = useRouter();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [justJoined, setJustJoined] = useState<string | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const selectedCommunityData = state.communities?.find((community: any) => community.id === selectedCommunity);

  const handleUserClick = (userId: string) => {
    // Store current page state and scroll position
    const currentState = {
      pathname: '/snaps',
      searchParams: 'page=communities',
      scrollY: window.scrollY,
      timestamp: Date.now()
    }
    
    // Store in sessionStorage for persistence across navigation
    sessionStorage.setItem('profileNavigationState', JSON.stringify(currentState))
    
    router.push(`/snaps/profile/${userId}`)
  };

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

  const handleJoin = (communityId: string) => {
    onJoinCommunity(communityId);
    setJustJoined(communityId);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000); // close popup after 2s
  };

  // Unified Community Card Component
  const CommunityCard = ({ community, isJoinSection = false }: { community: any, isJoinSection?: boolean }) => (
    <div
      className={`group p-4 rounded-xl transition-all duration-200 border w-full ${
        selectedCommunity === community.id && !isJoinSection
          ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 text-white shadow-lg' 
          : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-white'
      } ${!isJoinSection ? 'cursor-pointer' : ''}`}
      onClick={!isJoinSection ? () => handleCommunityClick(community.id) : undefined}
    >
      {/* Header Section */}
      <div className="flex items-center space-x-3 mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ${
          selectedCommunity === community.id && !isJoinSection 
            ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
            : 'bg-gradient-to-br from-purple-500 to-pink-500'
        }`}>
          {community.image_url ? (
            <img 
              src={community.image_url} 
              alt={community.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Hash className={`w-6 h-6 text-white ${community.image_url ? 'hidden' : ''}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">{community.name}</div>
          <div className="text-sm text-slate-400 line-clamp-2 leading-tight">{community.description}</div>
        </div>
      </div>

      {/* Admin Badge */}
      {community.user_is_admin && (
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">
            Admin
          </span>
        </div>
      )}

      {/* Footer Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <span className="text-xs text-slate-400 flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {community.member_count || 0} members
          </span>
          <span className="text-xs text-slate-400">
            Created by{' '}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (community.creator_id) {
                  handleUserClick(community.creator_id);
                }
              }}
              className="text-blue-400 hover:text-blue-300 hover:underline"
            >
              {community.creator_username || 'Unknown'}
            </button>
          </span>
        </div>
        
        {/* Action Button for Join Section */}
        {isJoinSection && (
          <div className="ml-3">
            {justJoined === community.id ? (
              <button
                disabled
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg cursor-not-allowed min-w-[70px]"
              >
                Joined
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoin(community.id);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 min-w-[70px]"
              >
                Join
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (showMembers && selectedCommunityData) {
    return (
      <div className="py-4">
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
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center overflow-hidden">
                {selectedCommunityData.profile_picture_url ? (
                  <img 
                    src={selectedCommunityData.profile_picture_url} 
                    alt={selectedCommunityData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <Hash className={`w-6 h-6 text-white ${selectedCommunityData.profile_picture_url ? 'hidden' : ''}`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{selectedCommunityData.name}</div>
                <div className="text-sm text-slate-400">{selectedCommunityData.description}</div>
              </div>
              {/* Always show settings button for debugging */}
              <button
                onClick={() => {
                  console.log('Opening community profile settings for:', selectedCommunityData.name);
                  console.log('showProfileSettings before:', showProfileSettings);
                  setShowProfileSettings(true);
                  console.log('showProfileSettings after:', true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors border border-gray-600 hover:border-gray-500"
                title="Community Profile Settings"
              >
                <Settings size={16} />
                <span className="text-xs">Settings</span>
              </button>
              
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-2">
                  <div>Is Admin: {selectedCommunityData.user_is_admin ? 'Yes' : 'No'}</div>
                  <div>Creator ID: {selectedCommunityData.creator_id}</div>
                  <div>Your ID: {session?.dbUser?.id}</div>
                  <div>Can Edit: {(selectedCommunityData.user_is_admin || selectedCommunityData.creator_id === session?.dbUser?.id) ? 'Yes' : 'No'}</div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {members.length} members
              </span>
              <span>Created by 
                <button
                  onClick={() => selectedCommunityData.creator_id && handleUserClick(selectedCommunityData.creator_id)}
                  className="ml-1 text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                >
                  {selectedCommunityData.creator_username || 'Unknown'}
                </button>
              </span>
            </div>
            
            {selectedCommunityData.user_is_admin && (
              <div className="mt-2">
                <span className="inline-block px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                  Admin
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white mb-3">Members</h3>
            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No members found</p>
              </div>
            ) : (
              members.map((member: CommunityMember) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleUserClick(member.user_id)}
                      className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      {member.avatar_url ? (
                        <img 
                          src={member.avatar_url} 
                          className='rounded-full w-8 h-8 object-cover' 
                          alt={member.username || 'Member'} 
                        />
                      ) : (
                        <span className="text-sm font-medium text-white">
                          {member.username?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </button>
                    <div>
                      <button
                        onClick={() => handleUserClick(member.user_id)}
                        className="font-medium text-white hover:text-blue-300 hover:underline cursor-pointer text-left"
                      >
                        {member.username}
                      </button>
                      <div className="text-xs text-slate-400">{member.bio || 'No bio'}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'Unknown'}
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
    <div className="py-4">
      <div className="mb-4">
        {communitySection === 'my' ? (
          <div className="space-y-3">
            {state.communities?.filter((community: any) => community.user_joined_at)?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Users className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm text-center">No communities yet<br />Join or create one!</p>
              </div>
            ) : (
              state.communities?.filter((community: any) => community.user_joined_at)?.map((community: any) => (
                <CommunityCard key={community.id} community={community} />
              ))
            )}
          </div>
        ) : communitySection === 'join' ? (
          <div className="space-y-3">
            {state.communities?.filter((community: any) => !community.user_joined_at)?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Users className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">No communities to discover</p>
              </div>
            ) : (
              state.communities?.filter((community: any) => !community.user_joined_at)?.map((community: any) => (
                <CommunityCard key={community.id} community={community} isJoinSection={true} />
              ))
            )}
          </div>
        ) : null}
        
        {/* Community Profile Settings Modal */}
        {showProfileSettings && selectedCommunity && (
          <CommunityProfileSettings
            communityId={selectedCommunity}
            onClose={() => {
              console.log('Closing community profile settings');
              setShowProfileSettings(false);
            }}
          />
        )}
        
        {/* Debug info for modal */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 text-xs rounded">
            <div>showProfileSettings: {showProfileSettings ? 'true' : 'false'}</div>
            <div>selectedCommunity: {selectedCommunity || 'null'}</div>
            <div>Modal should show: {(showProfileSettings && selectedCommunity) ? 'YES' : 'NO'}</div>
          </div>
        )}
      </div>
    </div>
  );
};