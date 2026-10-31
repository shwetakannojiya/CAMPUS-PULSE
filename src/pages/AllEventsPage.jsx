import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar as CalendarIcon, List as ListIcon, HelpCircle } from 'lucide-react';
import EventCard from '../components/events/EventCard';
import CalendarView from '../components/events/CalendarView';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { CATEGORIES } from '../lib/constants';
import { isDateToday, isEventInNext7Days, getNowInTimezone } from '../lib/dateUtils';

export default function AllEventsPage({
  events = [],
  onToggleImportant,
  onEditEvent,
  onDeleteEvent,
  onViewEventDetails
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, TODAY, THIS_WEEK, UNCONFIRMED, EXPIRED
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const { wallClock: nowWallClock } = getNowInTimezone();

  // Filter events based on search, category, and date filter
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // 1. Search filter (title, venue, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = evt.title?.toLowerCase().includes(q);
        const matchesVenue = evt.venue?.toLowerCase().includes(q);
        const matchesDesc = evt.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesVenue && !matchesDesc) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) {
        return false;
      }

      // 3. Date filter
      if (dateFilter === 'TODAY') {
        return evt.date && isDateToday(evt.date, nowWallClock);
      }
      if (dateFilter === 'THIS_WEEK') {
        return evt.date && isEventInNext7Days(evt.date, nowWallClock);
      }
      if (dateFilter === 'UNCONFIRMED') {
        return evt.computedStatus === 'DATE_UNCONFIRMED' || !evt.date || evt.dateConfirmed === false;
      }
      if (dateFilter === 'EXPIRED') {
        return evt.computedStatus === 'EXPIRED';
      }

      return true;
    });
  }, [events, searchQuery, selectedCategory, dateFilter, nowWallClock]);

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            All Campus Events
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Browse, search and filter all saved college notices ({filteredEvents.length} shown)
          </p>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <button
            className={`btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
            onClick={() => setViewMode('list')}
          >
            <ListIcon size={14} style={{ marginRight: 4 }} /> List
          </button>
          <button
            className={`btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon size={14} style={{ marginRight: 4 }} /> Calendar
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search title, venue, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="notice-textarea"
              style={{ minHeight: 'auto', padding: '8px 12px 8px 36px', fontSize: '0.9rem' }}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              className="notice-textarea"
              style={{ minHeight: 'auto', padding: '8px 12px', fontSize: '0.9rem' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date Filter Dropdown */}
          <div>
            <select
              className="notice-textarea"
              style={{ minHeight: 'auto', padding: '8px 12px', fontSize: '0.9rem' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Happening Today</option>
              <option value="THIS_WEEK">This Week (Next 7 Days)</option>
              <option value="UNCONFIRMED">Needs Date Confirmation</option>
              <option value="EXPIRED">Past / Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Output */}
      {viewMode === 'calendar' ? (
        <CalendarView
          events={filteredEvents}
          onSelectEvent={onViewEventDetails}
        />
      ) : (
        <div>
          {filteredEvents.length === 0 ? (
            <EmptyState
              title="No events match your criteria"
              message={searchQuery ? `No results found for "${searchQuery}". Try adjusting your filters.` : 'No events found in this category or timeframe.'}
              action={
                (searchQuery || selectedCategory !== 'ALL' || dateFilter !== 'ALL') ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('ALL');
                      setDateFilter('ALL');
                    }}
                  >
                    Reset Filters
                  </Button>
                ) : null
              }
            />
          ) : (
            <div>
              {filteredEvents.map((evt) => (
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
      )}
    </div>
  );
}

