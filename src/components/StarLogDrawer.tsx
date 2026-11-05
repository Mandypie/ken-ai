import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Pin,
  Trash2,
  Edit2,
  Check,
  MessageSquare,
  BookMarked,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTimeGroup } from '../lib/utils';
import * as storage from '../lib/storage';
import type { Chat } from '../types';

interface StarLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, action?: { label: string; onClick: () => void }) => void;
}

export function StarLogDrawer({ isOpen, onClose, onShowToast }: StarLogDrawerProps) {
  const { chats, activeChat, selectChat, deleteChat, renameChat, pinChat } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Filtered & grouped chats
  const groupedChats = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = q
      ? chats.filter((c) => c.title.toLowerCase().includes(q))
      : chats;

    // Separate pinned from non-pinned
    const pinned: Chat[] = [];
    const groups: Record<string, Chat[]> = {
      Today: [],
      Yesterday: [],
      'Previous 7 days': [],
      Older: [],
    };

    filtered.forEach((chat) => {
      if (chat.pinned) {
        pinned.push(chat);
      } else {
        const groupKey = getTimeGroup(chat.updatedAt);
        if (groups[groupKey]) {
          groups[groupKey].push(chat);
        } else {
          groups.Older.push(chat);
        }
      }
    });

    return { pinned, groups };
  }, [chats, searchQuery]);

  const handleStartRename = (e: React.MouseEvent, chat: Chat) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = (e: React.MouseEvent | React.FormEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      renameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = async (e: React.MouseEvent, chat: Chat) => {
    e.stopPropagation();
    const deletedChat = await deleteChat(chat.id);
    if (deletedChat) {
      onShowToast(`Deleted "${chat.title.slice(0, 24)}..."`, {
        label: 'Undo',
        onClick: async () => {
          await storage.saveChat(deletedChat);
          window.dispatchEvent(new CustomEvent('milkyway:refresh-chats'));
        },
      });
    }
  };

  const handlePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    pinChat(id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Glass drawer sliding from left */}
      <aside
        className="relative w-full max-w-sm h-full glass border-r border-[var(--border)] shadow-2xl flex flex-col z-10 animate-slide-in-left"
        style={{
          background: 'var(--surface)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Star Log (Chat History)"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <BookMarked size={18} className="text-[var(--accent-1)]" />
            <h2 className="font-heading font-semibold text-sm" style={{ color: 'var(--text)' }}>
              Star Log
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-[var(--border)]">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past explorations..."
              className="w-full bg-[var(--surface-2)] border border-transparent focus:border-[var(--border)] rounded-xl py-1.5 pl-8 pr-3 text-xs outline-none placeholder:text-[var(--muted)]"
              style={{ color: 'var(--text)' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Pinned section */}
          {groupedChats.pinned.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[11px] font-semibold tracking-wider uppercase text-[var(--accent-3)]">
                <Pin size={11} />
                <span>Pinned</span>
              </div>
              <div className="space-y-1">
                {groupedChats.pinned.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChat?.id === chat.id}
                    isEditing={editingId === chat.id}
                    editTitle={editTitle}
                    onSelect={() => {
                      selectChat(chat.id);
                      onClose();
                    }}
                    onSetEditTitle={setEditTitle}
                    onSaveRename={(e) => handleSaveRename(e, chat.id)}
                    onStartRename={(e) => handleStartRename(e, chat)}
                    onDelete={(e) => handleDelete(e, chat)}
                    onPin={(e) => handlePin(e, chat.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Time-grouped sections */}
          {Object.entries(groupedChats.groups).map(([group, list]) => {
            if (list.length === 0) return null;
            return (
              <div key={group}>
                <div className="px-2 mb-1.5 text-[11px] font-semibold tracking-wider uppercase text-[var(--muted)]">
                  {group}
                </div>
                <div className="space-y-1">
                  {list.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChat?.id === chat.id}
                      isEditing={editingId === chat.id}
                      editTitle={editTitle}
                      onSelect={() => {
                        selectChat(chat.id);
                        onClose();
                      }}
                      onSetEditTitle={setEditTitle}
                      onSaveRename={(e) => handleSaveRename(e, chat.id)}
                      onStartRename={(e) => handleStartRename(e, chat)}
                      onDelete={(e) => handleDelete(e, chat)}
                      onPin={(e) => handlePin(e, chat.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {chats.length === 0 && (
            <div className="text-center py-12 px-4 text-xs text-[var(--muted)]">
              <MessageSquare size={28} className="mx-auto mb-2 opacity-40" />
              <p>No past journeys recorded yet.</p>
              <p className="mt-1 opacity-70">Start exploring to log conversations!</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  onSelect: () => void;
  onSetEditTitle: (val: string) => void;
  onSaveRename: (e: React.MouseEvent | React.FormEvent) => void;
  onStartRename: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onPin: (e: React.MouseEvent) => void;
}

function ChatItem({
  chat,
  isActive,
  isEditing,
  editTitle,
  onSelect,
  onSetEditTitle,
  onSaveRename,
  onStartRename,
  onDelete,
  onPin,
}: ChatItemProps) {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
        isActive
          ? 'bg-[var(--surface-2)] text-[var(--text)] font-medium shadow-sm'
          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect();
      }}
    >
      {isEditing ? (
        <form onSubmit={onSaveRename} className="flex-1 flex items-center gap-1.5 mr-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onSetEditTitle(e.target.value)}
            className="w-full bg-[var(--surface)] text-[var(--text)] px-2 py-0.5 rounded border border-[var(--border)] text-xs outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="submit"
            className="p-1 hover:text-emerald-400"
            title="Save title"
          >
            <Check size={13} />
          </button>
        </form>
      ) : (
        <span className="truncate flex-1 pr-2">{chat.title}</span>
      )}

      {/* Action buttons on hover */}
      {!isEditing && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onPin}
            className={`p-1 rounded hover:bg-[var(--surface)] transition-colors ${
              chat.pinned ? 'text-[var(--accent-3)] opacity-100' : 'text-[var(--muted)]'
            }`}
            title={chat.pinned ? 'Unpin' : 'Pin'}
            aria-label={chat.pinned ? 'Unpin chat' : 'Pin chat'}
          >
            <Pin size={12} className={chat.pinned ? 'fill-[var(--accent-3)]' : ''} />
          </button>

          <button
            type="button"
            onClick={onStartRename}
            className="p-1 rounded hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            title="Rename"
            aria-label="Rename chat"
          >
            <Edit2 size={12} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded hover:bg-[var(--surface)] text-[var(--muted)] hover:text-rose-400 transition-colors"
            title="Delete"
            aria-label="Delete chat"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
