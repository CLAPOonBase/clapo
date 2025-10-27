import { Users, Hash } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CommunitySectionProps {
  communitySection: 'my' | 'join' | 'create';
  state: any;
  selectedCommunity: string | null;
  onSelectCommunity: (communityId: string) => void;
  onJoinCommunity: (communityId: string) => void;
}

export const CommunitySection = ({
  communitySection,
  state,
  selectedCommunity,
  onSelectCommunity,
  onJoinCommunity
}: CommunitySectionProps) => {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [justJoined, setJustJoined] = useState<string | null>(null);

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

  const handleCommunityClick = (communityId: string) => {
    onSelectCommunity(communityId);
  };

  const handleJoin = (communityId: string) => {
    onJoinCommunity(communityId);
    setJustJoined(communityId);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000); // close popup after 2s
  };

  // Redesigned Community Card - Horizontal layout matching personal chat
  const CommunityCard = ({ community, isJoinSection = false }: { community: any, isJoinSection?: boolean }) => {
    const isSelected = selectedCommunity === community.id && !isJoinSection;

    return (
      <div
        className={`w-full px-2.5 py-1.5 rounded-xl transition-all duration-200 border ${
          isSelected
            ? 'bg-gray-700/30 border-[#6e54ff] text-white'
            : 'border-transparent text-slate-300 hover:bg-gray-700/20 hover:text-white'
        } ${!isJoinSection ? 'cursor-pointer' : ''}`}
        onClick={!isJoinSection ? () => handleCommunityClick(community.id) : undefined}
      >
        {/* Header Section - Horizontal layout */}
        <div className="flex items-center space-x-2.5">
          {/* Community Image - Left side */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${
            isSelected
              ? 'bg-gradient-to-br from-purple-500 to-pink-500'
              : 'bg-slate-600'
          }`}>
            {community.profile_picture_url ? (
              <Image
                src={community.profile_picture_url}
                alt={community.name}
                width={36}
                height={36}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <Hash className={`w-5 h-5 text-white ${community.profile_picture_url ? 'hidden' : ''}`} />
          </div>

          {/* Community Info - Right side */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-semibold text-white truncate">
                {community.name}
              </span>
              {community.user_is_admin && (
                <span className="inline-block px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 rounded-full flex-shrink-0">
                  Admin
                </span>
              )}
            </div>
            <div className="text-sm text-slate-400 flex items-center leading-tight">
              <Users className="w-3 h-3 mr-1" />
              {community.member_count || 0} members
            </div>
          </div>
        </div>

        {/* Join Button - Below (only for join section) */}
        {isJoinSection && (
          <div className="mt-2 ml-11">
            {justJoined === community.id ? (
              <button
                disabled
                className="w-full px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg cursor-not-allowed"
              >
                Joined
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoin(community.id);
                }}
                className="w-full px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
              >
                Join
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

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
      </div>
    </div>
  );
};