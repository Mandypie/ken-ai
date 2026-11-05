import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Moon,
  Sun,
  Settings,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'Actions' | 'Chats' | 'Preferences';
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenSettings }: CommandPaletteProps) {
  const { chats, createChat, selectChat } = useApp();
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      {
        id: 'new-chat',
        title: 'Start a new chat',
        category: 'Actions',
        icon: <Plus size={16} className="text-[var(--accent-1)]" />,
        action: () => {
          createChat();
          onClose();
        },
      },
      {
        id: 'toggle-theme',
        title: `Switch to ${theme === 'dark' ? 'Daybreak (Light)' : 'Night (Dark)'} theme`,
        category: 'Preferences',
        icon: theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-400" />,
        action: () => {
          toggle();
          onClose();
        },
      },
      {
        id: 'open-settings',
        title: 'Open Settings',
        category: 'Preferences',
        icon: <Settings size={16} className="text-[var(--muted)]" />,
        action: () => {
          onClose();
          onOpenSettings();
        },
      },
    ];

    // Recent chats
    chats.slice(0, 10).forEach((chat) => {
      list.push({
        id: `chat-${chat.id}`,
        title: chat.title,
        category: 'Chats',
        icon: <MessageSquare size={15} className="text-[var(--muted)]" />,
        action: () => {
          selectChat(chat.id);
          onClose();
        },
      });
    });

    // Filter by query
    if (!query.trim()) return list;
    const q = query.toLowerCase().trim();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query, theme, toggle, chats, createChat, selectChat, onClose, onOpenSettings]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Ensure selected item is scrolled into view
  useEffect(() => {
    const activeEl = listRef.current?.children[selectedIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Modal */}
      <div
        className="relative w-full max-w-xl rounded-2xl glass border border-[var(--border)] shadow-2xl overflow-hidden z-10 animate-fade-in"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
          <Search size={18} className="text-[var(--muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search chats..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
            style={{ color: 'var(--text)' }}
          />
          <kbd
            className="px-2 py-0.5 rounded text-[10px] font-mono border border-[var(--border)]"
            style={{ color: 'var(--muted)', background: 'var(--surface-2)' }}
          >
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div
          ref={listRef}
          className="max-h-80 overflow-y-auto p-2 space-y-1"
          role="listbox"
        >
          {items.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[var(--surface-2)] text-[var(--text)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 flex items-center justify-center w-5">
                    {item.icon}
                  </div>
                  <span className="truncate font-medium">{item.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded opacity-60 uppercase tracking-wider"
                    style={{ background: 'var(--surface)' }}
                  >
                    {item.category}
                  </span>
                  {isSelected && (
                    <ArrowRight size={13} className="text-[var(--accent-1)]" />
                  )}
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="py-8 text-center text-xs text-[var(--muted)]">
              No matching commands or chats found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div
          className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)] text-[10px]"
          style={{ color: 'var(--muted)', background: 'var(--surface-2)' }}
        >
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="font-mono">↵</kbd> select
            </span>
            <span>
              <kbd className="font-mono">esc</kbd> close
            </span>
          </div>
          <span className="font-heading">Ken AI</span>
        </div>
      </div>
    </div>
  );
}
