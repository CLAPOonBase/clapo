"use client";

import Link from "next/link";
import Image from "next/image";
import { Opinion } from "@/app/types";
import { formatNumber } from "@/app/lib/mockdata";

interface OpinionCardProps {
  opinion: Opinion;
}

export const OpinionCard: React.FC<OpinionCardProps> = ({ opinion }) => {
  return (
    <div className="bg-black rounded-lg p-4 border border-secondary-light/10 hover:border-primary/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-black border border-secondary/50 rounded-md">
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
          <span className="text-secondary">
            CUT {opinion.cutBasisPoints}BPS
          </span>
          <span className="text-white">{opinion.cutBasisPoints}</span>
        </div>
      </div>

      <Link href={`/opinio/${opinion.slug}`}>
        <button
 
        className="inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-[6px] transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-[hsla(220,10%,12%,1)] text-white shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(0,0,0,0.08),0px_0px_0px_1px_#000] hover:bg-[hsla(220,10%,18%,1)] px-3 py-1.5 text-xs rounded-full leading-[24px] font-bold w-full sm:w-auto whitespace-nowrap">
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
            />{" "}
            <Image
              src="/verified.svg"
              alt="clapo logo"
              width={1000}
              height={1000}
              className="w-auto h-2 px-1"
            />
          </div>
        </span>
      </div>
    </div>
  );
};
