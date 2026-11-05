import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/atom-one-dark.css';
import {
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { GalaxyLogo } from './GalaxyLogo';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isLastAssistant?: boolean;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  onRetry?: () => void;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlighted = React.useMemo(() => {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(code, { language }).value;
      } catch {
        // fallback
      }
    }
    try {
      return hljs.highlightAuto(code).value;
    } catch {
      return code;
    }
  }, [language, code]);

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-2)]">
      <div className="flex items-center justify-between px-3.5 py-1.5 text-xs border-b border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]">
        <span className="font-mono lowercase">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-[var(--surface-2)] transition-colors hover:text-[var(--text)]"
          aria-label="Copy code"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs leading-relaxed font-mono">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

export function ChatMessage({
  message,
  isLastAssistant,
  onRegenerate,
  onEdit,
  onRetry,
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [copied, setCopied] = useState(false);
  const [thumb, setThumb] = useState<'up' | 'down' | null>(null);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && onEdit) {
      onEdit(editValue.trim());
      setIsEditing(false);
    }
  };

  // User Message
  if (isUser) {
    return (
      <div className="flex flex-col items-end w-full my-3 group">
        <div
          className="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed relative"
          style={{
            background: 'var(--surface-2)',
            color: 'var(--text)',
            borderRight: '2px solid var(--accent-1)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[240px]">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-[var(--surface)] text-[var(--text)] p-2 rounded-lg text-sm border border-[var(--border)] outline-none resize-y min-h-[60px]"
                rows={3}
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 rounded-md hover:bg-[var(--surface)] transition-colors text-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-2.5 py-1 rounded-md text-white font-medium"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  Save & Resend
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>

        {/* Message hover actions */}
        {!isEditing && (
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-1">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1 rounded hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              title="Edit message"
              aria-label="Edit message"
            >
              <Edit2 size={13} />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              title="Copy message"
              aria-label="Copy user message"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Assistant Message (Full width, no bubble, with spiral avatar)
  return (
    <div
      className="w-full my-6 flex flex-col group"
      aria-live={message.isStreaming ? 'polite' : undefined}
    >
      <div className="flex items-start gap-3 w-full">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center p-0.5 mt-0.5">
          <GalaxyLogo size={28} />
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
          {/* Error state */}
          {message.error ? (
            <div
              className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 flex flex-col gap-2 max-w-lg"
              role="alert"
            >
              <div className="flex items-center gap-2 text-rose-400 font-medium text-xs">
                <AlertCircle size={16} />
                <span>Failed to complete request</span>
              </div>
              <p className="text-xs text-[var(--text)] opacity-90">{message.error}</p>
              {onRetry && (
                <div>
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    <RotateCcw size={12} />
                    <span>Retry</span>
                  </button>
                </div>
              )}
            </div>
          ) : message.isStreaming && !message.content ? (
            /* Thinking state before first token */
            <div className="flex items-center gap-2 text-xs py-2 text-[var(--muted)] animate-pulse">
              <Sparkles size={14} className="text-[var(--accent-2)] animate-spin" />
              <span className="shimmer px-2 py-0.5 rounded font-medium">Thinking...</span>
            </div>
          ) : (
            <div className="prose-milkyway break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    if (!inline && match) {
                      return <CodeBlock language={match[1]} code={codeString} />;
                    }
                    if (!inline && codeString.includes('\n')) {
                      return <CodeBlock language="" code={codeString} />;
                    }
                    return (
                      <code
                        className="px-1.5 py-0.5 rounded text-xs font-mono bg-[var(--surface-2)] text-[var(--accent-2)]"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  table({ children }: any) {
                    return (
                      <div className="overflow-x-auto my-3 rounded-xl border border-[var(--border)]">
                        <table className="w-full text-left text-xs border-collapse">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }: any) {
                    return (
                      <th className="p-2.5 font-semibold border-b border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)]">
                        {children}
                      </th>
                    );
                  },
                  td({ children }: any) {
                    return (
                      <td className="p-2.5 border-b border-[var(--border)] opacity-90 text-[var(--text)]">
                        {children}
                      </td>
                    );
                  },
                  p({ children }: any) {
                    return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
                  },
                  ul({ children }: any) {
                    return <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>;
                  },
                  ol({ children }: any) {
                    return <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>;
                  },
                  li({ children }: any) {
                    return <li className="leading-relaxed">{children}</li>;
                  },
                  blockquote({ children }: any) {
                    return (
                      <blockquote className="border-l-2 border-[var(--accent-2)] pl-3.5 my-3 italic text-[var(--muted)]">
                        {children}
                      </blockquote>
                    );
                  },
                  h1({ children }: any) {
                    return (
                      <h1 className="font-heading font-bold text-lg mt-4 mb-2 text-[var(--text)]">
                        {children}
                      </h1>
                    );
                  },
                  h2({ children }: any) {
                    return (
                      <h2 className="font-heading font-semibold text-base mt-3 mb-1.5 text-[var(--text)]">
                        {children}
                      </h2>
                    );
                  },
                  h3({ children }: any) {
                    return (
                      <h3 className="font-heading font-medium text-sm mt-2.5 mb-1 text-[var(--text)]">
                        {children}
                      </h3>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* Pulsing star cursor while streaming */}
              {message.isStreaming && (
                <span
                  className="inline-block w-2 h-2 rounded-full mx-1 align-baseline animate-pulse"
                  style={{
                    background: 'var(--accent-gradient)',
                    boxShadow: '0 0 8px var(--accent-1)',
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          )}

          {/* Action buttons on hover */}
          {!message.isStreaming && !message.error && message.content && (
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                title="Copy response"
                aria-label="Copy assistant response"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>

              {isLastAssistant && onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                  title="Regenerate response"
                  aria-label="Regenerate response"
                >
                  <RotateCcw size={14} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setThumb(thumb === 'up' ? null : 'up')}
                className={`p-1.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors ${
                  thumb === 'up'
                    ? 'text-[var(--accent-2)] bg-[var(--surface-2)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
                title="Helpful"
                aria-label="Mark response as helpful"
              >
                <ThumbsUp size={14} />
              </button>

              <button
                type="button"
                onClick={() => setThumb(thumb === 'down' ? null : 'down')}
                className={`p-1.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors ${
                  thumb === 'down'
                    ? 'text-rose-400 bg-[var(--surface-2)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
                title="Not helpful"
                aria-label="Mark response as not helpful"
              >
                <ThumbsDown size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
