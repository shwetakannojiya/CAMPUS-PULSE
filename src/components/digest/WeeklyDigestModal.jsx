import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  ArrowRight,
  BookOpen,
  Trophy,
  Bell
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function WeeklyDigestModal({
  isOpen,
  onClose,
  eventsThisWeek = [],
  allEvents = [],
  onSelectEvent,
  onScrollToNoticeInput
}) {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [digestData, setDigestData] = useState(null);
  const [isDemo, setIsDemo] = useState(true);

  // Map of all events for real data lookup
  const eventMap = new Map(allEvents.map((e) => [e.id, e]));

  const fetchDigest = async () => {
    if (eventsThisWeek.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: eventsThisWeek.map((e) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            startTime: e.startTime,
            venue: e.venue,
            category: e.category,
            registrationDeadline: e.registrationDeadline,
            computedStatus: e.computedStatus,
            isToday: e.isToday
          }))
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      setDigestData(data.digest);
      setIsDemo(Boolean(data.isDemoMode));
    } catch (err) {
      console.error('[Digest Fetch Error]:', err);
      setError(err.message || 'Failed to generate weekly digest.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && eventsThisWeek.length > 0 && !digestData) {
      fetchDigest();
    }
  }, [isOpen, eventsThisWeek]);

  const renderSection = (title, items, icon, color) => {
    if (!items || items.length === 0) return null;

    const IconComponent = icon;

    return (
      <div className="digest-section">
        <h4 style={{ color }}>
          <IconComponent size={16} />
          {title} ({items.length})
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, idx) => {
            const realEvent = eventMap.get(item.eventId);
            if (!realEvent) return null;

            return (
              <div
                key={idx}
                className="digest-item"
                style={{ borderLeftColor: color, cursor: 'pointer' }}
                onClick={() => {
                  onClose();
                  onSelectEvent(realEvent);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {realEvent.title}
                  </strong>
                  <Badge status={realEvent.computedStatus} />
                </div>

                <p style={{ margin: '4px 0 6px', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                  {item.summary}
                </p>

                {/* Real Verified Data from Storage */}
                <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span><Calendar size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{realEvent.date || 'No date'}</span>
                  <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{realEvent.startTime || 'All day'}</span>
                  <span><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{realEvent.venue || 'Not specified'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={22} color="var(--primary)" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Weekly Campus Digest
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Next 7-day executive student briefing ({eventsThisWeek.length} events active)
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {isDemo && !loading && !error && (
            <div style={{
              padding: '6px 12px',
              background: 'var(--primary-light)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--primary)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Sparkles size={14} />
              Generated with Demo Mode logic. Set GEMINI_API_KEY in .env to enable live Gemini summaries.
            </div>
          )}

          {/* Empty State: No events this week */}
          {eventsThisWeek.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <Calendar size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>
                No events scheduled for the next 7 days
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 16px' }}>
                Your schedule for this week is clear! Paste an announcement notice to track upcoming deadlines and activities.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  onClose();
                  onScrollToNoticeInput();
                }}
              >
                Paste a Notice Now <ArrowRight size={16} />
              </Button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <RefreshCw size={32} color="var(--primary)" className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Analyzing this week's schedule & generating briefing...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{
              padding: '14px',
              background: 'var(--status-urgent-bg)',
              border: '1px solid var(--status-urgent-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-urgent-text)',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 4 }}>
                <AlertCircle size={18} />
                Failed to generate digest
              </div>
              <p style={{ fontSize: '0.85rem' }}>{error}</p>
              <Button
                variant="secondary"
                size="sm"
                style={{ marginTop: 10, background: '#ffffff' }}
                onClick={fetchDigest}
                icon={RefreshCw}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Digest Content Sections */}
          {!loading && !error && digestData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {renderSection('Urgent Priorities & Deadlines Today', digestData.urgent, AlertCircle, 'var(--status-urgent-accent)')}
              {renderSection('Workshops & Competitions', digestData.workshopsAndCompetitions, Trophy, '#d97706')}
              {renderSection('Registration Deadlines Closing Soon', digestData.deadlines, Bell, '#dc2626')}
              {renderSection('Academic & Administrative Notices', digestData.academicAndNotices, BookOpen, 'var(--primary)')}
              {renderSection('Events Happening This Week', digestData.thisWeek, Calendar, '#2563eb')}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {eventsThisWeek.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchDigest}
              disabled={loading}
              icon={RefreshCw}
            >
              Regenerate
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

