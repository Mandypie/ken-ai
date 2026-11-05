import React from 'react';
import { Console } from './Console';
import { useApp } from '../context/AppContext';
import { suggestions } from '../config/suggestions';
import { getGreeting } from '../lib/utils';
import { useIsMobile, useIsTablet } from '../hooks/useMediaQuery';

interface HomeScreenProps {
  onSend: (message: string) => void;
}

export function HomeScreen({ onSend }: HomeScreenProps) {
  const { settings } = useApp();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const greeting = getGreeting();
  const name = settings.displayName?.trim();
  const eyebrowText = name ? `${greeting}, ${name}` : 'Welcome, explorer';

  const handleSuggestionClick = (prompt: string) => {
    window.dispatchEvent(new CustomEvent('milkyway:fill-console', { detail: prompt }));
  };

  return (
    <main
      className="flex flex-col items-center justify-center min-h-[100dvh] px-4 py-8 relative z-10 animate-fade-in"
      style={{
        paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))',
        paddingBottom: isMobile ? 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' : '3rem',
      }}
    >
      <div className="w-full max-w-3xl flex flex-col items-center text-center gap-7">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase"
          style={{
            background: 'var(--surface-2)',
            color: 'var(--muted)',
            border: '1px solid var(--border)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-2)] animate-pulse" />
          <span>{eyebrowText}</span>
        </div>

        {/* Headline */}
        <h1
          className="font-heading font-bold tracking-tight text-balance leading-[1.15]"
          style={{
            fontSize: isMobile ? '2.25rem' : '3.25rem',
            color: 'var(--text)',
          }}
        >
          What shall we <span className="accent-text">explore?</span>
        </h1>

        {/* Console */}
        <div className="w-full mt-1">
          <Console onSend={onSend} />
        </div>

        {/* Four Suggestion Cards */}
        <div
          className={`w-full mt-3 ${
            isMobile
              ? 'flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory no-scrollbar -mx-4 px-4'
              : isTablet
              ? 'grid grid-cols-2 gap-3 max-w-2xl'
              : 'grid grid-cols-4 gap-3 max-w-3xl'
          }`}
        >
          {suggestions.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                type="button"
                onClick={() => handleSuggestionClick(card.prompt)}
                className={`group text-left p-4 rounded-[var(--radius-md)] glass transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-1)] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] ${
                  isMobile ? 'min-w-[210px] flex-shrink-0 snap-start' : 'w-full'
                }`}
                style={{
                  background: 'var(--surface)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 transition-colors duration-200 group-hover:scale-105"
                  style={{
                    background: 'var(--surface-2)',
                    color: 'var(--accent-1)',
                  }}
                >
                  <Icon size={17} />
                </div>
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>
                  {card.title}
                </div>
                <div
                  className="text-xs leading-relaxed line-clamp-2"
                  style={{ color: 'var(--muted)' }}
                >
                  {card.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-xs mt-3 opacity-70" style={{ color: 'var(--muted)' }}>
          Ken AI can be wrong. Double-check anything important.
        </p>
      </div>
    </main>
  );
}
