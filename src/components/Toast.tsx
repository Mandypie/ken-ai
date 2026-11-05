import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  action?: { label: string; onClick: () => void };
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, action, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl glass animate-slide-in-bottom"
      style={{ borderRadius: 'var(--radius-md)', maxWidth: 'calc(100vw - 2rem)' }}
      role="alert"
    >
      <span className="text-sm" style={{ color: 'var(--text)' }}>{message}</span>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-medium accent-text hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          {action.label}
        </button>
      )}
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
