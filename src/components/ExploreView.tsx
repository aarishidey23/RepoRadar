import React, { useState, useMemo } from 'react';
import {
  Search,
  Radar,
  ArrowRight,
  X,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Building,
  MapPin,
  Link as LinkIcon,
  Calendar,
  FolderGit2,
  Users,
  Star,
  GitFork,
  Code2,
  Terminal,
  Filter,
  LayoutGrid,
  List,
  RotateCw,
  AlertTriangle,
  BadgeCheck,
  Info,
} from 'lucide-react';
import { UserProfile, Repository } from '../types';
import {
  calculateLanguageStats,
  formatNumber,
  formatTimeAgo,
  getLanguageBgClass,
  isProfileSaved,
  isRepoStarred,
} from '../services/github';

interface ExploreViewProps {
  currentProfile: UserProfile | null;
  repos: Repository[];
  isLoading: boolean;
  error: string | null;
  onSearch: (username: string) => void;
  onRetry: () => void;
  onToggleBookmarkProfile: (profile: UserProfile) => void;
  onToggleStarRepo: (repo: Repository) => void;
  savedProfiles: string[];
  starredRepos: string[];
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  currentProfile,
  repos,
  isLoading,
  error,
  onSearch,
  onRetry,
  onToggleBookmarkProfile,
  onToggleStarRepo,
  savedProfiles,
  starredRepos,
}) => {
  const [searchInput, setSearchInput] = useState('antfu');
  const [repoFilterQuery, setRepoFilterQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [sortBy, setSortBy] = useState<'stars' | 'updated' | 'forks' | 'name'>('stars');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [displayCount, setDisplayCount] = useState(6);
  const [isErrorDismissed, setIsErrorDismissed] = useState(false);

  const signalHotlist = ['antfu', 'shadcn', 'gaearon', 'sindresorhus', 'torvalds'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setIsErrorDismissed(false);
      setDisplayCount(6);
      onSearch(searchInput.trim());
    }
  };

  const handleHotlistClick = (user: string) => {
    setSearchInput(user);
    setIsErrorDismissed(false);
    setDisplayCount(6);
    onSearch(user);
  };

  // Language telemetry calculations
  const { stats: langStats, topLang, topPercent } = useMemo(() => {
    return calculateLanguageStats(repos);
  }, [repos]);

  // Total stars across top repositories
  const totalStarsCount = useMemo(() => {
    return repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  }, [repos]);

  // Unique languages in repos for the filter dropdown
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return Array.from(set).sort();
  }, [repos]);

  // Filtered and sorted repositories
  const filteredRepos = useMemo(() => {
    const q = repoFilterQuery.toLowerCase().trim();
    return repos
      .filter((repo) => {
        const matchesQuery =
          !q ||
          repo.name.toLowerCase().includes(q) ||
          (repo.description && repo.description.toLowerCase().includes(q)) ||
          (repo.topics && repo.topics.some((t) => t.toLowerCase().includes(q)));
        const matchesLang = selectedLanguage === 'ALL' || repo.language === selectedLanguage;
        return matchesQuery && matchesLang;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        if (sortBy === 'updated') {
          return new Date(b.pushed_at || b.updated_at).getTime() - new Date(a.pushed_at || a.updated_at).getTime();
        }
        if (sortBy === 'forks') return (b.forks_count || 0) - (a.forks_count || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [repos, repoFilterQuery, selectedLanguage, sortBy]);

  const displayedRepos = filteredRepos.slice(0, displayCount);
  const profileIsSaved = currentProfile ? isProfileSaved(currentProfile.login) : false;

  return (
    <div className="flex flex-col w-full">
      {/* Hero & Primary Radar Search */}
      <section className="relative w-full overflow-hidden px-4 md:px-8 py-10 md:py-14">
        {/* Atmospheric Ambient Backglow & Radar Ring Lines */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-[#a078ff]/20 via-[#5de6ff]/10 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />
        <div className="absolute top-8 right-12 w-64 h-64 rounded-full border border-dashed border-[#5de6ff]/10 pointer-events-none animate-pulse -z-10" />
        <div className="absolute top-20 right-24 w-40 h-40 rounded-full border border-[#5de6ff]/15 pointer-events-none -z-10" />

        <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
          {/* Radar Pulse Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#161b2b] border border-[#25293a] mb-5 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5de6ff] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5de6ff]" />
            </span>
            <span className="text-[11px] font-mono font-semibold text-[#5de6ff] tracking-widest uppercase">
              Global Telemetry Radar Active
            </span>
          </div>

          {/* Main Catchphrase */}
          <h1 className="text-3xl sm:text-5xl lg:text-[48px] font-bold tracking-tight text-[#dee1f9] max-w-4xl leading-tight">
            Discover the{' '}
            <span className="bg-gradient-to-r from-[#d0bcff] via-[#5de6ff] to-[#4edea3] bg-clip-text text-transparent">
              minds behind the code.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base text-[#958ea0] leading-relaxed">
            Explore developer profiles, uncover standout repositories, and inspect ecosystem telemetry across open-source velocity signals.
          </p>

          {/* Search Console Bar */}
          <div className="w-full max-w-3xl mt-8">
            <form
              onSubmit={handleSearchSubmit}
              className="relative group flex items-center bg-[#161b2b] border border-[#25293a] rounded-xl shadow-xl transition-all duration-300 focus-within:border-[#5de6ff]/60"
            >
              <div className="pl-4 flex items-center pointer-events-none text-[#5de6ff]">
                <Radar className="w-6 h-6 animate-spin [animation-duration:8s]" />
              </div>
              <input
                autoComplete="off"
                spellCheck={false}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search GitHub username (e.g. antfu, torvalds, shadcn)..."
                className="w-full bg-transparent px-4 py-4 text-[#dee1f9] placeholder:text-[#958ea0] text-sm md:text-base focus:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="pr-2 text-[#958ea0] hover:text-[#dee1f9] transition-colors"
                  title="Clear input"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <div className="pr-2 flex items-center gap-2">
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded bg-[#1a1f30] text-[#958ea0] font-mono text-xs">
                  Enter
                </kbd>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#a078ff] text-[#0e1323] text-sm font-semibold hover:bg-[#d0bcff] transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Inspecting...' : 'Inspect'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Curated Signal Hotlist Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-[11px] font-mono text-[#958ea0] uppercase tracking-wider mr-1">
                Signal Hotlist:
              </span>
              {signalHotlist.map((user) => {
                const isActive = currentProfile?.login.toLowerCase() === user.toLowerCase();
                return (
                  <button
                    key={user}
                    onClick={() => handleHotlistClick(user)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                      isActive
                        ? 'bg-[#25293a] text-[#5de6ff] ring-1 ring-[#5de6ff]/30 font-semibold'
                        : 'bg-[#1a1f30] text-[#cbc3d7] hover:bg-[#25293a] hover:text-[#dee1f9]'
                    }`}
                  >
                    @{user}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Error / Feedback Alert Banner */}
      {error && !isErrorDismissed && (
        <section className="px-4 md:px-8 max-w-[1280px] mx-auto w-full mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#161b2b] border border-[#ffb4ab]/30 shadow-md">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-[#ffb4ab] shrink-0" />
              <div>
                <div className="text-sm font-semibold text-[#dee1f9]">
                  Target Telemetry Notice
                </div>
                <div className="text-xs text-[#958ea0]">{error}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onRetry}
                className="px-3 py-1.5 rounded-lg bg-[#25293a] text-[#dee1f9] text-xs font-medium hover:bg-[#34394a] transition-colors"
              >
                Retry Query
              </button>
              <button
                onClick={() => setIsErrorDismissed(true)}
                className="p-1 text-[#958ea0] hover:text-[#dee1f9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-4 flex flex-col gap-6 animate-pulse">
          <div className="h-48 rounded-xl bg-[#161b2b] w-full" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-28 rounded-xl bg-[#161b2b]" />
            <div className="h-28 rounded-xl bg-[#161b2b]" />
            <div className="h-28 rounded-xl bg-[#161b2b]" />
            <div className="h-28 rounded-xl bg-[#161b2b]" />
          </div>
          <div className="h-32 rounded-xl bg-[#161b2b] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-44 rounded-xl bg-[#161b2b]" />
            <div className="h-44 rounded-xl bg-[#161b2b]" />
            <div className="h-44 rounded-xl bg-[#161b2b]" />
          </div>
        </div>
      )}

      {/* Main Dashboard Canvas */}
      {!isLoading && currentProfile && (
        <main className="max-w-[1280px] mx-auto w-full px-4 md:px-8 pb-14 flex flex-col gap-6">
          {/* Profile Dossier Header */}
          <section className="relative bg-[#161b2b] border border-[#25293a] rounded-xl p-6 md:p-8 shadow-xl overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#5de6ff]/5 blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              {/* Identity Cluster */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                {/* Glowing Avatar Frame */}
                <div className="relative group shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-[#5de6ff] via-[#d0bcff] to-[#4edea3] rounded-full blur-sm opacity-70 group-hover:opacity-100 transition duration-500" />
                  <img
                    alt={currentProfile.name || currentProfile.login}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover bg-[#25293a] ring-2 ring-[#161b2b]"
                    src={currentProfile.avatar_url}
                  />
                  <span
                    className="absolute bottom-1 right-1 p-1 rounded-full bg-[#080d1d] text-[#5de6ff] shadow-md border border-[#25293a]"
                    title="Active Synchronized Node"
                  >
                    <BadgeCheck className="w-4 h-4" />
                  </span>
                </div>

                {/* Metadata Identification */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#dee1f9]">
                      {currentProfile.name || currentProfile.login}
                    </h2>
                    <span className="font-mono text-base text-[#5de6ff]">
                      @{currentProfile.login}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#1a1f30] text-[#4edea3] border border-[#4edea3]/20">
                      PRO CORE
                    </span>
                  </div>

                  <p className="text-sm text-[#cbc3d7] max-w-xl leading-relaxed">
                    {currentProfile.bio || 'No public bio published for this telemetry profile.'}
                  </p>

                  {/* Coordinates Info */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-xs text-[#958ea0]">
                    {currentProfile.company && (
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#5de6ff]" />
                        <span>{currentProfile.company}</span>
                      </div>
                    )}
                    {currentProfile.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#d0bcff]" />
                        <span>{currentProfile.location}</span>
                      </div>
                    )}
                    {currentProfile.blog && (
                      <div className="flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-[#4edea3]" />
                        <a
                          href={
                            currentProfile.blog.startsWith('http')
                              ? currentProfile.blog
                              : `https://${currentProfile.blog}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#4edea3] hover:underline"
                        >
                          {currentProfile.blog.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#958ea0]" />
                      <span>
                        Joined{' '}
                        {new Date(currentProfile.created_at).toLocaleString('default', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => onToggleBookmarkProfile(currentProfile)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 text-xs font-semibold ${
                    profileIsSaved
                      ? 'bg-[#25293a] text-[#5de6ff] ring-1 ring-[#5de6ff]/30'
                      : 'bg-[#25293a] text-[#dee1f9] hover:bg-[#34394a]'
                  }`}
                >
                  {profileIsSaved ? (
                    <BookmarkCheck className="w-4 h-4 text-[#5de6ff]" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-[#d0bcff]" />
                  )}
                  <span>{profileIsSaved ? 'Saved to Radar' : 'Save Profile'}</span>
                </button>
                <a
                  href={currentProfile.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#080d1d] text-[#5de6ff] hover:text-[#dee1f9] hover:bg-[#1a1f30] border border-[#25293a] text-xs font-semibold transition-all shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>GitHub Source</span>
                </a>
              </div>
            </div>
          </section>

          {/* Key Metrics Telemetry Strip (4 KPI Cards) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Public Repositories */}
            <div className="bg-[#161b2b] border border-[#25293a] p-4 rounded-xl shadow-lg flex flex-col justify-between group hover:border-[#5de6ff]/30 transition-colors">
              <div className="flex items-center justify-between text-[#958ea0]">
                <span className="text-[11px] font-mono uppercase tracking-wider">
                  Public Repositories
                </span>
                <FolderGit2 className="w-4 h-4 text-[#5de6ff]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-[#dee1f9] tracking-tight font-mono">
                  {formatNumber(currentProfile.public_repos)}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5de6ff]" />
                  <span className="text-xs text-[#958ea0]">Full public index</span>
                </div>
              </div>
            </div>

            {/* Metric 2: Global Followers */}
            <div className="bg-[#161b2b] border border-[#25293a] p-4 rounded-xl shadow-lg flex flex-col justify-between group hover:border-[#d0bcff]/30 transition-colors">
              <div className="flex items-center justify-between text-[#958ea0]">
                <span className="text-[11px] font-mono uppercase tracking-wider">
                  Global Followers
                </span>
                <Users className="w-4 h-4 text-[#d0bcff]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-[#dee1f9] tracking-tight font-mono">
                  {formatNumber(currentProfile.followers)}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d0bcff]" />
                  <span className="text-xs text-[#958ea0]">Community network weight</span>
                </div>
              </div>
            </div>

            {/* Metric 3: Indexed Stars */}
            <div className="bg-[#161b2b] border border-[#25293a] p-4 rounded-xl shadow-lg flex flex-col justify-between group hover:border-[#5de6ff]/30 transition-colors">
              <div className="flex items-center justify-between text-[#958ea0]">
                <span className="text-[11px] font-mono uppercase tracking-wider">
                  Indexed Stars
                </span>
                <Star className="w-4 h-4 text-[#5de6ff] fill-[#5de6ff]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-[#5de6ff] tracking-tight font-mono">
                  {formatNumber(totalStarsCount)}
                </div>
                <div className="flex items-center gap-1.5 mt-1" title="Sum of stars across top indexed public repositories">
                  <Info className="w-3.5 h-3.5 text-[#958ea0]" />
                  <span className="text-xs text-[#958ea0] truncate">Top 100 public repos sum</span>
                </div>
              </div>
            </div>

            {/* Metric 4: Primary Language Vector */}
            <div className="bg-[#161b2b] border border-[#25293a] p-4 rounded-xl shadow-lg flex flex-col justify-between group hover:border-[#4edea3]/30 transition-colors">
              <div className="flex items-center justify-between text-[#958ea0]">
                <span className="text-[11px] font-mono uppercase tracking-wider">
                  Primary Language Vector
                </span>
                <Terminal className="w-4 h-4 text-[#4edea3]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-[#4edea3] tracking-tight font-mono truncate">
                  {topLang}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                  <span className="text-xs text-[#958ea0]">
                    {topPercent > 0 ? `${topPercent}% frequency lead` : 'No language lead'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Language Telemetry Density Panel */}
          <section className="bg-[#161b2b] border border-[#25293a] p-5 md:p-6 rounded-xl shadow-lg flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="text-lg font-semibold text-[#dee1f9]">
                  Language Telemetry Density
                </h3>
                <p className="text-xs text-[#958ea0]">
                  Based on primary detected repository language across public active repositories.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#958ea0]">
                <span className="w-2 h-2 rounded-full bg-[#5de6ff]" />
                <span>Sample size: Top {repos.length} Repos</span>
              </div>
            </div>

            {/* Segmented Stacked Bar Distribution */}
            <div className="h-3 w-full rounded-full bg-[#2f3446] overflow-hidden flex">
              {langStats.length > 0 ? (
                langStats.map((item) => (
                  <div
                    key={item.name}
                    className={`h-full ${item.colorClass} transition-all duration-700`}
                    style={{ width: `${item.percentage}%` }}
                    title={`${item.name}: ${item.percentage}% (${item.count} repos)`}
                  />
                ))
              ) : (
                <div className="h-full bg-[#958ea0] w-full" title="No language data" />
              )}
            </div>

            {/* Granular Language Legend Tags */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
              {langStats.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.colorClass}`} />
                  <span className="font-semibold text-[#dee1f9]">{item.name}</span>
                  <span className="text-[#958ea0]">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* Repositories Telemetry Deck & Control Filters */}
          <section className="flex flex-col gap-4">
            {/* Filter and Control Cockpit */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#161b2b] border border-[#25293a] p-4 rounded-xl shadow-md">
              {/* Repo Subsearch Field */}
              <div className="relative flex-1 max-w-md">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#958ea0] w-4 h-4" />
                <input
                  type="text"
                  value={repoFilterQuery}
                  onChange={(e) => setRepoFilterQuery(e.target.value)}
                  placeholder="Filter repositories by name or topic..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#1a1f30] text-[#dee1f9] placeholder:text-[#958ea0] text-xs focus:outline-none focus:ring-1 focus:ring-[#5de6ff] border border-[#2f3446]/30"
                />
              </div>

              {/* Filters & View Mode */}
              <div className="flex flex-wrap items-center gap-2.5 justify-between md:justify-end">
                {/* Language Select */}
                <div className="flex items-center gap-1.5 bg-[#1a1f30] px-2.5 py-1.5 rounded-lg border border-[#2f3446]/40">
                  <span className="text-[11px] font-mono text-[#958ea0] uppercase">Lang:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-transparent text-[#dee1f9] text-xs focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="ALL" className="bg-[#161b2b] text-[#dee1f9]">
                      All Languages
                    </option>
                    {availableLanguages.map((l) => (
                      <option key={l} value={l} className="bg-[#161b2b] text-[#dee1f9]">
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Select */}
                <div className="flex items-center gap-1.5 bg-[#1a1f30] px-2.5 py-1.5 rounded-lg border border-[#2f3446]/40">
                  <span className="text-[11px] font-mono text-[#958ea0] uppercase">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-transparent text-[#dee1f9] text-xs focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="stars" className="bg-[#161b2b] text-[#dee1f9]">
                      Most Stars
                    </option>
                    <option value="updated" className="bg-[#161b2b] text-[#dee1f9]">
                      Recently Updated
                    </option>
                    <option value="forks" className="bg-[#161b2b] text-[#dee1f9]">
                      Most Forks
                    </option>
                    <option value="name" className="bg-[#161b2b] text-[#dee1f9]">
                      Name (A-Z)
                    </option>
                  </select>
                </div>

                {/* View Mode Toggle (Grid vs List) */}
                <div className="flex items-center bg-[#1a1f30] p-0.5 rounded-lg border border-[#2f3446]/40">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[#2f3446] text-[#5de6ff]'
                        : 'text-[#958ea0] hover:text-[#dee1f9]'
                    }`}
                    title="Grid Layout"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[#2f3446] text-[#5de6ff]'
                        : 'text-[#958ea0] hover:text-[#dee1f9]'
                    }`}
                    title="List Layout"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Repos Count Ticker */}
                <div className="px-3 py-1.5 rounded-lg bg-[#1a1f30] text-[#5de6ff] text-xs font-mono font-medium border border-[#2f3446]/40">
                  <span>{filteredRepos.length}</span> Repos Displayed
                </div>
              </div>
            </div>

            {/* Repositories Grid / List */}
            {filteredRepos.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-[#161b2b] border border-[#25293a] rounded-xl p-8">
                <Search className="w-8 h-8 text-[#958ea0] mb-2" />
                <div className="text-base text-[#dee1f9] font-semibold">
                  No repositories match telemetry filter
                </div>
                <p className="text-xs text-[#958ea0] mt-1">
                  Adjust search phrase or language parameters.
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'grid grid-cols-1 gap-3'
                }
              >
                {displayedRepos.map((repo) => {
                  const isStarred = isRepoStarred(repo.full_name || repo.name);
                  return (
                    <article
                      key={repo.id}
                      className="bg-[#161b2b] border border-[#25293a] rounded-xl p-4 shadow-md flex flex-col justify-between hover:bg-[#1a1f30] hover:border-[#5de6ff]/30 transition-all group duration-200"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Code2 className="w-4 h-4 text-[#5de6ff] shrink-0" />
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-base font-semibold text-[#dee1f9] hover:text-[#5de6ff] truncate transition-colors"
                              title={repo.name}
                            >
                              {repo.name}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-[#25293a] text-[#958ea0]">
                              {repo.visibility || 'Public'}
                            </span>
                            <button
                              type="button"
                              onClick={() => onToggleStarRepo(repo)}
                              className={`p-1 transition-colors ${
                                isStarred
                                  ? 'text-[#5de6ff]'
                                  : 'text-[#958ea0] hover:text-[#5de6ff]'
                              }`}
                              title={isStarred ? 'Remove bookmark' : 'Bookmark Repository'}
                            >
                              <Bookmark
                                className={`w-4 h-4 ${isStarred ? 'fill-[#5de6ff]' : ''}`}
                              />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-[#958ea0] line-clamp-2 mt-2 leading-relaxed">
                          {repo.description || 'No description provided by telemetry manifest.'}
                        </p>
                      </div>

                      <div className="pt-4 flex flex-col gap-2">
                        {/* Topics */}
                        {repo.topics && repo.topics.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {repo.topics.slice(0, 3).map((topic) => (
                              <span
                                key={topic}
                                className="px-2 py-0.5 rounded-full bg-[#1a1f30] text-[#cbc3d7] text-[10px] font-mono border border-[#2f3446]/40"
                              >
                                #{topic}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[#958ea0] text-xs pt-1 border-t border-[#25293a]/40">
                          <div className="flex items-center gap-3">
                            {repo.language && (
                              <span className="flex items-center gap-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full ${getLanguageBgClass(
                                    repo.language
                                  )}`}
                                />
                                <span className="text-[#dee1f9]">{repo.language}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-[#5de6ff] fill-[#5de6ff]" />
                              <span>{formatNumber(repo.stargazers_count)}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <GitFork className="w-3.5 h-3.5 text-[#958ea0]" />
                              <span>{formatNumber(repo.forks_count)}</span>
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-[#958ea0]">
                            Updated {formatTimeAgo(repo.pushed_at || repo.updated_at)}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination: Load More Repositories */}
            {displayCount < filteredRepos.length && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setDisplayCount((prev) => prev + 6)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#25293a] text-[#dee1f9] hover:bg-[#34394a] transition-all shadow-md text-xs font-semibold"
                >
                  <RotateCw className="w-4 h-4 text-[#5de6ff]" />
                  <span>Load More Repositories ({filteredRepos.length - displayCount} remaining)</span>
                </button>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
};
