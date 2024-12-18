export interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface FeedItem {
  id: number;
  timestamp: Date;
  content: string;
  imageUrl?: string;
  votes: number;
  comments: number;
  shares: number;
  xpReward: number;
  author: string;  // Change author to a string (username)
}

export interface User {
  id: number;
  username: string;
  avatar: string;
  experience: number;
  level: number;
  achievements: number;
}

export interface Comment {
  id: number;
  content: string;
  author: string;  // Change author to a string (username)
  timestamp: Date;
  likes: number;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

export interface LeaderboardUser {
  id: number;
  username: string;
  score: number;
  avatar: string;
}

export type SortOrder = 'asc' | 'desc';
