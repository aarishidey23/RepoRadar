import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trash2,
  Terminal,
} from 'lucide-react';
import { RateLimitStatus } from '../types';
import { getStoredPat, setStoredPat, checkRateLimit } from '../services/github';

interface ApiDocsViewProps {
  rateLimit: RateLimitStatus;
  onRateLimitUpdated: (newStatus: RateLimitStatus) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'remove' | 'error') => void;
}

export const ApiDocsView: React.FC<ApiDocsViewProps> = ({
  rateLimit,
  onRateLimitUpdated,
  showToast,
}) => {
  const [patInput, setPatInput] = useState(getStoredPat());
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSavePat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patInput.trim()) {
      setStoredPat('');
      const status = await checkRateLimit();
      onRateLimitUpdated(status);
      showToast('Personal Access Token removed. Switched to public rate limits.', 'info');
      return;
    }

    setIsVerifying(true);
    setStoredPat(patInput.trim());

    try {
      const status = await checkRateLimit();
      setIsVerifying(false);
      onRateLimitUpdated(status);

      if (status.hasPat && status.limit >= 5000) {
        showToast(`Token authorized! Expanded quota: ${status.remaining}/${status.limit} req/hr.`, 'success');
      } else {
        showToast('Token verified and saved in local storage.', 'success');
      }
    } catch {
      setIsVerifying(false);
      showToast('Token verification encountered an error. Check console.', 'error');
    }
  };

  const handleClearPat = async () => {
    setPatInput('');
    setStoredPat('');
    const status = await checkRateLimit();
    onRateLimitUpdated(status);
    showToast('Token cleared from local browser vault.', 'remove');
  };

  const percentRemaining = Math.max(
    0,
    Math.min(100, Math.round((rateLimit.remaining / (rateLimit.limit || 1)) * 100))
  );

  const resetDate = new Date(rateLimit.reset * 1000);

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#1a1f30]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b2b] border border-[#25293a] text-xs font-mono text-[#5de6ff] mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>Telemetry Architecture &amp; Quota Spec</span>
        </div>
        <h1 className="text-3xl font-bold text-[#dee1f9]">API Documentation &amp; Rate Metrics</h1>
        <p className="text-sm text-[#958ea0] mt-1">
          How RepoRadar interfaces with GitHub open-source endpoints, handles quotas, and ensures privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Quota & PAT Manager (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Rate Quota Status Card */}
          <section className="bg-[#161b2b] border border-[#25293a] rounded-xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-[#5de6ff]" />
                <h2 className="text-base font-bold text-[#dee1f9]">Current GitHub API Allocation</h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#25293a] text-[#4edea3] border border-[#4edea3]/20">
                {rateLimit.hasPat ? 'AUTHENTICATED (5,000 req/hr)' : 'PUBLIC ANONYMOUS (60 req/hr)'}
              </span>
            </div>

            {/* Quota bar */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#958ea0]">Remaining Requests</span>
                <span className="text-[#dee1f9] font-bold">
                  {rateLimit.remaining} / {rateLimit.limit} ({percentRemaining}%)
                </span>
              </div>
              <div className="w-full h-3 bg-[#25293a] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    percentRemaining > 30 ? 'bg-[#4edea3]' : 'bg-[#ffb4ab]'
                  }`}
                  style={{ width: `${percentRemaining}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#958ea0] pt-1">
                <span>Reset timestamp: {resetDate.toLocaleTimeString()}</span>
                <span>Active status: Nominal</span>
              </div>
            </div>

            {/* Explanatory note */}
            <div className="p-3 rounded-lg bg-[#1a1f30]/60 border border-[#25293a] text-xs text-[#cbc3d7] flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#5de6ff] shrink-0 mt-0.5" />
              <span>
                GitHub limits unauthenticated REST requests to 60 per hour per IP. When researching many developers, adding a personal read-only token expands your allocation to 5,000 requests per hour.
              </span>
            </div>
          </section>

          {/* Personal Access Token Configurator */}
          <section className="bg-[#161b2b] border border-[#25293a] rounded-xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-[#d0bcff]" />
              <h2 className="text-base font-bold text-[#dee1f9]">Configure Personal Access Token (PAT)</h2>
            </div>

            <p className="text-xs text-[#958ea0] leading-relaxed">
              Your token is stored strictly inside your browser&apos;s local storage (<code className="text-[#5de6ff] font-mono">localStorage</code>) and is never transmitted to any third-party server or telemetry service.
            </p>

            <form onSubmit={handleSavePat} className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="password"
                  value={patInput}
                  onChange={(e) => setPatInput(e.target.value)}
                  placeholder="github_pat_... or ghp_..."
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#1a1f30] border border-[#25293a] text-xs font-mono text-[#dee1f9] placeholder:text-[#958ea0] focus:outline-none focus:border-[#5de6ff]"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-4 py-2.5 rounded-lg bg-[#a078ff] text-[#0e1323] text-xs font-semibold hover:bg-[#d0bcff] transition-colors disabled:opacity-50 shrink-0"
                >
                  {isVerifying ? 'Verifying...' : 'Save & Verify'}
                </button>
                {getStoredPat() && (
                  <button
                    type="button"
                    onClick={handleClearPat}
                    className="p-2.5 rounded-lg bg-[#25293a] hover:bg-[#ffb4ab]/10 text-[#ffb4ab] transition-colors shrink-0"
                    title="Clear Token"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-[11px] text-[#958ea0]">
                Requires zero permissions (public data only). Create one at{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5de6ff] hover:underline"
                >
                  github.com/settings/tokens
                </a>.
              </div>
            </form>
          </section>

          {/* Telemetry Architecture Overview */}
          <section className="bg-[#161b2b] border border-[#25293a] rounded-xl p-6 shadow-xl flex flex-col gap-4">
            <h2 className="text-base font-bold text-[#dee1f9]">Telemetry Data Pipeline</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-[#1a1f30]/60 border border-[#25293a]">
                <div className="font-bold text-[#5de6ff] mb-1">REST Profile Ingestion</div>
                <p className="text-[#958ea0] leading-relaxed">
                  Queries <code className="text-[#dee1f9]">/users/:username</code> to retrieve primary identity coordinates, bios, location metadata, and public repo counts.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#1a1f30]/60 border border-[#25293a]">
                <div className="font-bold text-[#4edea3] mb-1">Repository Vector Sampling</div>
                <p className="text-[#958ea0] leading-relaxed">
                  Analyzes the top 100 repositories sorted by latest activity to calculate language distributions, star sums, and community engagement.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#1a1f30]/60 border border-[#25293a]">
                <div className="font-bold text-[#d0bcff] mb-1">Local Sandboxing</div>
                <p className="text-[#958ea0] leading-relaxed">
                  All bookmarks and saved search histories are stored purely on your client device. No tracking cookies or remote database telemetry.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#1a1f30]/60 border border-[#25293a]">
                <div className="font-bold text-[#ffb4ab] mb-1">Resilient Fallback Cache</div>
                <p className="text-[#958ea0] leading-relaxed">
                  Even during rate-limited windows or offline network states, high-profile open-source developers remain fully inspectable.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Security & Metrics Spec (1 Col) */}
        <div className="flex flex-col gap-6">
          {/* Security & Privacy Card */}
          <div className="bg-[#161b2b] border border-[#25293a] rounded-xl p-6 shadow-xl flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4edea3]" />
              <h3 className="text-sm font-bold text-[#dee1f9]">Privacy Guarantee</h3>
            </div>
            <p className="text-xs text-[#958ea0] leading-relaxed">
              RepoRadar never stores or transmits personal credentials to remote tracking backends. All query operations are routed directly to official GitHub API gateways.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs font-mono text-[#cbc3d7]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
                <span>Zero Server Telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
                <span>Client Sandbox Isolation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
                <span>Zero-Permission PAT Support</span>
              </div>
            </div>
          </div>

          {/* Metric Calculation Spec */}
          <div className="bg-[#161b2b] border border-[#25293a] rounded-xl p-6 shadow-xl flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#5de6ff]" />
              <h3 className="text-sm font-bold text-[#dee1f9]">Metric Formulas</h3>
            </div>
            <div className="flex flex-col gap-3 text-xs text-[#958ea0]">
              <div>
                <div className="font-semibold text-[#dee1f9]">Indexed Stars</div>
                <div className="font-mono text-[11px] text-[#5de6ff] mt-0.5">
                  Σ stargazers_count (top 100 repos)
                </div>
              </div>
              <div>
                <div className="font-semibold text-[#dee1f9]">Language Density</div>
                <div className="font-mono text-[11px] text-[#4edea3] mt-0.5">
                  (count(lang) / total_repos) × 100%
                </div>
              </div>
              <div>
                <div className="font-semibold text-[#dee1f9]">Primary Language Vector</div>
                <div className="text-[11px] mt-0.5">
                  Identified by the language with the highest repository frequency in the developer&apos;s portfolio.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
