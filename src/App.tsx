import { useState, useEffect, useCallback } from 'react';
import { Header, NavTab } from './components/Header';
import { Footer } from './components/Footer';
import { ExploreView } from './components/ExploreView';
import { TrendingView } from './components/TrendingView';
import { SavedView } from './components/SavedView';
import { ApiDocsView } from './components/ApiDocsView';
import { SpotlightModal } from './components/SpotlightModal';
import { Toast, ToastData } from './components/Toast';
import { UserProfile, Repository, RateLimitStatus } from './types';
import {
  fetchUserData,
  getSavedProfiles,
  saveProfileBookmark,
  removeProfileBookmark,
  getStarredRepos,
  toggleRepoStar,
  checkRateLimit,
  currentRateLimit,
} from './services/github';
import { DEFAULT_PROFILES } from './data/mockData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('explore');
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(
    DEFAULT_PROFILES.antfu.profile
  );
  const [repos, setRepos] = useState<Repository[]>(DEFAULT_PROFILES.antfu.repos);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedProfiles, setSavedProfiles] = useState<string[]>([]);
  const [starredRepos, setStarredRepos] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus>(currentRateLimit);

  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'remove' | 'error' = 'success') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync saved profiles & starred repos on initial mount
  useEffect(() => {
    setSavedProfiles(getSavedProfiles());
    setStarredRepos(getStarredRepos());

    try {
      const recent = localStorage.getItem('reporadar_recent_searches');
      if (recent) setRecentSearches(JSON.parse(recent));
    } catch {
      // fallback
    }

    checkRateLimit().then((status) => {
      setRateLimit(status);
    });
  }, []);

  // Keyboard shortcut listener for ⌘K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchUser = async (username: string) => {
    if (!username.trim()) return;
    const cleanUser = username.trim().replace(/^@/, '');
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchUserData(cleanUser);
      setCurrentProfile(result.profile);
      setRepos(result.repos);
      setIsLoading(false);

      // Record recent search
      setRecentSearches((prev) => {
        const next = [cleanUser, ...prev.filter((u) => u.toLowerCase() !== cleanUser.toLowerCase())].slice(
          0,
          8
        );
        try {
          localStorage.setItem('reporadar_recent_searches', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      if (result.fromCache) {
        showToast(`Loaded curated telemetry profile for @${result.profile.login}`, 'info');
      } else {
        showToast(`Synchronized profile @${result.profile.login}`, 'success');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Unable to load developer telemetry data.');
      showToast(err.message || 'Developer query failed.', 'error');
    }
  };

  const handleInspectFromExternal = (username: string) => {
    setCurrentTab('explore');
    handleSearchUser(username);
  };

  const handleToggleBookmarkProfile = (profile: UserProfile) => {
    const isSaved = savedProfiles.includes(profile.login.toLowerCase());
    if (isSaved) {
      removeProfileBookmark(profile.login);
      setSavedProfiles(getSavedProfiles());
      showToast(`Profile @${profile.login} removed from bookmarks`, 'remove');
    } else {
      saveProfileBookmark(profile.login);
      setSavedProfiles(getSavedProfiles());
      showToast(`Profile @${profile.login} saved locally`, 'info');
    }
  };

  const handleToggleStarRepo = (repo: { full_name?: string; name: string }) => {
    const target = repo.full_name || repo.name;
    const starred = toggleRepoStar(target);
    setStarredRepos(getStarredRepos());
    if (starred) {
      showToast(`Repo ${target} bookmarked`, 'info');
    } else {
      showToast(`Repo ${target} removed from bookmarks`, 'remove');
    }
  };

  const handleRemoveSavedProfile = (username: string) => {
    removeProfileBookmark(username);
    setSavedProfiles(getSavedProfiles());
    showToast(`Profile @${username} removed`, 'remove');
  };

  const handleRemoveStarredRepo = (repoName: string) => {
    toggleRepoStar(repoName);
    setStarredRepos(getStarredRepos());
    showToast(`Repo ${repoName} removed from saved`, 'remove');
  };

  const handleClearAllSaved = () => {
    localStorage.removeItem('reporadar_saved_profiles');
    localStorage.removeItem('reporadar_starred_repos');
    setSavedProfiles([]);
    setStarredRepos([]);
    showToast('All saved profiles and starred repos cleared.', 'remove');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0e1323] text-[#dee1f9]">
      {/* Fixed Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        rateLimit={rateLimit}
        savedCount={savedProfiles.length + starredRepos.length}
      />

      {/* Main Content Area */}
      <div className="w-full flex-1 pt-16">
        {currentTab === 'explore' && (
          <ExploreView
            currentProfile={currentProfile}
            repos={repos}
            isLoading={isLoading}
            error={error}
            onSearch={handleSearchUser}
            onRetry={() => handleSearchUser(currentProfile?.login || 'antfu')}
            onToggleBookmarkProfile={handleToggleBookmarkProfile}
            onToggleStarRepo={handleToggleStarRepo}
            savedProfiles={savedProfiles}
            starredRepos={starredRepos}
          />
        )}

        {currentTab === 'trending' && (
          <TrendingView
            onInspectUser={handleInspectFromExternal}
            onToggleStarRepo={handleToggleStarRepo}
            starredRepos={starredRepos}
          />
        )}

        {currentTab === 'saved' && (
          <SavedView
            savedProfiles={savedProfiles}
            starredRepos={starredRepos}
            onInspectUser={handleInspectFromExternal}
            onRemoveProfile={handleRemoveSavedProfile}
            onRemoveStarredRepo={handleRemoveStarredRepo}
            onClearAll={handleClearAllSaved}
            onNavigateExplore={() => setCurrentTab('explore')}
          />
        )}

        {currentTab === 'api-docs' && (
          <ApiDocsView
            rateLimit={rateLimit}
            onRateLimitUpdated={setRateLimit}
            showToast={showToast}
          />
        )}
      </div>

      {/* Global Footer */}
      <Footer onOpenPatConfig={() => setCurrentTab('api-docs')} />

      {/* Quick Telemetry Spotlight Modal (⌘K) */}
      <SpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onSelectUser={handleInspectFromExternal}
        recentSearches={recentSearches}
      />

      {/* Floating Action Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
