import React, { useState } from 'react';
import {
  Bookmark,
  User,
  Trash2,
  Download,
  ExternalLink,
  Code2,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';

interface SavedViewProps {
  savedProfiles: string[];
  starredRepos: string[];
  onInspectUser: (username: string) => void;
  onRemoveProfile: (username: string) => void;
  onRemoveStarredRepo: (repoName: string) => void;
  onClearAll: () => void;
  onNavigateExplore: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  savedProfiles,
  starredRepos,
  onInspectUser,
  onRemoveProfile,
  onRemoveStarredRepo,
  onClearAll,
  onNavigateExplore,
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'repos'>('profiles');

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      savedProfiles,
      starredRepos,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporadar-telemetry-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1a1f30]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b2b] border border-[#25293a] text-xs font-mono text-[#5de6ff] mb-3">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Local Vault &amp; Memory Stream</span>
          </div>
          <h1 className="text-3xl font-bold text-[#dee1f9]">Saved Profiles &amp; Repositories</h1>
          <p className="text-sm text-[#958ea0] mt-1">
            Locally synchronized bookmarks, developer telemetry targets, and pinned repositories.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#161b2b] hover:bg-[#25293a] text-xs font-mono text-[#cbc3d7] border border-[#25293a] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#5de6ff]" />
            <span>Export JSON</span>
          </button>
          {(savedProfiles.length > 0 || starredRepos.length > 0) && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#161b2b] hover:bg-[#ffb4ab]/10 text-xs font-mono text-[#ffb4ab] border border-[#ffb4ab]/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Vault</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#25293a] pb-2">
        <button
          onClick={() => setActiveTab('profiles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'profiles'
              ? 'bg-[#a078ff] text-[#0e1323]'
              : 'text-[#cbc3d7] hover:text-[#dee1f9] hover:bg-[#161b2b]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Saved Profiles ({savedProfiles.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('repos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'repos'
              ? 'bg-[#a078ff] text-[#0e1323]'
              : 'text-[#cbc3d7] hover:text-[#dee1f9] hover:bg-[#161b2b]'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Starred Repos ({starredRepos.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'profiles' && (
        <div className="flex flex-col gap-4">
          {savedProfiles.length === 0 ? (
            <div className="py-16 text-center bg-[#161b2b] rounded-xl border border-[#25293a] p-8 flex flex-col items-center">
              <FolderOpen className="w-10 h-10 text-[#958ea0] mb-3 opacity-50" />
              <div className="text-base font-semibold text-[#dee1f9]">
                No developer profiles saved yet
              </div>
              <p className="text-xs text-[#958ea0] mt-1 max-w-sm">
                While exploring profiles like @antfu, @shadcn, or @gaearon, click &quot;Save Profile&quot; to keep them pinned here.
              </p>
              <button
                onClick={onNavigateExplore}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#a078ff] text-[#0e1323] text-xs font-semibold hover:bg-[#d0bcff] transition-colors"
              >
                <span>Explore Profiles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedProfiles.map((user) => (
                <div
                  key={user}
                  className="bg-[#161b2b] border border-[#25293a] rounded-xl p-4 flex items-center justify-between gap-3 hover:border-[#5de6ff]/30 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#25293a] flex items-center justify-center font-mono font-bold text-[#5de6ff] ring-1 ring-[#5de6ff]/30 uppercase shrink-0">
                      {user.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#dee1f9] truncate">@{user}</div>
                      <div className="text-[11px] text-[#958ea0] font-mono">Pinned Radar Target</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onInspectUser(user)}
                      className="px-3 py-1.5 rounded-lg bg-[#25293a] hover:bg-[#34394a] text-xs text-[#5de6ff] font-semibold transition-colors"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => onRemoveProfile(user)}
                      className="p-1.5 rounded-lg hover:bg-[#ffb4ab]/10 text-[#958ea0] hover:text-[#ffb4ab] transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'repos' && (
        <div className="flex flex-col gap-4">
          {starredRepos.length === 0 ? (
            <div className="py-16 text-center bg-[#161b2b] rounded-xl border border-[#25293a] p-8 flex flex-col items-center">
              <FolderOpen className="w-10 h-10 text-[#958ea0] mb-3 opacity-50" />
              <div className="text-base font-semibold text-[#dee1f9]">
                No repositories bookmarked yet
              </div>
              <p className="text-xs text-[#958ea0] mt-1 max-w-sm">
                Star repositories in the Explore or Trending screens to keep direct links handy.
              </p>
              <button
                onClick={onNavigateExplore}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#a078ff] text-[#0e1323] text-xs font-semibold hover:bg-[#d0bcff] transition-colors"
              >
                <span>Browse Repositories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {starredRepos.map((repoName) => (
                <div
                  key={repoName}
                  className="bg-[#161b2b] border border-[#25293a] rounded-xl p-4 flex items-center justify-between gap-3 hover:border-[#5de6ff]/30 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Code2 className="w-5 h-5 text-[#5de6ff] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#dee1f9] truncate" title={repoName}>
                        {repoName}
                      </div>
                      <div className="text-[11px] text-[#958ea0] font-mono">Bookmarked Project</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`https://github.com/${repoName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#25293a] hover:bg-[#34394a] text-[#5de6ff] transition-colors"
                      title="Open on GitHub"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => onRemoveStarredRepo(repoName)}
                      className="p-1.5 rounded-lg hover:bg-[#ffb4ab]/10 text-[#958ea0] hover:text-[#ffb4ab] transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
