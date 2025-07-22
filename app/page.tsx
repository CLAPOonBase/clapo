"use client";
import { useEffect, useState } from "react";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import PodiumComponent from "./components/Podium";
import Leaderboard from "./components/Leaderboard";
import { Row } from "./types";
export default function Home() {
  const [mockRows, setMockRows] = useState<Row[]>([]);


  useEffect(() => {
    const rows = [...Array(100)].map((_, i) => ({
      rank: i === 0 ? "YOU" : i + 1,
      name: i === 0 ? "ARPIT" : `USER${i + 1}`,
      username: i === 0 ? "ARPTIN" : `user${i + 1}`,
      totalMindshare: (Math.random() * 100).toFixed(2),
      clapoMindshare: (Math.random() * 100).toFixed(2),
      clapoChange: i % 2 === 0 ? "↘ -16.70%" : "↗ +16.70%",
      clapoChangeColor: i % 2 === 0 ? "text-[#FF4C4C]" : "text-[#1FC77E]",
      seiMindshare: `${(Math.random() * 5).toFixed(2)}%`,
      seiChange:
        i % 2 === 0
          ? `+${(Math.random() * 2).toFixed(2)}`
          : `-${(Math.random() * 2).toFixed(2)}`,
      seiChangeColor: i % 2 === 0 ? "text-[#1FC77E]" : "text-[#FF4C4C]",
      bg: i % 2 === 0 ? "bg-[#10151A]" : "bg-[#181C20]",
      avatar: `https://robohash.org/user${i + 1}.png?size=50x50`,
    }));
    setMockRows(rows);
  }, []);

  const leaderboard = [
    {
      name: "BEN",
      username: "@MUARSHB",
      avatar: "https://robohash.org/ben.png?size=500x500",
    },
    {
      name: "JEFF",
      username: "@JEFFDFENG",
      avatar: "https://robohash.org/jeff.png?size=500x500",
    },
    {
      name: "JAY",
      username: "@JAYENDRA_JOG",
      avatar: "https://robohash.org/jay.png?size=500x500",
    },
  ];

  return (
    <div className="text-white font-mono flex flex-col items-center w-full">
      <main className="flex-1 w-full flex flex-col items-center">
        <Hero />
        <section className="w-full flex flex-col items-center px-8 mt-24">
          <span className="text-[40px] font-bold tracking-[0.18em] mb-12">
            LEADERBOARD
          </span>
          <PodiumComponent leaderboard={leaderboard} />
          <Leaderboard rows={mockRows} currentUsername="user55" />

        </section>
      </main>
      <Footer />
    </div>
  );
}
