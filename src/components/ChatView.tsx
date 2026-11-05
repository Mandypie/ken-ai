import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowDown } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { Console } from './Console';
import { useApp } from '../context/AppContext';
import { useIsMobile } from '../hooks/useMediaQuery';

export function ChatView() {
  const { activeChat, sendMessage, editMessage, regenerate, isStreaming } = useApp();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const checkIfAtBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 80;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    setIsAtBottom(atBottom);
    setShowScrollBottom(!atBottom);
  }, []);

  // Scroll to bottom helper
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll effect on new messages / streaming
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom(isStreaming ? 'auto' : 'smooth');
    }
  }, [activeChat?.messages, isStreaming, isAtBottom]);

  if (!activeChat) return null;

  return (
    <div className="relative flex flex-col h-[100dvh] w-full max-w-4xl mx-auto overflow-hidden">
      {/* Scrollable messages container */}
      <div
        ref={containerRef}
        onScroll={checkIfAtBottom}
        className="flex-1 overflow-y-auto px-4 md:px-8"
        style={{
          paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))',
          paddingBottom: '2rem',
        }}
        tabIndex={0}
        aria-label="Chat message history"
      >
        <div className="w-full flex flex-col">
          {activeChat.messages.map((message, index) => {
            const isLastAssistant =
              message.role === 'assistant' &&
              index === activeChat.messages.length - 1;

            return (
              <ChatMessage
                key={message.id}
                message={message}
                isLastAssistant={isLastAssistant}
                onRegenerate={regenerate}
                onEdit={(newContent) => editMessage(message.id, newContent)}
                onRetry={regenerate}
              />
            );
          })}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Floating "Jump to latest" button */}
      {showScrollBottom && (
        <div className="absolute bottom-28 right-6 z-20 animate-fade-in">
          <button
            type="button"
            onClick={() => scrollToBottom('smooth')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-medium shadow-lg hover:bg-[var(--surface-2)] transition-all hover:-translate-y-0.5"
            style={{
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
            aria-label="Jump to latest message"
          >
            <ArrowDown size={14} className="animate-bounce" />
            <span>Latest</span>
          </button>
        </div>
      )}

      {/* Docked bottom Console */}
      <div
        className="w-full px-4 pt-2 pb-3 glass border-t border-[var(--border)] z-10"
        style={{
          paddingBottom: isMobile
            ? 'calc(1rem + env(safe-area-inset-bottom, 0px))'
            : '1rem',
        }}
      >
        <Console onSend={sendMessage} docked />
      </div>
    </div>
  );
}
