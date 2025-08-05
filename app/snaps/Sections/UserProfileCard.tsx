'use client';

import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';

type Props = {
  onManageClick?: () => void;
};

export default function UserProfileCard({ onManageClick }: Props) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && session?.dbUser;

  const avatarUrl = isLoggedIn ? session.dbUser.avatarUrl : '/4.png';
  const coverUrl = isLoggedIn ? session.dbUser.avatarUrl : '/default-cover.svg';
  const username = isLoggedIn ? session.dbUser.username : 'Guest';
  const bio = isLoggedIn ? session.dbUser.bio : 'Guest';

  return (
    <div className="group relative rounded-2xl overflow-hidden mb-6 bg-dark-800 shadow-2xl transition-all duration-300 hover:shadow-xl hover:border-slate-600">
      
      {/* Cover Image with Overlay */}
      <div className="relative h-28 w-full overflow-hidden">
        <Image
          src={coverUrl || '/default-cover.svg'}
          alt="Cover"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        {/* Animated Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      </div>

      {/* User Info Area */}
      <div className="relative p-6 pt-0">
        {/* Avatar Container */}
        <div className="flex flex-col items-center  rounded-md w-full p-2 -mt-10 relative z-10">
          <div className="relative bg-dark-800 p-4 rounded-full border-t border-secondary/20">
            {/* Avatar Image */}
            <div className="relative w-10 h-10 rounded-full transition-all duration-300 group-hover:border-orange-500/60">
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={64}
                height={64}
                className="object-cover h-10 w-10"
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
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-center font-bold text-sm truncate transition-colors duration-300 group-hover:text-orange-400">
              {username}
            </h3>
            <p className="text-xs text-center text-gray-400 truncate mt-0.5">
              @{isLoggedIn ? username?.toLowerCase() : 'guest'}
            </p>
            <p className="text-xs text-wrap text-center text-gray-400 truncate mt-0.5">
              {isLoggedIn ? bio?.toLowerCase() : 'This is a guest profile'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => isLoggedIn ? onManageClick?.() : signIn()}
          className="relative mt-6 w-full h-12 rounded-xl font-semibold text-white overflow-hidden group/btn transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
        
          {/* Button Shine Effect */}
          {/* <div className="absolute inset-0 bg-primary to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div> */}
          
          {/* Button Content */}
          <div className="relative z-10 flex bg-primary text-sm items-center justify-center gap-2 h-full">
            {isLoggedIn ? (
              <>
              
                <span className='font-bold'>Manage Profile</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In</span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}