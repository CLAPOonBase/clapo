import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  logo: string;
  description: string;
  prize: number;
  currency: string;
  date: string;
  status: 'live' | 'upcoming' | 'ended';
  participants: number;
  backgroundColor: string;
  logoColor: string;
}

async function fetchEvents(): Promise<Event[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          title: 'DeFi Trading Competition',
          logo: '🚀',
          description: 'ETHEREUM TRADING EVENT',
          prize: 100000,
          currency: 'ETH',
          date: '2025-08-15',
          status: 'live',
          participants: 1250,
          backgroundColor: 'bg-purple-900/20 border-purple-500/30',
          logoColor: 'text-purple-400'
        },
        {
          id: '2',
          title: 'NFT Art Contest',
          logo: '🎨',
          description: 'CREATIVE DIGITAL ART CHALLENGE',
          prize: 50000,
          currency: 'SOL',
          date: '2025-08-20',
          status: 'upcoming',
          participants: 890,
          backgroundColor: 'bg-pink-900/20 border-pink-500/30',
          logoColor: 'text-pink-400'
        },
        {
          id: '3',
          title: 'Gaming Tournament',
          logo: '🎮',
          description: 'ESPORTS CHAMPIONSHIP SERIES',
          prize: 75000,
          currency: 'USDT',
          date: '2025-08-10',
          status: 'ended',
          participants: 2100,
          backgroundColor: 'bg-green-900/20 border-green-500/30',
          logoColor: 'text-green-400'
        },
        {
          id: '4',
          title: 'Yield Farming Quest',
          logo: '⚡',
          description: 'DEFI YIELD OPTIMIZATION EVENT',
          prize: 120000,
          currency: 'BTC',
          date: '2025-08-25',
          status: 'upcoming',
          participants: 670,
          backgroundColor: 'bg-orange-900/20 border-orange-500/30',
          logoColor: 'text-orange-400'
        },
        {
          id: '5',
          title: 'Metaverse Explorer',
          logo: '🌐',
          description: 'VIRTUAL WORLD ADVENTURE',
          prize: 80000,
          currency: 'MATIC',
          date: '2025-09-01',
          status: 'upcoming',
          participants: 1500,
          backgroundColor: 'bg-blue-900/20 border-blue-500/30',
          logoColor: 'text-blue-400'
        },
        {
          id: '6',
          title: 'DAO Governance Vote',
          logo: '🗳️',
          description: 'COMMUNITY DECISION MAKING',
          prize: 60000,
          currency: 'DOT',
          date: '2025-09-05',
          status: 'live',
          participants: 950,
          backgroundColor: 'bg-red-900/20 border-red-500/30',
          logoColor: 'text-red-400'
        },
        {
          id: '7',
          title: 'AI Art Generation',
          logo: '🤖',
          description: 'ARTIFICIAL INTELLIGENCE CREATIVITY',
          prize: 90000,
          currency: 'ADA',
          date: '2025-09-10',
          status: 'upcoming',
          participants: 1200,
          backgroundColor: 'bg-cyan-900/20 border-cyan-500/30',
          logoColor: 'text-cyan-400'
        }
      ]);
    }, 1000);
  });
}

const EventCard = ({ event }: { event: Event }) => (
  <div className="flex-shrink-0 w-[calc(100%/1)] md:w-[calc(100%/3)] p-2">
    <div className="rounded-lg p-4 bg-gray-800/50 min-w-0">
      <div className="flex items-center space-x-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${event.logoColor} bg-black`}>
          {event.logo}
        </div>
        <h3 className="text-white font-semibold">{event.title}</h3>
      </div>
    <div className='flex items-center justify-between'>
          <div>
        <p className="text-xs text-gray-400">{event.description}</p>
      <p className="text-sm text-white mt-2 font-bold">
        {(event.prize / 1000).toFixed(0)}K <span className="text-gray-300 font-normal">IN {event.currency}</span>
      </p>
      </div>
      <button
        disabled={event.status === 'ended'}
        className="bg-white text-primary px-3 py-1 rounded-md font-medium"
      >
        VIEW
      </button>
    </div>
    </div>
  </div>
);

export default function EventsCarousel() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 3;
  const maxIndex = Math.max(0, events.length - itemsPerView);

  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, [events.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  const prevSlide = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));

  return (
    <div className="relative w-full overflow-hidden bg-[#10151A] p-2 rounded-md my-4">
      <h2 className="text-sm text-white font-bold">Clapo Reward Pool</h2>

      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 text-white p-2 rounded-full z-10"
      >
        <ChevronLeft />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 text-white p-2 rounded-full z-10"
      >
        <ChevronRight />
      </button>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${(100 / 3) * currentIndex}%)` }}
        >
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

    
    </div>
  );
}
