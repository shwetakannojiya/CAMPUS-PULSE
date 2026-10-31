import React from 'react';
import { Star } from 'lucide-react';
import EventCard from '../components/events/EventCard';
import EmptyState from '../components/common/EmptyState';

export default function ImportantPage({
  events = [],
  onToggleImportant,
  onEditEvent,
  onDeleteEvent,
  onViewEventDetails
}) {
  const starredEvents = events.filter((e) => e.isImportant);

  return (
    <div className="page-content">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={24} color="var(--badge-starred)" fill="var(--badge-starred)" />
          Starred & Important Notices
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Quick access to your bookmarked campus deadlines and events ({starredEvents.length})
        </p>
      </div>

      {starredEvents.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No starred events yet"
          message="Click the star icon on any event card to save it here for instant reference."
        />
      ) : (
        <div>
          {starredEvents.map((evt) => (
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
  );
}

