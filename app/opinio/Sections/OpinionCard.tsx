'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Opinion } from '@/app/types';
import { formatNumber } from '@/app/lib/mockdata';

interface OpinionCardProps {
  opinion: Opinion;
}

export const OpinionCard: React.FC<OpinionCardProps> = ({ opinion }) => {
  return (
    <div className="bg-dark-800 rounded-lg p-4 border border-secondary-light/10 hover:border-primary/30">
      
    

      <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
        <Image
          src={opinion.image}
          alt={opinion.title}
          width={100}
          height={100}
          className=""
        />
      </div>
    
        <h3 className="text-white font-medium text-sm">{opinion.title}</h3>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-secondary">FED PRINTING RATE</span>
          <span className="text-white">{opinion.currentRate}%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-secondary">CUT {opinion.cutBasisPoints}BPS</span>
          <span className="text-white">{opinion.cutBasisPoints}</span>
        </div>
      </div>
      
      <Link href={`/opinio/${opinion.slug}`}>
        <button className="w-full bg-primary hover:bg-primary-light transition-colors text-white font-medium py-2.5 rounded text-sm mb-3">
          CAST YOUR OPINION
        </button>
      </Link>
      
      <div className="flex justify-between items-center text-xs text-secondary">
        <span>{formatNumber(opinion.totalVotes)} votes</span>
        <span>
            <div className="flex justify-center items-center">
         <span className="text-secondary">Market By</span>
                <Image
                  src="/navlogo.png"
                  alt="clapo logo"
                  width={1000}
                  height={1000}
                  className="w-auto h-4"
                /> <Image
                  src="/verified.svg"
                  alt="clapo logo"
                  width={1000}
                  height={1000}
                  className="w-auto h-2 px-1"
                />
                </div></span>
      </div>
    </div>
  );
};
