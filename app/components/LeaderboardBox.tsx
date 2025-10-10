"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  logo: string;
  description: string;
  prize: number;
  currency: string;
  date: string;
  status: "live" | "upcoming" | "ended";
  participants: number;
  backgroundColor: string;
  logoColor: string;
}

async function fetchEvents(): Promise<Event[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          title: "DeFi Trading Competition",
          logo: "🚀",
          description: "ETHEREUM TRADING EVENT",
          prize: 100000,
          currency: "ETH",
          date: "2025-08-15",
          status: "live",
          participants: 1250,
          backgroundColor: "bg-purple-900/20 border-purple-500/30",
          logoColor: "text-purple-400",
        },
        {
          id: "2",
          title: "NFT Art Contest",
          logo: "🎨",
          description: "CREATIVE DIGITAL ART CHALLENGE",
          prize: 50000,
          currency: "SOL",
          date: "2025-08-20",
          status: "upcoming",
          participants: 890,
          backgroundColor: "bg-pink-900/20 border-pink-500/30",
          logoColor: "text-pink-400",
        },
        {
          id: "3",
          title: "Gaming Tournament",
          logo: "🎮",
          description: "ESPORTS CHAMPIONSHIP SERIES",
          prize: 75000,
          currency: "USDT",
          date: "2025-08-10",
          status: "ended",
          participants: 2100,
          backgroundColor: "bg-green-900/20 border-green-500/30",
          logoColor: "text-green-400",
        },
        {
          id: "4",
          title: "Yield Farming Quest",
          logo: "⚡",
          description: "DEFI YIELD OPTIMIZATION EVENT",
          prize: 120000,
          currency: "BTC",
          date: "2025-08-25",
          status: "upcoming",
          participants: 670,
          backgroundColor: "bg-orange-900/20 border-orange-500/30",
          logoColor: "text-orange-400",
        },
        {
          id: "5",
          title: "Metaverse Explorer",
          logo: "🌐",
          description: "VIRTUAL WORLD ADVENTURE",
          prize: 80000,
          currency: "MATIC",
          date: "2025-09-01",
          status: "upcoming",
          participants: 1500,
          backgroundColor: "bg-blue-900/20 border-blue-500/30",
          logoColor: "text-blue-400",
        },
        {
          id: "6",
          title: "DAO Governance Vote",
          logo: "🗳️",
          description: "COMMUNITY DECISION MAKING",
          prize: 60000,
          currency: "DOT",
          date: "2025-09-05",
          status: "live",
          participants: 950,
          backgroundColor: "bg-red-900/20 border-red-500/30",
          logoColor: "text-red-400",
        },
        {
          id: "7",
          title: "AI Art Generation",
          logo: "🤖",
          description: "ARTIFICIAL INTELLIGENCE CREATIVITY",
          prize: 90000,
          currency: "ADA",
          date: "2025-09-10",
          status: "upcoming",
          participants: 1200,
          backgroundColor: "bg-cyan-900/20 border-cyan-500/30",
          logoColor: "text-cyan-400",
        },
      ]);
    }, 1000);
  });
}

const EventsCarousel = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []);

  return (
    <div className="flex space-x-4 overflow-x-auto p-4">
      {events.map((event) => (
        <div
          key={event.id}
          className={`min-w-[280px] rounded-xl border ${event.backgroundColor} p-4`}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div
              className={`w-10 h-10 flex items-center justify-center text-xl ${event.logoColor}`}
            >
              {event.logo}
            </div>
            <h3 className="text-lg font-bold">{event.title}</h3>
          </div>
          <p className="text-sm text-gray-400 mb-2">{event.description}</p>
          <p className="text-sm text-gray-400 mb-2">
            Prize: {(event.prize / 1000).toFixed(0)}K {event.currency}
          </p>
          <p className="text-xs text-gray-500 mb-4">Date: {event.date}</p>
          <Link href={`/RewardPool/${event.id}`}>
            <button
              disabled={event.status === "ended"}
              className="bg-white text-primary px-3 py-1 rounded-md font-medium disabled:bg-gray-400 disabled:text-gray-200"
            >
              VIEW
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default EventsCarousel;
