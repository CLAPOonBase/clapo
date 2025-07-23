export interface Leader {
  name: string;
  username: string;
  avatar: string;
}

export interface Row {
  rank: number | string;
  name: string;
  username: string;
  totalMindshare: string;
  clapoMindshare: string;
  clapoChange: string;
  clapoChangeColor: string;
  seiMindshare: string;
  seiChange: string;
  seiChangeColor: string;
  bg: string;
  avatar: string;
}

export interface Opinion {
  id: string;
  title: string;
  slug: string;
  category:
    | 'FED_DECISION'
    | 'POLITICS'
    | 'ECONOMY'
    | 'CRYPTO'
    | 'TECH'
    | 'CELEBRITY'
    | 'SPORTS'
    | 'WORLD'
    | 'TRUMP'
    | 'ELECTIONS'
    | 'MENTIONS'
    | 'NEW'
    | 'TRENDING';
  description: string;
  currentRate: number;
  cutBasisPoints: number;
  expiryDate: string;
  totalVotes: number;
  createdAt: string;
  isActive: boolean;
  image: string;
}



export interface Vote {
  id: string;
  opinionId: string;
  userId: string;
  prediction: number; // basis points
  confidence: number; // 1-100
  createdAt: string;
}

export interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface OpinionCardProps {
  opinion: Opinion;
  onVote?: (opinionId: string) => void;
}

export interface VoteModalProps {
  opinion: Opinion;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vote: Omit<Vote, 'id' | 'createdAt'>) => void;
}

export type OpinionFilter = 'all' | 'active' | 'expired' | 'trending';