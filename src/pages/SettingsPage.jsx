import React, { useState } from 'react';
import {
  Settings,
  Download,
  Trash2,
  Globe,
  Sparkles,
  ShieldCheck,
  Check,
  AlertTriangle
} from 'lucide-react';
import Button from '../components/common/Button';
import { APP_TIMEZONE } from '../lib/constants';

export default function SettingsPage({
  isDemoMode,
  eventCount,
  onExportEvents,
  onClearAllData
}) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExport = () => {
    const jsonString = onExportEvents();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `campus-pulse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to delete ALL saved events? This action cannot be undone.')) {
      onClearAllData();
      alert('All local events have been cleared.');
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          System Settings & Data
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage your local campus events, export backups, and view runtime configurations.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Demo Mode Status Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Sparkles size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Engine & Demo Mode</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {isDemoMode
                  ? 'Active in Demo Mode: Parsing utilizes pre-loaded sample notices without requiring a live Gemini API key.'
                  : 'Active in Live AI Mode: Connected to Gemini API serverless endpoints.'}
              </p>
            </div>
            <span className={`badge ${isDemoMode ? 'badge-upcoming' : 'badge-urgent'}`}>
              {isDemoMode ? 'DEMO MODE' : 'LIVE GEMINI'}
            </span>
          </div>
        </div>

        {/* Timezone Configuration */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Globe size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Application Timezone</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                All relative date comparisons, deadlines, and urgency statuses are locked to this timezone.
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {APP_TIMEZONE}
            </span>
          </div>
        </div>

        {/* Data Backup & Export */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Download size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Export Event Records</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Download all your saved campus events ({eventCount} total) as a clean JSON backup.
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={handleExport}
              disabled={eventCount === 0}
              icon={downloadSuccess ? Check : Download}
            >
              {downloadSuccess ? 'Downloaded!' : 'Export JSON'}
            </Button>
          </div>
        </div>

        {/* Storage Architecture Limitations Note */}
        <div className="card" style={{ background: '#f8fafc', borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <ShieldCheck size={20} color="var(--text-secondary)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Storage Architecture:</strong>{' '}
              Data is persisted locally in your browser's <code style={{ fontFamily: 'var(--font-mono)' }}>localStorage</code>.
              It is stored per-device and per-browser, private to this session, and will reset if you clear your browser cookies/site data.
            </div>
          </div>
        </div>

        {/* Danger Zone: Clear Data */}
        <div className="card" style={{ borderColor: 'var(--status-urgent-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Trash2 size={18} color="var(--status-urgent-accent)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--status-urgent-accent)' }}>
                  Clear All Saved Events
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Permanently wipes all local events from this device.
              </p>
            </div>

            <Button
              variant="danger"
              onClick={handleClear}
              disabled={eventCount === 0}
              icon={Trash2}
            >
              Clear All Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
