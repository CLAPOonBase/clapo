"use client";
import { useEffect, useState } from "react";
import Hero from "./components/Hero";
import PodiumComponent from "./components/Podium";
import { motion } from 'framer-motion';
import Leaderboard from "./components/Leaderboard";
import { Row } from "./types";

export default function Home() {
  const [mockRows, setMockRows] = useState<Row[]>([]);
  const [hasMounted, setHasMounted] = useState(false); 

  useEffect(() => {
    setHasMounted(true);

    const topThree = [
      {
        rank: 1,
        name: "Eman",
        username: "@MUARSHB",
        totalMindshare: "98.35",
        clapoMindshare: "87.22",
        clapoChange: "↗ +12.30%",
        clapoChangeColor: "text-[#1FC77E]",
        seiMindshare: "4.93%",
        seiChange: "+1.45",
        seiChangeColor: "text-[#1FC77E]",
        bg: "bg-[#10151A]",
        avatar: "https://robohash.org/ben.png?size=500x500",
      },
      {
        rank: 2,
        name: "Kostas",
        username: "@JEFFDFENG",
        totalMindshare: "95.11",
        clapoMindshare: "79.03",
        clapoChange: "↗ +8.76%",
        clapoChangeColor: "text-[#1FC77E]",
        seiMindshare: "3.91%",
        seiChange: "+0.88",
        seiChangeColor: "text-[#1FC77E]",
        bg: "bg-[#181C20]",
        avatar: "https://robohash.org/jeff.png?size=500x500",
      },
      {
        rank: 3,
        name: "Evan",
        username: "@JAYENDRA_JOG",
        totalMindshare: "91.77",
        clapoMindshare: "75.89",
        clapoChange: "↗ +7.34%",
        clapoChangeColor: "text-[#1FC77E]",
        seiMindshare: "3.43%",
        seiChange: "+0.52",
        seiChangeColor: "text-[#1FC77E]",
        bg: "bg-[#10151A]",
        avatar: "https://robohash.org/jay.png?size=500x500",
      },
    ];

    const rest = [...Array(97)].map((_, i) => {
      const index = i + 4;
      return {
        rank: index,
        name: `USER${index}`,
        username: `@user${index}`,
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
        avatar: `https://robohash.org/user${index}.png?size=50x50`,
      };
    });

    setMockRows([...topThree, ...rest]);
  }, []);

  const leaderboard = [
    {
      name: "Eman",
      username: "@MUARSHB",
      avatar: "https://robohash.org/ben.png?size=500x500",
    },
    {
      name: "Kostas",
      username: "@JEFFDFENG",
      avatar: "https://robohash.org/jeff.png?size=500x500",
    },
    {
      name: "Evan",
      username: "@JAYENDRA_JOG",
      avatar: "https://robohash.org/jay.png?size=500x500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="text-white font-mono flex flex-col items-center w-full">
        <main className="flex-1 w-full flex flex-col items-center">
          <Hero />
          <section className="w-full flex flex-col items-center px-8 mt-24">
            <span className="text-[40px] font-bold tracking-[0.18em] mb-12">
              LEADERBOARD
            </span>
            <PodiumComponent leaderboard={leaderboard} />
            {hasMounted && <Leaderboard rows={mockRows} currentUsername="user55" />}
          </section>
        </main>
      </div>
    </motion.div>
  );
}
