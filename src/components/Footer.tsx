import React from 'react';
import { Terminal } from 'lucide-react';

interface FooterProps {
  onOpenPatConfig?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPatConfig }) => {
  return (
    <footer className="w-full bg-[#080d1d] border-t border-[#1a1f30] mt-auto">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">
        {/* Engine Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#161b2b]/60 border border-[#25293a]">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-[#5de6ff] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[#dee1f9]">
                RepoRadar Telemetry Engine
              </div>
              <div className="text-xs text-[#958ea0]">
                Powered by GitHub REST &amp; GraphQL v4 endpoints. Cached locally.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-mono bg-[#25293a] text-[#5de6ff]">
              TypeScript
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-mono bg-[#25293a] text-[#d0bcff]">
              TailwindCSS
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-mono bg-[#25293a] text-[#4edea3]">
              Octokit
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-mono bg-[#25293a] text-[#cbc3d7]">
              IndexedDB Local
            </span>
          </div>
        </div>

        {/* 3 Information Grid Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-[#cbc3d7]">
          {/* Column 1 */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#dee1f9] font-semibold">
              API Attribution &amp; Quota
            </span>
            <p className="text-xs text-[#958ea0] leading-relaxed">
              RepoRadar functions via anonymous GitHub public quotas capped at 60 calls/hour. Authenticate personal PAT in telemetry settings for expanded 5,000 req/hr allocation.
            </p>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#dee1f9] font-semibold">
              Privacy &amp; Local Sync
            </span>
            <p className="text-xs text-[#958ea0] leading-relaxed">
              Bookmarked profiles, starred telemetry streams, and query history stay strictly inside your browser&apos;s local sandbox storage. Zero remote analytics logging.
            </p>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#dee1f9] font-semibold">
              Keyboard Navigation
            </span>
            <div className="flex flex-col gap-1.5 text-xs text-[#958ea0]">
              <div className="flex items-center justify-between">
                <span>Global Query Spotlight</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#1a1f30] text-[#dee1f9] font-mono text-[11px]">
                  ⌘K
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Execute Inspect Mode</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#1a1f30] text-[#dee1f9] font-mono text-[11px]">
                  Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Close Overlays</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#1a1f30] text-[#dee1f9] font-mono text-[11px]">
                  Esc
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-[#1a1f30] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#958ea0]">
          <div className="flex items-center gap-2">
            <span>© 2025 REPORADAR LABS</span>
            <span>•</span>
            <span>OPEN-SOURCE TELEMETRY HARNESS</span>
          </div>
          <div className="flex items-center gap-4">
            <span
              onClick={onOpenPatConfig}
              className="hover:text-[#5de6ff] cursor-pointer transition-colors"
            >
              STATUS CLUSTER: NOMINAL
            </span>
            <span
              onClick={onOpenPatConfig}
              className="hover:text-[#5de6ff] cursor-pointer transition-colors"
            >
              RATE METRICS
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
