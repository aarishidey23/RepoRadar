import { UserProfile, Repository, LanguageStat, RateLimitStatus } from '../types';
import { DEFAULT_PROFILES } from '../data/mockData';

const PAT_KEY = 'reporadar_pat';
const SAVED_PROFILES_KEY = 'reporadar_saved_profiles';
const STARRED_REPOS_KEY = 'reporadar_starred_repos';

export function getStoredPat(): string {
  try {
    return localStorage.getItem(PAT_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredPat(pat: string): void {
  try {
    if (pat) {
      localStorage.setItem(PAT_KEY, pat.trim());
    } else {
      localStorage.removeItem(PAT_KEY);
    }
  } catch (e) {
    console.error('Failed to set PAT in localStorage', e);
  }
}

export function getSavedProfiles(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_PROFILES_KEY);
    return raw ? JSON.parse(raw) : ['antfu'];
  } catch {
    return ['antfu'];
  }
}

export function saveProfileBookmark(login: string): boolean {
  try {
    const saved = getSavedProfiles();
    const target = login.toLowerCase();
    if (!saved.includes(target)) {
      saved.push(target);
      localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(saved));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function removeProfileBookmark(login: string): boolean {
  try {
    const saved = getSavedProfiles();
    const target = login.toLowerCase();
    const filtered = saved.filter((item) => item.toLowerCase() !== target);
    localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

export function isProfileSaved(login: string): boolean {
  const saved = getSavedProfiles();
  return saved.includes(login.toLowerCase());
}

export function getStarredRepos(): string[] {
  try {
    const raw = localStorage.getItem(STARRED_REPOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleRepoStar(fullName: string): boolean {
  try {
    const starred = getStarredRepos();
    if (starred.includes(fullName)) {
      const filtered = starred.filter((item) => item !== fullName);
      localStorage.setItem(STARRED_REPOS_KEY, JSON.stringify(filtered));
      return false; // unstarred
    } else {
      starred.push(fullName);
      localStorage.setItem(STARRED_REPOS_KEY, JSON.stringify(starred));
      return true; // starred
    }
  } catch {
    return false;
  }
}

export function isRepoStarred(fullName: string): boolean {
  const starred = getStarredRepos();
  return starred.includes(fullName);
}

// Current rate limit status tracker
export let currentRateLimit: RateLimitStatus = {
  limit: 60,
  remaining: 60,
  reset: Math.floor(Date.now() / 1000) + 3600,
  hasPat: !!getStoredPat(),
};

export async function checkRateLimit(): Promise<RateLimitStatus> {
  const pat = getStoredPat();
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (pat) {
    headers['Authorization'] = `token ${pat}`;
  }

  try {
    const res = await fetch('https://api.github.com/rate_limit', { headers });
    if (res.ok) {
      const data = await res.json();
      currentRateLimit = {
        limit: data.rate.limit,
        remaining: data.rate.remaining,
        reset: data.rate.reset,
        hasPat: !!pat,
      };
      return currentRateLimit;
    }
  } catch (err) {
    console.warn('Could not fetch rate limit directly', err);
  }
  return currentRateLimit;
}

export async function fetchUserData(username: string): Promise<{ profile: UserProfile; repos: Repository[]; fromCache: boolean }> {
  const cleanUser = username.trim().replace(/^@/, '');
  const pat = getStoredPat();
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (pat) {
    headers['Authorization'] = `token ${pat}`;
  }

  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`, { headers }),
      fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?per_page=100&sort=updated`, { headers })
    ]);

    // Update rate limit trackers from headers
    const limitH = profileRes.headers.get('x-ratelimit-limit');
    const remH = profileRes.headers.get('x-ratelimit-remaining');
    const resetH = profileRes.headers.get('x-ratelimit-reset');
    if (limitH && remH && resetH) {
      currentRateLimit = {
        limit: parseInt(limitH, 10),
        remaining: parseInt(remH, 10),
        reset: parseInt(resetH, 10),
        hasPat: !!pat,
      };
    }

    if (profileRes.status === 404) {
      throw new Error(`Developer '@${cleanUser}' was not detected in GitHub telemetry registry.`);
    }

    if (profileRes.status === 403 || reposRes.status === 403) {
      // Check if we have fallback data for this user
      const lower = cleanUser.toLowerCase();
      if (DEFAULT_PROFILES[lower]) {
        console.info(`Rate limited (403), using curated telemetry data for ${lower}`);
        return {
          profile: DEFAULT_PROFILES[lower].profile,
          repos: DEFAULT_PROFILES[lower].repos,
          fromCache: true,
        };
      }

      let resetMsg = 'Anonymous quota exceeded.';
      if (resetH) {
        const date = new Date(parseInt(resetH, 10) * 1000);
        resetMsg = `Anonymous quota exceeded. Resets at ${date.toLocaleTimeString()}. Configure a PAT in API Settings for 5,000 req/hr.`;
      }
      throw new Error(resetMsg);
    }

    if (!profileRes.ok || !reposRes.ok) {
      // If error but we have fallback
      const lower = cleanUser.toLowerCase();
      if (DEFAULT_PROFILES[lower]) {
        return {
          profile: DEFAULT_PROFILES[lower].profile,
          repos: DEFAULT_PROFILES[lower].repos,
          fromCache: true,
        };
      }
      throw new Error(`GitHub telemetry query failed with status ${profileRes.status}`);
    }

    const profile: UserProfile = await profileRes.json();
    const reposData = await reposRes.json();
    const repos: Repository[] = Array.isArray(reposData) ? reposData : [];

    return {
      profile,
      repos,
      fromCache: false,
    };
  } catch (error: any) {
    // If network failure or offline, try curated mock profiles
    const lower = cleanUser.toLowerCase();
    if (DEFAULT_PROFILES[lower]) {
      return {
        profile: DEFAULT_PROFILES[lower].profile,
        repos: DEFAULT_PROFILES[lower].repos,
        fromCache: true,
      };
    }
    throw error;
  }
}

export function calculateLanguageStats(repos: Repository[]): { stats: LanguageStat[]; topLang: string; topPercent: number } {
  const counts: Record<string, number> = {};
  let total = 0;

  repos.forEach((repo) => {
    if (repo.language) {
      counts[repo.language] = (counts[repo.language] || 0) + 1;
      total++;
    }
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0 || total === 0) {
    return { stats: [], topLang: 'N/A', topPercent: 0 };
  }

  const colorMap: Record<string, { class: string; hex: string }> = {
    TypeScript: { class: 'bg-[#5de6ff]', hex: '#5de6ff' },
    Vue: { class: 'bg-[#4edea3]', hex: '#4edea3' },
    JavaScript: { class: 'bg-[#d0bcff]', hex: '#d0bcff' },
    Rust: { class: 'bg-[#00cbe6]', hex: '#00cbe6' },
    Python: { class: 'bg-[#a2eeff]', hex: '#a2eeff' },
    Go: { class: 'bg-[#4edea3]', hex: '#4edea3' },
    HTML: { class: 'bg-[#a078ff]', hex: '#a078ff' },
    CSS: { class: 'bg-[#2fd9f4]', hex: '#2fd9f4' },
    C: { class: 'bg-[#958ea0]', hex: '#958ea0' },
    'C++': { class: 'bg-[#ffb4ab]', hex: '#ffb4ab' },
    Zig: { class: 'bg-[#f59e0b]', hex: '#f59e0b' },
    Shell: { class: 'bg-[#6ee7b7]', hex: '#6ee7b7' },
    Markdown: { class: 'bg-[#94a3b8]', hex: '#94a3b8' },
  };

  const stats: LanguageStat[] = sorted.slice(0, 4).map(([lang, count]) => {
    const percentage = parseFloat(((count / total) * 100).toFixed(1));
    const entry = colorMap[lang] || { class: 'bg-[#958ea0]', hex: '#958ea0' };
    return {
      name: lang,
      count,
      percentage,
      colorClass: entry.class,
      hexColor: entry.hex,
    };
  });

  const top = sorted[0];
  const topPercent = parseFloat(((top[1] / total) * 100).toFixed(1));

  return {
    stats,
    topLang: top[0],
    topPercent,
  };
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString();
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval}y ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m ago`;
    return 'just now';
  } catch {
    return 'recently';
  }
}

export function getLanguageBgClass(lang: string | null): string {
  if (!lang) return 'bg-[#958ea0]';
  const map: Record<string, string> = {
    TypeScript: 'bg-[#5de6ff]',
    Vue: 'bg-[#4edea3]',
    JavaScript: 'bg-[#d0bcff]',
    Rust: 'bg-[#00cbe6]',
    Python: 'bg-[#a2eeff]',
    Go: 'bg-[#4edea3]',
    HTML: 'bg-[#a078ff]',
    CSS: 'bg-[#2fd9f4]',
    C: 'bg-[#958ea0]',
    'C++': 'bg-[#ffb4ab]',
    Zig: 'bg-[#f59e0b]',
    Shell: 'bg-[#6ee7b7]',
    Markdown: 'bg-[#94a3b8]',
  };
  return map[lang] || 'bg-[#958ea0]';
}
