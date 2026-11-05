import React, { useState, useEffect, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { StarBackground } from './components/StarBackground';
import { TopBar } from './components/TopBar';
import { Dock } from './components/Dock';
import { HomeScreen } from './components/HomeScreen';
import { ChatView } from './components/ChatView';
import { StarLogDrawer } from './components/StarLogDrawer';
import { CommandPalette } from './components/CommandPalette';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';

interface ToastState {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void };
}

function MainLayout() {
  const { activeChat, sendMessage, createChat, isStreaming, stopStreaming } = useApp();

  const [starLogOpen, setStarLogOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, action?: { label: string; onClick: () => void }) => {
      setToast({ id: Date.now(), message, action });
    },
    []
  );

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Command palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }

      // Ctrl/Cmd + Shift + O: New chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        createChat();
        setStarLogOpen(false);
        setCommandPaletteOpen(false);
      }

      // Escape: Stop generating or close active overlay
      if (e.key === 'Escape') {
        if (isStreaming) {
          stopStreaming();
        } else if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (starLogOpen) {
          setStarLogOpen(false);
        } else if (settingsOpen) {
          setSettingsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createChat, isStreaming, stopStreaming, commandPaletteOpen, starLogOpen, settingsOpen]);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden text-[var(--text)] select-none md:select-auto">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[999] px-4 py-2 rounded-lg bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]"
      >
        Skip to main content
      </a>

      {/* Atmospheric Space Background */}
      <StarBackground />

      {/* Top Bar */}
      <TopBar
        showMenu
        onMenuClick={() => setStarLogOpen(true)}
      />

      {/* Floating Desktop Dock & Mobile Bottom Navigation */}
      <Dock
        onOpenSearch={() => setCommandPaletteOpen(true)}
        onOpenStarLog={() => setStarLogOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div id="main-content" className="w-full h-full">
        {activeChat && activeChat.messages.length > 0 ? (
          <ChatView />
        ) : (
          <HomeScreen onSend={sendMessage} />
        )}
      </div>

      {/* Slide-out Star Log Drawer */}
      <StarLogDrawer
        isOpen={starLogOpen}
        onClose={() => setStarLogOpen(false)}
        onShowToast={showToast}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onShowToast={(msg) => showToast(msg)}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          action={toast.action}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
