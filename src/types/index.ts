export interface UserProfile {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  topics?: string[];
  visibility?: string;
  pushed_at: string;
  updated_at: string;
  created_at: string;
  homepage?: string | null;
}

export interface LanguageStat {
  name: string;
  count: number;
  percentage: number;
  colorClass: string;
  hexColor: string;
}

export interface TrendingRepo {
  id: string;
  name: string;
  owner: string;
  ownerAvatar: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  starsGained: number;
  timeframe: 'today' | 'week' | 'month';
  topics: string[];
  url: string;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: number;
  hasPat: boolean;
}
