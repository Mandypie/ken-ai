import React from 'react';
import { engines } from '../config/engines';
import { useApp } from '../context/AppContext';

export function EngineSelector() {
  const { engine } = useApp();
  const current = engines.find(e => e.id === engine) || engines[0];

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium" style={{ color: 'var(--text)' }}>
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: current.color }}
        aria-hidden="true"
      />
      <span>{current.name}</span>
    </div>
  );
}
