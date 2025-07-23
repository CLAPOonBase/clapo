import Image from "next/image";
import { Row } from "../types";

interface Props {
  rows: Row[];
  currentUsername: string;
}

export default function Leaderboard({ rows, currentUsername }: Props) {
  const sortedRows = [...rows];
  const userIndex = sortedRows.findIndex(row => row.username === currentUsername);
  const userRow = userIndex !== -1 ? sortedRows[userIndex] : null;

  let displayRows = [...sortedRows];

  if (userRow) {
    displayRows = sortedRows.filter(row => row.username !== currentUsername);
    displayRows.unshift(userRow);
  }

  return (
    <div className="w-full bg-[#10151A] rounded-xl shadow-lg border border-[#23272B] mt-16 max-h-[500px] overflow-y-auto relative scrollbar-hide">
      <div className="sticky top-0 z-10 bg-[#10151A] flex items-center pr-6 pl-2 py-3 border-b border-[#23272B]">
        <input
          className="bg-transparent text-[#A0A0A0] text-xs px-2 border border-[#23272b] p-2 mr-2 rounded-md w-full outline-none"
          placeholder="SEARCH USERNAME"
        />
        <span className="ml-auto text-[10px] text-[#A0A0A0]">
          LEADERBOARD UPDATED EVERY HOUR
        </span>
      </div>

      <table className="min-w-full text-xs text-left">
        <thead className="sticky top-[50px] z-10 bg-[#10151A]">
          <tr className="text-[#A0A0A0] border-b border-[#23272B]">
            <th className="py-3 px-4 font-normal">RANK</th>
            <th className="py-3 px-4 font-normal">USER</th>
            <th className="py-3 px-4 font-normal">TOTAL MINDSHARE</th>
            <th className="py-3 px-4 font-normal">CLAPO MINDSHARE</th>
            <th className="py-3 px-4 font-normal">CLAPO 24H CHANGE</th>
            <th className="py-3 px-4 font-normal">SUI MINDSHARE</th>
            <th className="py-3 px-4 font-normal">SUI 24H CHANGE</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, i) => {
            const isYou = row.username === currentUsername;
            const originalIndex = sortedRows.findIndex(r => r.username === row.username);
            const displayRank = isYou
              ? `${originalIndex + 1} (you)`
              : originalIndex + 1;

            return (
              <tr key={i} className={row.bg}>
                <td className="py-2 px-4 font-bold">{displayRank}</td>
                <td className="py-2 px-4 flex items-start gap-2">
                  <div className="relative w-8 h-8 min-w-[32px] min-h-[32px]">
                    <img src="/bg.svg" alt="Background SVG" className="absolute inset-0 w-full h-full" />
                    <Image
                      src={row.avatar}
                      alt={row.name}
                      width={24}
                      height={24}
                      className="rounded-full absolute top-1 left-1 bg-black"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-sm">{row.name}</span>
                    <span className="text-[8px] text-[#A0A0A0]">@{row.username}</span>
                  </div>
                  <img src="/verified.svg" alt="Verified" className="w-2 h-2 mt-1 -ml-1" />
                </td>
                <td className="py-2 px-4">{row.totalMindshare}</td>
                <td className="py-2 px-4">{row.clapoMindshare}</td>
                <td className={`py-2 px-4 ${row.clapoChangeColor}`}>{row.clapoChange}</td>
                <td className="py-2 px-4">{row.seiMindshare}</td>
                <td className={`py-2 px-4 ${row.seiChangeColor}`}>{row.seiChange}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
