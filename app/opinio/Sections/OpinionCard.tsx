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
    <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A] hover:border-[#6E54FF]/30 transition-all duration-200 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)] hover:shadow-[0px_8px_30px_0px_rgba(110,84,255,0.1)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-[#6E54FF] rounded-md shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]">
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
          <span className="text-gray-400">FED PRINTING RATE</span>
          <span className="text-white">{opinion.currentRate}%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">
            CUT {opinion.cutBasisPoints}BPS
          </span>
          <span className="text-white">{opinion.cutBasisPoints}</span>
        </div>
      </div>

      <Link href={`/opinio/${opinion.slug}`}>
        <button className="w-full bg-[#6E54FF] hover:bg-[#836EF9] transition-all duration-200 text-white font-medium py-2.5 rounded-[100px] text-sm mb-3 shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB] hover:shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]">
          CAST YOUR OPINION
        </button>
      </Link>

      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>{formatNumber(opinion.totalVotes)} votes</span>
        <span>
          <div className="flex justify-center items-center">
            <span className="text-gray-400">Market By</span>
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
