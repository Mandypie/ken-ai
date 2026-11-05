import React from 'react';
import { Sun, Moon, User } from 'lucide-react';
import { GalaxyLogo } from './GalaxyLogo';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';
import { useIsMobile } from '../hooks/useMediaQuery';

interface TopBarProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

export function TopBar({ onMenuClick, showMenu }: TopBarProps) {
  const { theme, toggle } = useTheme();
  const { settings, activeChat, goHome } = useApp();
  const isMobile = useIsMobile();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4"
      style={{
        paddingLeft: !isMobile && !activeChat ? '88px' : undefined,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="flex items-center gap-2">
        {showMenu && isMobile && activeChat && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl hover:bg-[var(--surface-2)] transition-colors"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <button
          onClick={goHome}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="Go to home"
        >
          <GalaxyLogo size={28} />
          {(!isMobile || !activeChat) && (
            <span className="font-heading font-semibold text-base tracking-tight">
              Ken AI
            </span>
          )}
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggle}
          className="p-2 rounded-xl hover:bg-[var(--surface-2)] transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={theme === 'dark' ? 'Switch to Daybreak' : 'Switch to Night'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="p-2 rounded-xl hover:bg-[var(--surface-2)] transition-colors"
          aria-label="Account menu"
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ background: 'var(--surface-2)' }}>
            {settings.displayName ? settings.displayName[0].toUpperCase() : <User size={14} />}
          </div>
        </button>
      </div>
    </header>
  );
}
