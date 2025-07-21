"use client"
import Image from "next/image";
import { useEffect, useState } from "react";

const leaderboard = [
  {
    name: "BEN",
    username: "@MUARSHB",
    avatar: "/ben.png",
  },
  {
    name: "JEFF",
    username: "@JEFFDFENG",
    avatar: "/jeff.png",
  },
  {
    name: "JAY",
    username: "@JAYENDRA_JOG",
    avatar: "/jay.png",
  },
];

const words = ["YAPPERS", "INFLUENCER", "PROTOCOL"];

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timeout;
    if (typing) {
      if (displayed.length < words[wordIndex].length) {
        timeout = setTimeout(() => {
          setDisplayed(words[wordIndex].slice(0, displayed.length + 1));
        }, 90);
      } else {
        timeout = setTimeout(() => setTyping(false), 1200);
      }
    } else {
      timeout = setTimeout(() => {
        setDisplayed("");
        setTyping(true);
        setWordIndex((prev) => (prev + 1) % words.length);
      }, 400);
    }
    return () => clearTimeout(timeout);
  }, [displayed, typing, wordIndex]);

  return (
    <div className="min-h-screen bg-[#070C11] text-white font-mono flex flex-col items-center w-full">
      <main className="flex-1 w-full flex flex-col items-center">
        <div className="relative w-full flex flex-col items-center pt-12 pb-8">
          <div className="flex flex-col items-start w-full max-w-4xl px-8">
            <span className="text-[64px] font-bold tracking-[0.18em] leading-none">CLAPO</span>
            <span className="text-[40px] font-mono tracking-[0.18em] mt-2 mb-4 flex items-center gap-2">FOR <span className="text-[#E4761B] min-w-[180px]">{displayed}<span className="border-r-2 border-[#E4761B] animate-pulse ml-1" style={{height: '1.2em', display: 'inline-block'}}></span></span></span>
            <span className="text-xs text-[#A0A0A0] mb-8 mt-2 max-w-lg tracking-widest">THE FIRST PROTOCOL TO TOKENIZE SOCIAL INFLUENCE AND CONVERT IT INTO REVENUE GENERATION</span>
          </div>
          <div className="absolute top-0 right-0 left-0 w-full h-[320px] pointer-events-none select-none">
            <div className="absolute left-[12%] top-0 w-24 h-24 bg-[#F7E244] rounded-full blur-2xl opacity-80" />
            <div className="absolute right-[18%] top-8 w-16 h-16 bg-[#7B61FF] rounded-full blur-2xl opacity-70" />
            <div className="absolute right-[8%] top-32 w-20 h-20 bg-[#A259FF] rounded-full blur-2xl opacity-60" />
            <div className="absolute left-[28%] top-24 w-16 h-16 bg-[#5DFDCB] rounded-full blur-2xl opacity-60" />
            <div className="absolute right-[22%] top-20 w-28 h-28 bg-white rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-black text-xs font-bold tracking-widest">SOCIAL</span>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-40 w-28 h-28 bg-white rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-black text-xs font-bold tracking-widest">INFLUENCE</span>
            </div>
            <div className="absolute right-1/2 translate-x-1/2 top-56 w-32 h-32 bg-white rounded-full border-2 border-white flex items-center justify-center ring-2 ring-white">
              <span className="text-black text-xs font-bold tracking-widest">CLAPO LAYER</span>
            </div>
            <div className="absolute right-[8%] top-64 w-28 h-28 bg-white rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-black text-xs font-bold tracking-widest">ATTENTION</span>
            </div>
            <div className="absolute right-[30%] top-24 w-20 h-20 flex items-center justify-center">
              <Image src="/file.svg" alt="Clapo Hand" width={60} height={60} />
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col items-center mt-24">
          <span className="text-[40px] font-bold tracking-[0.18em] mb-12">LEADERBOARD</span>
          <div className="flex gap-16 mb-12">
            {leaderboard.map((user, i) => (
              <div key={user.name} className={`flex flex-col items-center bg-[#181C20] rounded-xl px-10 py-8 shadow-lg ${i === 1 ? 'scale-110 z-10' : 'opacity-80'}`} style={{marginTop: i === 0 ? 32 : i === 2 ? 32 : 0}}>
                <Image src={user.avatar} alt={user.name} width={90} height={90} className="rounded-full border-4 border-[#23272B] mb-2" />
                <span className="text-lg font-bold mt-2 tracking-widest">{user.name}</span>
                <span className="text-xs text-[#E4761B] font-mono tracking-widest">{user.username}</span>
              </div>
            ))}
          </div>
          <div className="w-full max-w-6xl bg-[#10151A] rounded-xl shadow-lg overflow-x-auto border border-[#23272B]">
            <div className="flex items-center px-6 py-3 border-b border-[#23272B]">
              <input className="bg-transparent text-[#A0A0A0] text-xs px-2 py-1 w-64 border-none outline-none" placeholder="SEARCH USERNAME" />
              <span className="ml-auto text-[10px] text-[#A0A0A0]">LEADERBOARD UPDATED EVERY HOUR</span>
            </div>
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr className="text-[#A0A0A0] border-b border-[#23272B]">
                  <th className="py-3 px-4 font-normal">RANK</th>
                  <th className="py-3 px-4 font-normal">USER</th>
                  <th className="py-3 px-4 font-normal">TOTAL MINDSHARE</th>
                  <th className="py-3 px-4 font-normal">CLAPO MINDSHARE</th>
                  <th className="py-3 px-4 font-normal">CLAPO 24H CHANGE</th>
                  <th className="py-3 px-4 font-normal">SEI MINDSHARE</th>
                  <th className="py-3 px-4 font-normal">SEI 24H CHANGE</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(11)].map((_, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-[#10151A]" : "bg-[#181C20]"}>
                    <td className="py-2 px-4 font-bold">{i === 0 ? "YOU" : i}</td>
                    <td className="py-2 px-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-[#23272B] rounded-full inline-block" />
                      <span>ARPIT</span>
                      <span className="text-[8px] text-[#A0A0A0] ml-1">@ARPTIN</span>
                    </td>
                    <td className="py-2 px-4">17.40</td>
                    <td className="py-2 px-4">17.86</td>
                    <td className={`py-2 px-4 ${i % 2 === 0 ? 'text-[#FF4C4C]' : 'text-[#1FC77E]'}`}>{i % 2 === 0 ? '↘ -16.70%' : '↗ +16.70%'}</td>
                    <td className="py-2 px-4">0.34%</td>
                    <td className={`py-2 px-4 ${i % 2 === 0 ? 'text-[#1FC77E]' : 'text-[#FF4C4C]'}`}>{i % 2 === 0 ? '+0.34' : '-0.34'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <footer className="w-full max-w-6xl mt-20 py-10 flex flex-col sm:flex-row justify-between items-center text-xs text-[#A0A0A0] border-t border-[#23272B] gap-6 px-8">
        <div className="flex items-center gap-2">
          <Image src="/navlogo.png" alt="Clapo Logo" width={68} height={68} />
          <span>© 2025 CLAPO. ALL RIGHTS RESERVED</span>
        </div>
        <div className="flex gap-8">
          <div>
            <div className="font-bold text-white mb-1 tracking-widest">PRODUCT</div>
            <div className="text-[#E4761B]">CLAPS</div>
            <div>SNAPS</div>
            <div>OPINIO</div>
          </div>
          <div>
            <div className="font-bold text-white mb-1 tracking-widest">RESOURCES</div>
            <div>GITBOOK</div>
          </div>
          <div>
            <div className="font-bold text-white mb-1 tracking-widest">CONTACT US</div>
            <div>X</div>
            <div>TELEGRAM</div>
            <div>MAIL</div>
          </div>
          <div>
            <div className="font-bold text-white mb-1 tracking-widest">COMPANY</div>
            <div>ABOUT US</div>
            <div>TERM AND CONDITION</div>
            <div>PRIVACY POLICY</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
