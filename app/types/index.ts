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
