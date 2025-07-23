'use client';

import { useState } from 'react';
import { OpinionCard } from './OpinionCard';
import { Opinion } from '@/app/types';
import { mockOpinions } from '@/app/lib/mockdata';
import { Search } from 'lucide-react';

const navItems = [
  { label: 'TRENDING' },
  { label: 'NEW' },
  { label: 'POLITICS' },
  { label: 'SPORTS' },
  { label: 'CRYPTO' },
  { label: 'TECH' },
  { label: 'CELEBRITY' },
  { label: 'WORLD' },
  { label: 'ECONOMY' },
  { label: 'TRUMP' },
  { label: 'ELECTIONS' },
  { label: 'MENTIONS' }
];

export default function MainVoting() {
  const [opinions] = useState<Opinion[]>(mockOpinions);
  const [selectedCategory, setSelectedCategory] = useState<string>('TRENDING');

  const filteredOpinions = opinions.filter((opinion) => {
    if (selectedCategory === 'TRENDING') {
      return opinion.totalVotes > 1000;
    }
    if (selectedCategory === 'NEW') {
      const createdAt = new Date(opinion.createdAt);
      const now = new Date();
      const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      return diffInHours <= 72; // opinions from the last 3 days
    }
    return opinion.category === selectedCategory;
  });

  return (
    <div className="space-y-6 p-6">
        <div>
 <div className="flex space-x-6 justify-center items-center border-b border-secondary-light/10 overflow-x-auto">
        {navItems.map(({ label }) => (
          <button
            key={label}
            onClick={() => setSelectedCategory(label)}
            className={`pb-2 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === label
                ? 'text-primary border-b-2 border-primary'
                : 'text-secondary hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
        
      </div>
      <div className='w-full mt-4 flex justify-center items-center px-4 rounded-md bg-dark-800'>
        <Search className='text-secondary'/>
      <input type="search" name="" id="" placeholder='Search Market' className='w-full p-2 bg-transparent' />
      </div>
        </div>
     
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpinions.length > 0 ? (
          filteredOpinions.map((opinion) => (
            <OpinionCard key={opinion.id} opinion={opinion} />
          ))
        ) : (
          <p className="text-center col-span-full text-secondary">No opinions found in this category.</p>
        )}
      </div>
    </div>
  );
}
