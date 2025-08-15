'use client';

import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';

type Props = {
  onManageClick?: () => void;
};


export default function UserProfileCard({ onManageClick }: Props) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && session?.dbUser;

  console.log('🔍 UserProfileCard Debug:', {
    status,
    isLoggedIn,
    sessionDbUser: session?.dbUser,
    avatarUrl: session?.dbUser?.avatar_url,
    username: session?.dbUser?.username
  });

  
 const avatarUrl = isLoggedIn && session.dbUser?.avatar_url
  ? session.dbUser.avatar_url.replace(/_normal(\.\w+)$/, '_400x400$1')
  : '/4.png';

const coverUrl = isLoggedIn && session.dbUser?.avatar_url
  ? session.dbUser.avatar_url.replace(/_normal(\.\w+)$/, '_400x400$1')
  : '/4.png';

  const username = isLoggedIn ? session.dbUser.username : 'Guest';
  const bio = isLoggedIn ? session.dbUser.bio : 'Guest';

  return (
    <div className="group my-4 relative rounded-2xl border border-secondary/20 overflow-hidden bg-dark-800 transition-all duration-300 hover:shadow-xl hover:border-slate-600">
      
      {/* Cover Image with Overlay */}
      <div className="relative h-28 w-full overflow-hidden">
        <Image
          src={coverUrl || '/4.png'}
          alt="Cover"
          fill
          className='object-cover'
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        {/* Animated Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      </div>

      {/* User Info Area */}
      <div className="relative p-6 pb-4 pt-0">
        {/* Avatar Container */}
        <div className="flex flex-col items-center  rounded-md w-full p-2 -mt-10 relative z-10">
          <div className="relative bg-dark-800 mx-4 rounded-full border-t border-secondary/20">
            {/* Avatar Image */}
            <div className="relative w-16 h-16 rounded-full transition-all duration-300 group-hover:border-orange-500/60">
              <Image
                src={avatarUrl || '/4.png'}
                alt="Avatar"
                width={64}
                height={64}
                className="object-cover h-16 w-16 rounded-full"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = '/4.png';
                }}
              />
              
              {/* Online Status Indicator */}
              {isLoggedIn && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 shadow-lg"></div>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0 pt-4">
            <h3 className="text-white text-center font-bold text-sm truncate transition-colors duration-300 group-hover:text-orange-400">
              {username}
            </h3>
            <p className="text-xs text-center text-gray-400 truncate mt-0.5">
              @{isLoggedIn ? username?.toLowerCase() : 'guest'}
            </p>
            
         
          </div>
        </div>
      </div>
    </div>
  );
}