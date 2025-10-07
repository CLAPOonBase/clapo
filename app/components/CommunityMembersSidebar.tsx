'use client';

import { useState, useEffect } from 'react';
import { Users, Hash } from 'lucide-react';
import { useApi } from '../Context/ApiProvider';
import { CommunityMember } from '../types/api';
import { useRouter } from 'next/navigation';

interface CommunityMembersSidebarProps {
  communityId: string;
  communityData: any;
}

export const CommunityMembersSidebar = ({ communityId, communityData }: CommunityMembersSidebarProps) => {
  const { getCommunityMembers } = useApi();
  const router = useRouter();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (communityId) {
      fetchMembers();
    }
  }, [communityId]);

  const fetchMembers = async () => {
    if (!communityId) return;

    setLoadingMembers(true);
    try {
      const response = await getCommunityMembers(communityId);
      setMembers(response.members || []);
    } catch (error) {
      console.error('Failed to fetch community members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleUserClick = (userId: string) => {
    const currentState = {
      pathname: '/snaps',
      searchParams: 'page=communities',
      scrollY: window.scrollY,
      timestamp: Date.now()
    };
    sessionStorage.setItem('profileNavigationState', JSON.stringify(currentState));
    router.push(`/snaps/profile/${userId}`);
  };

  if (!communityData) {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Community Info Box - Matching personal chat style */}
      <div className="border-2 border-gray-700/70 rounded-2xl p-4">
        <div className="text-center mb-4">
          <img
            src={communityData.profile_picture_url || '/4.png'}
            alt={communityData.name}
            className="w-16 h-16 rounded-full object-cover mx-auto mb-3"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/4.png';
            }}
          />
          <h3 className="text-base font-semibold text-white mb-1">
            {communityData.name}
          </h3>
          <p className="text-sm text-gray-400 mb-2">
            Community
          </p>

          <div className="space-y-1.5">
            {communityData.user_is_admin && (
              <div className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full text-sm inline-block">
                Admin
              </div>
            )}
            <p className="text-sm text-green-400">
              {members.length} members
            </p>
            {communityData.creator_username && (
              <p className="text-sm text-gray-500">
                Created by{' '}
                <button
                  onClick={() => communityData.creator_id && handleUserClick(communityData.creator_id)}
                  className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                  @{communityData.creator_username}
                </button>
              </p>
            )}
          </div>
        </div>

        {communityData.description && (
          <div className="border-t border-gray-700/30 pt-3">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              {communityData.description}
            </p>
          </div>
        )}

        {/* Members Section */}
        <div className="border-t border-gray-700/30 pt-3 mt-3">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Members</h4>

          {loadingMembers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No members found</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {members.map((member: CommunityMember) => (
                <div
                  key={member.id}
                  onClick={() => handleUserClick(member.user_id)}
                  className="flex items-center space-x-2.5 p-2 hover:bg-gray-700/30 rounded-lg transition-all duration-200 cursor-pointer group"
                >
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        className="rounded-full w-8 h-8 object-cover"
                        alt={member.username || 'Member'}
                      />
                    ) : (
                      <span className="text-sm font-medium text-white">
                        {member.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                      {member.username}
                    </div>
                    {member.bio && (
                      <div className="text-sm text-gray-400 line-clamp-1">{member.bio}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
