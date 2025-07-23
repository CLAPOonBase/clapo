
import { Opinion } from '../types';

export const mockOpinions: Opinion[] = [
  {
    id: '1',
    title: 'WILL BITCOIN HIT $100K?',
    slug: 'bitcoin-100k-crypto',
    category: 'CRYPTO',
    description: 'Speculation around BTC reaching new all-time highs.',
    currentRate: 5.50,
    cutBasisPoints: 25,
    expiryDate: '2025-08-01T23:59:59Z',
    totalVotes: 3021,
    createdAt: '2025-07-10T10:00:00Z',
    isActive: true,
    image: "https://robohash.org/jay.png?size=500x500"
  },
  {
    id: '2',
    title: 'NEW TECH UNVEILED BY APPLE',
    slug: 'apple-new-tech-2025',
    category: 'TECH',
    description: 'What innovation will Apple introduce next?',
    currentRate: 5.50,
    cutBasisPoints: 25,
    expiryDate: '2025-08-10T23:59:59Z',
    totalVotes: 982,
    createdAt: '2025-07-18T12:45:00Z',
    isActive: true,
    image: "https://robohash.org/jay.png?size=500x500"
  },
  {
    id: '3',
    title: 'TRUMP RETURNS TO THE BALLOT?',
    slug: 'trump-returns-2025',
    category: 'TRUMP',
    description: 'Will Donald Trump make a strong comeback?',
    currentRate: 5.50,
    cutBasisPoints: 50,
    expiryDate: '2025-08-20T23:59:59Z',
    totalVotes: 1502,
    createdAt: '2025-07-15T09:30:00Z',
    isActive: true,
    image: "https://robohash.org/jay.png?size=500x500"
  },
  {
    id: '4',
    title: 'US ELECTIONS – WHO WILL WIN?',
    slug: 'us-elections-2025',
    category: 'ELECTIONS',
    description: 'Major parties gear up for an intense election battle.',
    currentRate: 5.50,
    cutBasisPoints: 75,
    expiryDate: '2025-08-25T23:59:59Z',
    totalVotes: 2176,
    createdAt: '2025-07-12T15:10:00Z',
    isActive: true,
    image: "https://robohash.org/jay.png?size=500x500"
  },
  {
    id: '5',
    title: 'WILL INDIA WIN THE CHAMPIONS TROPHY?',
    slug: 'india-champions-trophy',
    category: 'SPORTS',
    description: 'Cricket fans worldwide are buzzing with predictions.',
    currentRate: 5.50,
    cutBasisPoints: 25,
    expiryDate: '2025-08-15T23:59:59Z',
    totalVotes: 1345,
    createdAt: '2025-07-08T11:30:00Z',
    isActive: true,
    image: "https://robohash.org/jay.png?size=500x500"
  },
  {
    id: '6',
    title: 'FED INTEREST RATE CUT COMING?',
    slug: 'fed-rate-cut-july',
    category: 'ECONOMY',
    description: 'Investors await Fed’s next rate move amid inflation.',
    currentRate: 5.50,
    cutBasisPoints: 50,
    expiryDate: '2025-08-05T23:59:59Z',
    totalVotes: 1101,
    createdAt: '2025-07-06T13:00:00Z',
    isActive: true,
    image: "https://robohash.org/jay.png?size=500x500"
  },
  {
    id: '7',
    title: 'KIM KARDASHIAN LAUNCHES NEW BRAND?',
    slug: 'kim-kardashian-brand',
    category: 'CELEBRITY',
    description: 'Another beauty brand by the celebrity mogul?',
    currentRate: 5.50,
    cutBasisPoints: 25,
    expiryDate: '2025-08-12T23:59:59Z',
    totalVotes: 728,
    createdAt: '2025-07-05T17:20:00Z',
    isActive: true,
    image: "https://robohash.org/jay.png?size=500x500"
  },
  {
    id: '8',
    title: 'NATO MEETING OUTCOME?',
    slug: 'nato-world-meeting',
    category: 'WORLD',
    description: 'Global leaders gather for high-stakes decisions.',
    currentRate: 5.50,
    cutBasisPoints: 25,
    expiryDate: '2025-08-15T23:59:59Z',
    totalVotes: 876,
    createdAt: '2025-07-03T08:15:00Z',
    isActive: true,
    image: "https://robohash.org/jay.png?size=500x500"
  },
  {
    id: '9',
    title: 'NEW POLICY TO BOOST JOBS?',
    slug: 'politics-jobs-policy',
    category: 'POLITICS',
    description: 'Is the new government scheme effective?',
    currentRate: 5.50,
    cutBasisPoints: 50,
    expiryDate: '2025-08-08T23:59:59Z',
    totalVotes: 667,
    createdAt: '2025-07-01T14:10:00Z',
    isActive: true,
    image: "https://robohash.org/jay.png?size=500x500"
  },
  {
    id: '10',
    title: 'NEWEST OPINION GOES VIRAL',
    slug: 'opinion-viral-news',
    category: 'NEW',
    description: 'Fresh community insight gaining traction.',
    currentRate: 5.50,
    cutBasisPoints: 25,
    expiryDate: '2025-08-18T23:59:59Z',
    totalVotes: 134,
    createdAt: '2025-07-22T10:00:00Z',
    isActive: true,
    image: "https://robohash.org/jay.png?size=500x500"
  },
  {
    id: '11',
    title: 'WHO IS BEING MENTIONED THE MOST?',
    slug: 'mentions-july-2025',
    category: 'MENTIONS',
    description: 'Tracking the most talked-about figures this week.',
    currentRate: 5.50,
    cutBasisPoints: 25,
    expiryDate: '2025-08-19T23:59:59Z',
    totalVotes: 786,
    createdAt: '2025-07-19T13:40:00Z',
    isActive: true,
    image: "https://robohash.org/jay.png?size=500x500"
  }
];



// lib/utils.ts
export const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};