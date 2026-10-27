import React from 'react';
import { Search } from 'lucide-react';
import { RateLimitStatus } from '../types';

export type NavTab = 'explore' | 'trending' | 'saved' | 'api-docs';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSpotlight: () => void;
  rateLimit: RateLimitStatus;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenSpotlight,
  rateLimit,
  savedCount,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#0e1323]/85 backdrop-blur-xl border-b border-[#1a1f30] shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      <div className="h-16 w-full max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Brand Lockup & Navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          <button
            onClick={() => onSelectTab('explore')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <img
              alt="RepoRadar Brand Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida/AEtjO1XMpNX9NhPVKjDrlcbHDy2-3ZHnwtF-mO1c-n1i_Y1CbKF5yedgCW8DwBLzXcYdYyAwpR-n9kbjXh6fCoNbHaxDOQt2xCxnOHKK0bqptQYB6tsiB-gYetkxhP7gCMnsdQbyXIgWvW73GmUuvhMk3IocMwFT2tAveaUyQQmXBvgeBMkr6r2Ns3IQF0gyWDeGBkkThMNUzK7qU1DxbJl-ATgb0FL7zoUxxxnYR_1JMo-cMWitn_LHAyrE-e0j"
            />
            <span className="font-bold text-xl tracking-tight text-[#dee1f9]">
              RepoRadar
            </span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#25293a] text-[#5de6ff] tracking-wider">
              v2.4
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm">
            <button
              onClick={() => onSelectTab('explore')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                currentTab === 'explore'
                  ? 'bg-[#a078ff] text-[#0e1323] font-semibold shadow-sm'
                  : 'text-[#cbc3d7] hover:text-[#dee1f9] hover:bg-[#25293a]'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => onSelectTab('trending')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                currentTab === 'trending'
                  ? 'bg-[#a078ff] text-[#0e1323] font-semibold shadow-sm'
                  : 'text-[#cbc3d7] hover:text-[#dee1f9] hover:bg-[#25293a]'
              }`}
            >
              Trending Repos
            </button>
            <button
              onClick={() => onSelectTab('saved')}
              className={`relative px-3 py-1.5 rounded-lg transition-colors font-medium ${
                currentTab === 'saved'
                  ? 'bg-[#a078ff] text-[#0e1323] font-semibold shadow-sm'
                  : 'text-[#cbc3d7] hover:text-[#dee1f9] hover:bg-[#25293a]'
              }`}
            >
              <span>Saved Profiles &amp; Repos</span>
              {savedCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#5de6ff]/20 text-[#5de6ff]">
                  {savedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onSelectTab('api-docs')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                currentTab === 'api-docs'
                  ? 'bg-[#a078ff] text-[#0e1323] font-semibold shadow-sm'
                  : 'text-[#cbc3d7] hover:text-[#dee1f9] hover:bg-[#25293a]'
              }`}
            >
              API Docs &amp; About
            </button>
          </nav>
        </div>

        {/* Right Section: Spotlight trigger, Rate quota, User thumbnail */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Quick Telemetry Search Button */}
          <button
            onClick={onOpenSpotlight}
            className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-[#1a1f30] text-[#cbc3d7] hover:text-[#dee1f9] hover:bg-[#25293a] border border-[#2f3446]/40 transition-colors"
            type="button"
            title="Press ⌘K or Ctrl+K to search"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#5de6ff]" />
              <span className="text-xs hidden sm:inline text-[#958ea0]">
                Quick telemetry search...
              </span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[#080d1d] text-[#958ea0] font-mono text-[10px] tracking-wide">
              ⌘K
            </kbd>
          </button>

          {/* API Live Rate Quota Indicator */}
          <button
            onClick={() => onSelectTab('api-docs')}
            className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b2b] border border-[#25293a] hover:border-[#5de6ff]/40 transition-colors cursor-pointer"
            title={`Quota: ${rateLimit.remaining}/${rateLimit.limit} remaining. Click to inspect or configure Personal Access Token.`}
          >
            <span className="w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.8)] animate-pulse"></span>
            <span className="text-[11px] font-mono text-[#4edea3]">
              API Live: {rateLimit.hasPat ? `${rateLimit.remaining} req (PAT)` : `${rateLimit.limit} req/hr (Public)`}
            </span>
          </button>

          {/* Active Profile Avatar */}
          <div className="relative">
            <img
              alt="Telemetry Operator"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#2f3446]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnw22W9GjT4rkX88xBhwFWM8wjP78km329RIiEzG1hJCZflWZgd9PAl3WW1teAN4Ekb9D097Ol7QMU3DCRxz1T6VWyrEIhoQn4eWEC9I4doJPnK1g8n19YaknZK2S_r4TySpRpYNpALK-CcIsqAYISRu65ORfBQwd2ygisYZeR_T0v072U5mXtya7Eld60YlxxOOFsu8GXFQltMvfkDOIOvAIoErgmdbPZEnMgD4t62bX7ztRd2N0POA"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#5de6ff] ring-2 ring-[#0e1323]" />
          </div>
        </div>
      </div>
    </header>
  );
};
