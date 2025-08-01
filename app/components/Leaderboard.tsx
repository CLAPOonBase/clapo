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

    <div className="w-full bg-[#10151A] rounded-xl shadow-lg border border-[#23272B] max-h-[500px] overflow-hidden relative">
      <div className="sticky top-0 z-20 bg-[#10151A] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 pr-4 sm:pr-6 pl-2 py-3 border-b border-[#23272B]">
        <input
          className="bg-transparent text-[#A0A0A0] text-xs px-2 border border-[#23272b] p-2 rounded-md outline-none flex-1 min-w-0"
          placeholder="SEARCH USERNAME"
        />
        <span className="text-[10px] text-[#A0A0A0] text-center sm:text-right sm:ml-2 whitespace-nowrap">
          LEADERBOARD UPDATED EVERY HOUR
        </span>
      </div>

      <div className="overflow-y-auto max-h-[calc(500px-80px)] scrollbar-hide">
        <div className="overflow-x-auto sm:overflow-x-visible scrollbar-hide">
          <table className="text-xs text-left w-full sm:min-w-full" style={{ minWidth: '800px' }}>
            <thead className="bg-[#10151A]">
              <tr className="text-[#A0A0A0] border-b border-[#23272B]">
                <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[60px] sm:min-w-0">RANK</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[140px] sm:min-w-0">USER</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[120px] sm:min-w-0">TOTAL MINDSHARE</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[120px] sm:min-w-0">CLAPO MINDSHARE</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[120px] sm:min-w-0">CLAPO 24H CHANGE</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[120px] sm:min-w-0">SUI MINDSHARE</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 font-normal min-w-[120px] sm:min-w-0">SUI 24H CHANGE</th>
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
                    <td className="py-2 px-2 sm:px-4 font-bold text-xs sm:text-sm">{displayRank}</td>
                    <td className="py-2 px-2 sm:px-4">
                      <div className="flex items-start gap-1 sm:gap-2">
                        <div className="relative w-6 h-6 sm:w-8 sm:h-8 min-w-[24px] min-h-[24px] sm:min-w-[32px] sm:min-h-[32px]">
                          <img src="/bg.svg" alt="Background SVG" className="absolute inset-0 w-full h-full" />
                          <Image
                            src={row.avatar}
                            alt={row.name}
                            width={20}
                            height={20}
                            className="rounded-full absolute top-0.5 left-0.5 sm:top-1 sm:left-1 bg-black w-5 h-5 sm:w-6 sm:h-6"
                            unoptimized
                          />
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                          <span className="text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{row.name}</span>
                          <span className="text-[8px] sm:text-[10px] text-[#A0A0A0] truncate max-w-[80px] sm:max-w-none">@{row.username}</span>
                        </div>
                        <img src="/verified.svg" alt="Verified" className="w-2 h-2 mt-0.5 sm:mt-1 flex-shrink-0" />
                      </div>
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap">{row.totalMindshare}</td>
                    <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap">{row.clapoMindshare}</td>
                    <td className={`py-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap ${row.clapoChangeColor}`}>{row.clapoChange}</td>
                    <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap">{row.seiMindshare}</td>
                    <td className={`py-2 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap ${row.seiChangeColor}`}>{row.seiChange}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
