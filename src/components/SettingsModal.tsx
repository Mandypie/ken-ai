import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Sliders,
  Sparkles,
  Download,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export function SettingsModal({ isOpen, onClose, onShowToast }: SettingsModalProps) {
  const { settings, updateSettings, exportChats, deleteAllData } = useApp();
  const { themeSetting, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState(settings.displayName);
  const [openRouterApiKey, setOpenRouterApiKey] = useState(settings.openRouterApiKey);
  const [customInstructions, setCustomInstructions] = useState(settings.customInstructions);
  const [reduceMotion, setReduceMotion] = useState(settings.reduceMotion);
  const [liteMode, setLiteMode] = useState(settings.liteMode);
  const [animationOverride, setAnimationOverride] = useState(settings.animationOverride);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(settings.displayName);
      setOpenRouterApiKey(settings.openRouterApiKey);
      setCustomInstructions(settings.customInstructions);
      setReduceMotion(settings.reduceMotion);
      setLiteMode(settings.liteMode);
      setAnimationOverride(settings.animationOverride);
      setConfirmDelete(false);
      setSavedSuccess(false);
    }
  }, [isOpen, settings]);

  const handleSave = async () => {
    await updateSettings({
      displayName: displayName.trim(),
      openRouterApiKey: openRouterApiKey.trim(),
      customInstructions: customInstructions.trim(),
      reduceMotion,
      liteMode,
      animationOverride,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
    onShowToast('Settings updated');
  };

  const handleExport = async () => {
    try {
      const data = await exportChats();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ken-ai-explorations-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast('Chats exported to JSON');
    } catch {
      onShowToast('Failed to export chats');
    }
  };

  const handleDeleteAll = async () => {
    await deleteAllData();
    setConfirmDelete(false);
    onClose();
    onShowToast('All data has been wiped');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        className="relative w-full max-w-lg rounded-3xl glass border border-[var(--border)] shadow-2xl overflow-hidden z-10 animate-fade-in my-8"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <Sliders size={18} className="text-[var(--accent-1)]" />
            <h2 className="font-heading font-semibold text-base" style={{ color: 'var(--text)' }}>
              Settings & Preferences
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          <div className="space-y-1.5">
            <label
              htmlFor="openrouter-api-key"
              className="font-medium text-[var(--text)] flex items-center gap-2"
            >
              <Sparkles size={14} className="text-[var(--accent-1)]" />
              <span>OpenRouter API key</span>
            </label>
            <input
              id="openrouter-api-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={openRouterApiKey}
              onChange={(event) => setOpenRouterApiKey(event.target.value)}
              placeholder="Paste your OpenRouter API key"
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-[var(--focus-ring-color)]"
              style={{ color: 'var(--text)' }}
            />
            <p className="text-[11px] text-[var(--muted)]">
              Saved only in this browser on this device. OpenRouter receives your prompts directly.
              Free-model rate limits apply; don’t use this local app as a public website.
              {' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Get an API key
              </a>
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="display-name"
              className="font-medium text-[var(--text)] flex items-center gap-2"
            >
              <User size={14} className="text-[var(--muted)]" />
              <span>Display name</span>
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Explorer (e.g. Maya)"
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-[var(--focus-ring-color)]"
              style={{ color: 'var(--text)' }}
            />
            <p className="text-[11px] text-[var(--muted)]">
              Appears in your home greeting. Falls back to "Welcome, explorer".
            </p>
          </div>

          {/* Theme selection */}
          <div className="space-y-2">
            <span className="font-medium text-[var(--text)]">Appearance Theme</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'system', label: 'System' },
                { id: 'dark', label: 'Night (Dark)' },
                { id: 'light', label: 'Daybreak' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as any)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    themeSetting === t.id
                      ? 'border-[var(--accent-1)] bg-[var(--surface-2)] text-[var(--text)]'
                      : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Free model routing */}
          <div className="space-y-2">
            <span className="font-medium text-[var(--text)]">Free model routing</span>
            <p className="text-[11px] text-[var(--muted)]">
              OpenRouter automatically selects an available free model for each chat. Free-model
              availability and rate limits may vary.
            </p>
          </div>

          {/* Motion & Performance */}
          <div className="space-y-3 pt-1 border-t border-[var(--border)]">
            <span className="font-medium text-[var(--text)]">Motion & Battery</span>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-[var(--text)] font-medium">Reduce Motion</div>
                <div className="text-[11px] text-[var(--muted)]">
                  Disable star twinkling and spinning border rings
                </div>
              </div>
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--accent-1)]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-[var(--text)] font-medium">Lite Mode (Save Data)</div>
                <div className="text-[11px] text-[var(--muted)]">
                  Minimizes canvas animation load for low-spec devices
                </div>
              </div>
              <input
                type="checkbox"
                checked={liteMode}
                onChange={(e) => setLiteMode(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--accent-1)]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-[var(--text)] font-medium">Force Animation On</div>
                <div className="text-[11px] text-[var(--muted)]">
                  Override hardware auto-throttling to always render stars
                </div>
              </div>
              <input
                type="checkbox"
                checked={animationOverride}
                onChange={(e) => setAnimationOverride(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--accent-1)]"
              />
            </label>
          </div>

          {/* Custom instructions (System prompt) */}
          <div className="space-y-1.5 pt-1 border-t border-[var(--border)]">
            <label
              htmlFor="custom-instructions"
              className="font-medium text-[var(--text)] flex items-center gap-1.5"
            >
              <Sparkles size={14} className="text-[var(--accent-3)]" />
              <span>Custom Instructions (System Prompt)</span>
            </label>
            <textarea
              id="custom-instructions"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Respond concisely, prefer TypeScript for code examples, maintain a friendly tone..."
              rows={3}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-xs outline-none focus:border-[var(--focus-ring-color)] resize-y"
              style={{ color: 'var(--text)' }}
            />
            <p className="text-[11px] text-[var(--muted)]">
              Injected into every request to steer Ken AI's personality and formatting.
            </p>
          </div>

          {/* Data Management: Export & Delete */}
          <div className="space-y-2 pt-1 border-t border-[var(--border)]">
            <span className="font-medium text-[var(--text)]">Data Management</span>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors text-[var(--text)]"
              >
                <Download size={14} className="text-[var(--accent-1)]" />
                <span>Export all chats as JSON</span>
              </button>

              {confirmDelete ? (
                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-medium">
                    <AlertTriangle size={15} />
                    <span>Permanently delete all chats and settings?</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--text)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAll}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium"
                    >
                      Yes, wipe all data
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Delete all data</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 p-4 border-t border-[var(--border)] bg-[var(--surface-2)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent-gradient)' }}
          >
            {savedSuccess ? <Check size={14} /> : null}
            <span>{savedSuccess ? 'Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
