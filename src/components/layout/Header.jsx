import React from 'react';
import { Sparkles, Globe } from 'lucide-react';
import { APP_TIMEZONE } from '../../lib/constants';

export default function Header({ isDemoMode = true }) {
  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Campus Pulse
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isDemoMode && (
          <div className="demo-banner">
            <span className="demo-pill">DEMO MODE</span>
            <span>Sample notices active (No API key needed)</span>
          </div>
        )}

        <div className="timezone-pill" style={{ display: 'none' /* visible on larger screens */ }}>
          <Globe size={13} />
          <span>{APP_TIMEZONE}</span>
        </div>
      </div>
    </header>
  );
}

