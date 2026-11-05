import React from 'react';
import { Plus, Search, BookMarked, Settings, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useIsMobile } from '../hooks/useMediaQuery';

interface DockProps {
  onOpenSearch: () => void;
  onOpenStarLog: () => void;
  onOpenSettings: () => void;
}

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

function DockItem({ icon, label, onClick, active }: DockItemProps) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] ${
          active
            ? 'bg-[var(--surface-2)] text-[var(--accent-1)]'
            : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
        }`}
        aria-label={label}
      >
        {icon}
      </button>

      {/* Tooltip on hover & focus (Desktop only) */}
      <div
        className="hidden md:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-medium tracking-wide whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-50 glass"
        style={{
          background: 'var(--surface)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
        }}
        role="tooltip"
      >
        {label}
      </div>
    </div>
  );
}

export function Dock({ onOpenSearch, onOpenStarLog, onOpenSettings }: DockProps) {
  const { createChat, activeChat, settings } = useApp();
  const isMobile = useIsMobile();

  // On mobile inside a chat, dock collapses into the top bar menu
  if (isMobile && activeChat) {
    return null;
  }

  // Mobile slim bottom bar on home screen
  if (isMobile) {
    return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 px-4 py-2 glass border-t border-[var(--border)] flex items-center justify-around"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
        aria-label="Mobile navigation"
      >
        <button
          type="button"
          onClick={createChat}
          className="flex flex-col items-center gap-1 text-[var(--muted)] hover:text-[var(--text)]"
          aria-label="New chat"
        >
          <div className="p-1.5 rounded-xl bg-[var(--surface-2)] text-[var(--text)]">
            <Plus size={18} />
          </div>
          <span className="text-[10px]">New</span>
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className="flex flex-col items-center gap-1 text-[var(--muted)] hover:text-[var(--text)]"
          aria-label="Search and command palette"
        >
          <Search size={18} />
          <span className="text-[10px]">Search</span>
        </button>

        <button
          type="button"
          onClick={onOpenStarLog}
          className="flex flex-col items-center gap-1 text-[var(--muted)] hover:text-[var(--text)]"
          aria-label="Star Log history"
        >
          <BookMarked size={18} />
          <span className="text-[10px]">Star Log</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-1 text-[var(--muted)] hover:text-[var(--text)]"
          aria-label="Settings"
        >
          <Settings size={18} />
          <span className="text-[10px]">Settings</span>
        </button>
      </nav>
    );
  }

  // Desktop: detached rounded glass dock (floating on the left)
  return (
    <aside
      className="fixed left-5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3 p-2.5 rounded-3xl glass shadow-2xl transition-all duration-300"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
      }}
      aria-label="Application dock"
    >
      {/* Top action: New chat */}
      <DockItem
        icon={<Plus size={20} />}
        label="New chat (Ctrl+Shift+O)"
        onClick={createChat}
      />

      <div className="w-6 h-[1px] bg-[var(--border)] my-0.5" />

      {/* Navigation items */}
      <DockItem
        icon={<Search size={19} />}
        label="Search & Commands (Ctrl+K)"
        onClick={onOpenSearch}
      />

      <DockItem
        icon={<BookMarked size={19} />}
        label="Star Log (Chat History)"
        onClick={onOpenStarLog}
      />

      <DockItem
        icon={<Settings size={19} />}
        label="Settings"
        onClick={onOpenSettings}
      />

      <div className="w-6 h-[1px] bg-[var(--border)] my-0.5" />

      {/* Bottom User Avatar */}
      <div className="relative group">
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-semibold text-xs transition-transform duration-200 hover:scale-105"
          style={{
            background: 'var(--surface-2)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
          aria-label="User profile & settings"
        >
          {settings.displayName?.trim() ? (
            settings.displayName.trim()[0].toUpperCase()
          ) : (
            <User size={16} />
          )}
        </button>
        <div
          className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-medium tracking-wide whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-50 glass"
          style={{
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
          role="tooltip"
        >
          {settings.displayName?.trim() ? settings.displayName : 'Profile'}
        </div>
      </div>
    </aside>
  );
}
