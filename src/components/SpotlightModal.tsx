import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, BookMarked, ArrowRight, Sparkles } from 'lucide-react';

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (username: string) => void;
  recentSearches: string[];
}

export const SpotlightModal: React.FC<SpotlightModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  recentSearches,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSelectUser(query.trim());
      onClose();
    }
  };

  const handlePick = (user: string) => {
    onSelectUser(user);
    onClose();
  };

  const quickHotlist = ['antfu', 'shadcn', 'gaearon', 'sindresorhus', 'torvalds', 'yyx990803'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#161b2b] border border-[#2f3446] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-3.5 border-b border-[#25293a] bg-[#1a1f30]/60">
          <Search className="w-5 h-5 text-[#5de6ff] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search developer handle (e.g. antfu, torvalds, shadcn)..."
            className="w-full bg-transparent text-[#dee1f9] placeholder:text-[#958ea0] text-base focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[#958ea0] hover:text-[#dee1f9] p-1 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a078ff] text-[#0e1323] text-xs font-semibold hover:bg-[#d0bcff] transition-colors"
          >
            <span>Inspect</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Content suggestions */}
        <div className="p-4 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#958ea0] mb-2">
                <BookMarked className="w-3.5 h-3.5 text-[#5de6ff]" />
                <span>Recent Inquiries</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((user) => (
                  <button
                    key={user}
                    onClick={() => handlePick(user)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1f30] hover:bg-[#25293a] text-xs text-[#cbc3d7] hover:text-[#dee1f9] border border-[#2f3446]/40 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#5de6ff]" />
                    <span>@{user}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#958ea0] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#a078ff]" />
              <span>Signal Hotlist Nodes</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {quickHotlist.map((user) => (
                <button
                  key={user}
                  onClick={() => handlePick(user)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#1a1f30] hover:bg-[#25293a] text-xs text-left border border-[#2f3446]/40 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5de6ff]" />
                    <span className="font-mono text-[#dee1f9]">@{user}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#958ea0] opacity-0 group-hover:opacity-100 group-hover:text-[#5de6ff] transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2.5 bg-[#0e1323] border-t border-[#25293a] flex items-center justify-between text-[11px] font-mono text-[#958ea0]">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-[#1a1f30] text-[#dee1f9]">Enter</kbd> Inspect</span>
            <span><kbd className="px-1 py-0.5 rounded bg-[#1a1f30] text-[#dee1f9]">Esc</kbd> Close</span>
          </div>
          <span>RepoRadar Quick Spotlight</span>
        </div>
      </div>
    </div>
  );
};
