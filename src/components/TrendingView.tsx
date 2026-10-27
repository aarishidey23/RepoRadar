import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Flame,
  Star,
  GitFork,
  ExternalLink,
  User,
  Filter,
  Bookmark,
} from 'lucide-react';
import { TRENDING_REPOSITORIES } from '../data/mockData';
import { TrendingRepo } from '../types';
import { formatNumber, getLanguageBgClass, isRepoStarred } from '../services/github';

interface TrendingViewProps {
  onInspectUser: (username: string) => void;
  onToggleStarRepo: (repo: { full_name: string; name: string }) => void;
  starredRepos: string[];
}

export const TrendingView: React.FC<TrendingViewProps> = ({
  onInspectUser,
  onToggleStarRepo,
}) => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [selectedLang, setSelectedLang] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const languages = ['ALL', 'TypeScript', 'JavaScript', 'Rust', 'Python', 'Zig'];

  const filtered = useMemo(() => {
    return TRENDING_REPOSITORIES.filter((item) => {
      const matchTimeframe = item.timeframe === timeframe;
      const matchLang = selectedLang === 'ALL' || item.language === selectedLang;
      const matchQuery =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTimeframe && matchLang && matchQuery;
    });
  }, [timeframe, selectedLang, searchQuery]);

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1a1f30]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b2b] border border-[#25293a] text-xs font-mono text-[#5de6ff] mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Open-Source Velocity Ticker</span>
          </div>
          <h1 className="text-3xl font-bold text-[#dee1f9]">Trending Repositories</h1>
          <p className="text-sm text-[#958ea0] mt-1">
            Real-time standout repositories gaining high community momentum across the global radar.
          </p>
        </div>

        {/* Timeframe segmented control */}
        <div className="flex items-center gap-1 p-1 bg-[#161b2b] rounded-xl border border-[#25293a] self-start md:self-auto">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeframe === 'today'
                ? 'bg-[#a078ff] text-[#0e1323] shadow-sm'
                : 'text-[#cbc3d7] hover:text-[#dee1f9]'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeframe === 'week'
                ? 'bg-[#a078ff] text-[#0e1323] shadow-sm'
                : 'text-[#cbc3d7] hover:text-[#dee1f9]'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeframe === 'month'
                ? 'bg-[#a078ff] text-[#0e1323] shadow-sm'
                : 'text-[#cbc3d7] hover:text-[#dee1f9]'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Filter strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161b2b] border border-[#25293a] p-3 rounded-xl">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Filter className="w-4 h-4 text-[#958ea0] ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter trending repositories..."
            className="w-full bg-transparent text-xs text-[#dee1f9] placeholder:text-[#958ea0] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono text-[#958ea0] uppercase shrink-0">
            Language:
          </span>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors shrink-0 ${
                selectedLang === lang
                  ? 'bg-[#25293a] text-[#5de6ff] font-semibold border border-[#5de6ff]/30'
                  : 'bg-[#1a1f30] text-[#cbc3d7] hover:bg-[#25293a]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Items List */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center bg-[#161b2b] rounded-xl border border-[#25293a] p-8">
            <Flame className="w-8 h-8 text-[#958ea0] mx-auto mb-2 opacity-50" />
            <div className="text-sm font-semibold text-[#dee1f9]">
              No repositories match current filters
            </div>
            <p className="text-xs text-[#958ea0] mt-1">
              Try switching the timeframe tab or selecting All Languages.
            </p>
          </div>
        ) : (
          filtered.map((repo: TrendingRepo) => {
            const isStarred = isRepoStarred(repo.id);
            return (
              <article
                key={repo.id}
                className="bg-[#161b2b] border border-[#25293a] rounded-xl p-5 hover:bg-[#1a1f30] hover:border-[#5de6ff]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <img
                    src={repo.ownerAvatar}
                    alt={repo.owner}
                    className="w-10 h-10 rounded-lg bg-[#25293a] object-cover shrink-0 ring-1 ring-[#2f3446]"
                  />
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-bold text-[#dee1f9] hover:text-[#5de6ff] transition-colors truncate"
                      >
                        {repo.id}
                      </a>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20">
                        <Flame className="w-3 h-3" />
                        <span>+{formatNumber(repo.starsGained)} stars {timeframe}</span>
                      </span>
                    </div>

                    <p className="text-xs text-[#cbc3d7] line-clamp-2 max-w-3xl leading-relaxed">
                      {repo.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#958ea0]">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${getLanguageBgClass(repo.language)}`} />
                        <span className="text-[#dee1f9]">{repo.language}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-[#5de6ff] fill-[#5de6ff]" />
                        <span>{formatNumber(repo.stars)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3.5 h-3.5 text-[#958ea0]" />
                        <span>{formatNumber(repo.forks)}</span>
                      </span>
                      {repo.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 rounded-full bg-[#1a1f30] text-[10px] text-[#cbc3d7]"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onInspectUser(repo.owner)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25293a] hover:bg-[#34394a] text-xs font-semibold text-[#dee1f9] transition-colors"
                    title={`Inspect ${repo.owner} in Radar`}
                  >
                    <User className="w-3.5 h-3.5 text-[#5de6ff]" />
                    <span>Inspect Owner</span>
                  </button>

                  <button
                    onClick={() => onToggleStarRepo({ full_name: repo.id, name: repo.name })}
                    className={`p-2 rounded-lg bg-[#25293a] hover:bg-[#34394a] transition-colors ${
                      isStarred ? 'text-[#5de6ff]' : 'text-[#958ea0] hover:text-[#dee1f9]'
                    }`}
                    title={isStarred ? 'Remove from saved' : 'Star repo'}
                  >
                    <Bookmark className={`w-4 h-4 ${isStarred ? 'fill-[#5de6ff]' : ''}`} />
                  </button>

                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[#25293a] hover:bg-[#34394a] text-[#958ea0] hover:text-[#dee1f9] transition-colors"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
