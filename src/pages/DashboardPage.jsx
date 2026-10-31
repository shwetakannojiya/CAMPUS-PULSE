import React from 'react';
import {
  CalendarDays,
  Clock,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import NoticeInput from '../components/parser/NoticeInput';
import EventCard from '../components/events/EventCard';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';

export default function DashboardPage({
  events = [],
  onExtractNotice,
  isLoading = false,
  onToggleImportant,
  onEditEvent,
  onDeleteEvent,
  onViewEventDetails,
  onOpenDigest
}) {
  // Categorize events by computedStatus
  const urgentEvents = events.filter((e) => e.computedStatus === 'URGENT');
  const todayEvents = events.filter((e) => e.isToday);
  const upcomingEvents = events.filter((e) => e.computedStatus === 'UPCOMING');
  const unconfirmedEvents = events.filter((e) => e.computedStatus === 'DATE_UNCONFIRMED');

  const stats = {
    total: events.length,
    today: todayEvents.length,
    upcoming: upcomingEvents.length,
    urgent: urgentEvents.length
  };

  return (
    <div className="page-content">
      {/* Welcome Banner */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Welcome back to Campus Pulse
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 4 }}>
          Turn messy WhatsApp announcements into organized, trackable campus events.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Events"
          value={stats.total}
          type="total"
          icon={CalendarDays}
        />
        <StatCard
          title="Happening Today"
          value={stats.today}
          type="today"
          icon={AlertCircle}
        />
        <StatCard
          title="Upcoming"
          value={stats.upcoming}
          type="upcoming"
          icon={Clock}
        />
        <StatCard
          title="Needs Attention"
          value={stats.urgent}
          type="unconfirmed"
          icon={HelpCircle}
        />
      </div>

      {/* Notice Parser Input */}
      <NoticeInput onExtract={onExtractNotice} isLoading={isLoading} />

      {/* Weekly AI Digest Banner Card */}
      <div className="digest-card">
        <h3>
          <Sparkles size={22} />
          What do I need to know this week?
        </h3>
        <p>
          Generate a high-level briefing of your next 7 days: urgent deadlines, key workshops, and academic notices.
        </p>
        <Button
          variant="secondary"
          onClick={onOpenDigest}
          style={{ background: '#ffffff', color: 'var(--primary)', fontWeight: 700, border: 'none' }}
        >
          Generate Weekly Digest <ArrowRight size={16} />
        </Button>
      </div>

      {/* Today's Priorities / Urgent Section */}
      {urgentEvents.length > 0 && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
            <AlertCircle size={20} color="var(--status-urgent-accent)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--status-urgent-accent)' }}>
              Needs Attention Today ({urgentEvents.length})
            </h2>
          </div>

          <div>
            {urgentEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onToggleImportant={onToggleImportant}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                onViewDetails={() => onViewEventDetails(evt)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Unconfirmed Dates Group */}
      {unconfirmedEvents.length > 0 && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
            <HelpCircle size={20} color="var(--status-unconfirmed-accent)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--status-unconfirmed-text)' }}>
              Needs Date Confirmation ({unconfirmedEvents.length})
            </h2>
          </div>

          <div>
            {unconfirmedEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onToggleImportant={onToggleImportant}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                onViewDetails={() => onViewEventDetails(evt)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events Section */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
          Upcoming Events
        </h2>

        {upcomingEvents.length === 0 ? (
          <EmptyState
            title="No upcoming events scheduled"
            message="Paste a WhatsApp forward or announcement above to create your first event!"
          />
        ) : (
          <div>
            {upcomingEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onToggleImportant={onToggleImportant}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                onViewDetails={() => onViewEventDetails(evt)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

