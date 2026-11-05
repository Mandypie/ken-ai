import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Mic, Send, Square, Upload, Image, Link2 } from 'lucide-react';
import { EngineSelector } from './EngineSelector';
import { useApp } from '../context/AppContext';
import { useMotion } from '../hooks/useMotion';

interface ConsoleProps {
  onSend: (message: string) => void;
  docked?: boolean;
}

const placeholders = [
  'Ask Ken AI anything...',
  'Paste something and ask about it...',
  'Describe what you want to build...',
];

export function Console({ onSend, docked = false }: ConsoleProps) {
  const { isStreaming, stopStreaming } = useApp();
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showAttach, setShowAttach] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const [attachFeedback, setAttachFeedback] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const shouldAnimate = useMotion();

  const speechSupported =
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  // Rotate placeholder every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Auto-resize textarea between 1 and 8 lines
  const resize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const singleLineHeight = 24;
    const maxHeight = 8 * singleLineHeight;
    const newHeight = Math.min(Math.max(ta.scrollHeight, singleLineHeight), maxHeight);
    ta.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  // Close attach menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachRef.current && !attachRef.current.contains(e.target as Node)) {
        setShowAttach(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startSpeech = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setSpeechActive(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setSpeechActive(false);
      };

      recognition.onerror = () => {
        setSpeechActive(false);
      };

      recognition.onend = () => {
        setSpeechActive(false);
      };

      recognition.start();
    } catch {
      setSpeechActive(false);
    }
  };

  // External event to populate console (e.g., from suggestion cards)
  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      setValue(e.detail);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };
    window.addEventListener('milkyway:fill-console' as any, handler);
    return () => window.removeEventListener('milkyway:fill-console' as any, handler);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachFeedback(`Attached file: ${file.name}`);
      setTimeout(() => setAttachFeedback(null), 3000);
      setShowAttach(false);
    }
  };

  const handleLinkPaste = () => {
    const url = prompt('Enter a link URL to attach:');
    if (url) {
      setValue((prev) => (prev ? `${prev}\n${url}` : url));
      setAttachFeedback('Link attached');
      setTimeout(() => setAttachFeedback(null), 2500);
    }
    setShowAttach(false);
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${docked ? 'pb-2' : ''}`}>
      {/* Hidden inputs for attachments */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />

      {/* Orbit ring container */}
      <div
        className="relative rounded-[28px] p-[1.5px] transition-all duration-300 overflow-hidden"
        style={{
          boxShadow: focused
            ? '0 0 24px -2px rgba(124, 92, 255, 0.25), 0 0 40px -8px rgba(255, 111, 181, 0.2)'
            : 'none',
        }}
      >
        {/* Animated Conic Orbit Ring when focused */}
        {focused ? (
          <div
            className={`absolute -inset-[100%] ${
              shouldAnimate ? 'animate-[spin_4s_linear_infinite]' : ''
            }`}
            style={{
              background:
                'conic-gradient(from 0deg, #7C5CFF 0%, #FF6FB5 33%, #FFC46B 66%, #7C5CFF 100%)',
            }}
            aria-hidden="true"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'var(--border)' }}
            aria-hidden="true"
          />
        )}

        {/* Inner console box */}
        <div
          className="relative glass rounded-[26.5px] flex flex-col transition-colors duration-200"
          style={{ background: 'var(--surface)' }}
        >
          {/* Attachment Feedback badge */}
          {attachFeedback && (
            <div
              className="px-4 pt-2 text-xs flex items-center justify-between"
              style={{ color: 'var(--accent-2)' }}
            >
              <span>{attachFeedback}</span>
              <button
                onClick={() => setAttachFeedback(null)}
                className="opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Top Row: Input & Controls */}
          <div className="flex items-end gap-2 px-3.5 pt-3 pb-1">
            {/* Attach dropdown trigger */}
            <div ref={attachRef} className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowAttach(!showAttach)}
                className="p-2 rounded-xl transition-colors hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] focus:outline-none"
                aria-label="Attach options"
                aria-expanded={showAttach}
                aria-haspopup="menu"
              >
                <Plus size={18} />
              </button>

              {/* Attach Dropdown Menu */}
              {showAttach && (
                <div
                  className="absolute bottom-full left-0 mb-2 w-48 rounded-[var(--radius-md)] glass p-1.5 shadow-2xl animate-fade-in z-50 border border-[var(--border)]"
                  style={{ background: 'var(--surface)' }}
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttach(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--surface-2)] transition-colors text-left"
                    style={{ color: 'var(--text)' }}
                    role="menuitem"
                  >
                    <Upload size={15} style={{ color: 'var(--muted)' }} />
                    <span>Upload file</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      imageInputRef.current?.click();
                      setShowAttach(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--surface-2)] transition-colors text-left"
                    style={{ color: 'var(--text)' }}
                    role="menuitem"
                  >
                    <Image size={15} style={{ color: 'var(--muted)' }} />
                    <span>Add image</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLinkPaste}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-[var(--surface-2)] transition-colors text-left"
                    style={{ color: 'var(--text)' }}
                    role="menuitem"
                  >
                    <Link2 size={15} style={{ color: 'var(--muted)' }} />
                    <span>Paste link</span>
                  </button>
                </div>
              )}
            </div>

            {/* Auto-growing Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholders[placeholderIndex]}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm leading-6 placeholder:text-[var(--muted)] text-[var(--text)] py-1 px-1"
              style={{
                minHeight: '24px',
                maxHeight: `${8 * 24}px`,
              }}
              aria-label="Ken AI conversation input"
            />

            {/* Right-side action buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Mic button (Speech Recognition) */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={startSpeech}
                  className={`p-2 rounded-xl transition-colors hover:bg-[var(--surface-2)] ${
                    speechActive ? 'text-[var(--accent-2)] animate-pulse' : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                  aria-label="Speech to text input"
                  title="Speak to dictate"
                >
                  <Mic size={18} />
                </button>
              )}

              {/* Send or Stop button */}
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopStreaming}
                  className="p-2 rounded-full transition-transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #7C5CFF, #FF6FB5, #FFC46B)',
                    width: '36px',
                    height: '36px',
                  }}
                  aria-label="Stop generation"
                  title="Stop generating"
                >
                  <Square size={13} fill="white" stroke="white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!value.trim()}
                  className="p-2 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center disabled:opacity-30 disabled:scale-100 shadow-md"
                  style={{
                    background: value.trim()
                      ? 'linear-gradient(135deg, #7C5CFF, #FF6FB5, #FFC46B)'
                      : 'var(--surface-2)',
                    width: '36px',
                    height: '36px',
                  }}
                  aria-label="Send message"
                  title="Send message"
                >
                  <Send size={15} className="text-white translate-x-[1px]" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: Engine Selector & Shortcut Hint */}
          <div className="flex items-center justify-between px-3.5 pb-2.5 pt-0.5 border-t border-[var(--border)] border-opacity-40">
            <div className="flex items-center">
              <EngineSelector />
            </div>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
              <span>Enter to send</span>
              <span className="opacity-40">·</span>
              <span>
                <kbd className="px-1 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--surface-2)' }}>
                  Shift+↵
                </kbd>{' '}
                newline
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
