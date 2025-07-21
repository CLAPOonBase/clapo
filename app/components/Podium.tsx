'use client';
import React from 'react';
import Image from 'next/image';

type LeaderboardUser = {
  name: string;
  username: string;
  avatar: string;
};

type PodiumProps = {
  leaderboard?: LeaderboardUser[];
};

const PodiumComponent: React.FC<PodiumProps> = ({ leaderboard = [] }) => {
  const top3 = leaderboard.slice(0, 3);
  const podiumOrder =
    top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  const getPodiumPosition = (index: number) => {
    if (podiumOrder.length < 3) return index + 1;
    return index === 0 ? 2 : index === 1 ? 1 : 3;
  };

  const getPodiumHeight = (position: number) => {
    switch (position) {
      case 1:
        return 'pt-5';
      case 2:
        return 'pt-3';
      case 3:
        return 'pt-1';
      default:
        return 'pt-3';
    }
  };

  const getPodiumColor = () =>
    'bg-[linear-gradient(180deg,_#252C41_0%,_#0F1118_37.37%,_#0E0F15_82.23%)]';

  if (!top3.length) {
    return (
      <div className="text-center text-[#A0A0A0]">
        No leaderboard data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="podium-container podium-size mt-36 grid place-items-center">
        <div className="podium grid grid-cols-3 items-end gap-3 text-center font-black podium-size">
          {podiumOrder.map((user, index) => {
            const position = getPodiumPosition(index);
            const isCenter = position === 1;

            return (
              <div
                key={user.name}
                className={`
                  podium-item podium-front relative px-5 pb-3 text-base sm:text-2xl text-white lg:text-4xl
                  ${getPodiumColor()} 
                  ${getPodiumHeight(position)}
                  ${index === 0 ? 'podium-left' : ''}
                  ${isCenter ? 'podium-center podium-center-after' : ''}
                  ${index === 2 ? 'podium-right' : ''}
                `}
              >
<div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-10 h-10">
  <img
    src="/bg.svg"
    alt="Avatar background"
    className="absolute inset-0 w-full h-full rotate-[15deg] scale-125"
  />
  <Image
    src={user.avatar}
    alt={user.name}
    width={1000}
    height={1000}
    className="rounded-full w-10 h-10 bg-black absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
  />
</div>


                <div className="mt-12 font-bold tracking-widest text-sm sm:text-base">
                  {user.name}
                 
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* <div className="mt-16 text-center space-y-4 px-4">
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto text-xs sm:text-sm text-[#A0A0A0] font-mono">
          {podiumOrder.map((user) => (
            <div key={`username-${user.name}`}>{user.username}</div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default PodiumComponent;
