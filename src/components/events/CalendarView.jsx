import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarView({ events = [], onSelectEvent }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState(null);

  // Filter only events that have a confirmed, valid date
  const calendarEvents = events.filter((e) => e.date && e.dateConfirmed !== false);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Build grid days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const cells = [];

  // Trailing days from previous month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    cells.push({
      dayNumber: dayNum,
      isCurrentMonth: false,
      dateString: null
    });
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    const moStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const fullDate = `${currentYear}-${moStr}-${dayStr}`;

    const isToday =
      today.getFullYear() === currentYear &&
      today.getMonth() === currentMonth &&
      today.getDate() === d;

    const dayEvts = calendarEvents.filter((e) => e.date === fullDate);

    cells.push({
      dayNumber: d,
      isCurrentMonth: true,
      isToday,
      dateString: fullDate,
      events: dayEvts
    });
  }

  // Next month leading days to complete the 7x5 or 7x6 grid
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    cells.push({
      dayNumber: i,
      isCurrentMonth: false,
      dateString: null
    });
  }

  const handleCellClick = (cell) => {
    if (!cell.isCurrentMonth || !cell.dateString) return;
    setSelectedDateStr(cell.dateString);
    setSelectedDayEvents(cell.events || []);
  };

  return (
    <div className="calendar-container">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <Button variant="secondary" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-icon" onClick={handlePrevMonth} title="Previous Month">
            <ChevronLeft size={20} />
          </button>
          <button className="btn-icon" onClick={handleNextMonth} title="Next Month">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="calendar-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="calendar-weekday">
            {w}
          </div>
        ))}

        {/* Day Cells */}
        {cells.map((cell, idx) => {
          const isSelected = selectedDateStr === cell.dateString;
          return (
            <div
              key={idx}
              className={`calendar-day-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleCellClick(cell)}
              style={isSelected ? { outline: '2px solid var(--primary)', outlineOffset: -2 } : {}}
            >
              <div className="day-number">{cell.dayNumber}</div>

              {cell.events && cell.events.slice(0, 3).map((evt) => (
                <div
                  key={evt.id}
                  className={`calendar-event-pill ${evt.computedStatus === 'URGENT' ? 'urgent' : ''}`}
                  title={`${evt.title} (${evt.startTime || 'All Day'})`}
                >
                  {evt.startTime ? `${evt.startTime} ` : ''}{evt.title}
                </div>
              ))}

              {cell.events && cell.events.length > 3 && (
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  +{cell.events.length - 3} more
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Event Drawer / List */}
      {selectedDateStr && (
        <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Events for {selectedDateStr} ({selectedDayEvents.length})
            </h3>
            <button
              className="btn-sm btn-secondary"
              onClick={() => { setSelectedDateStr(null); setSelectedDayEvents(null); }}
            >
              Close
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              No events scheduled for this day.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedDayEvents.map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    background: '#ffffff',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Badge status={evt.computedStatus} />
                      <Badge category={evt.category} />
                      <strong style={{ fontSize: '0.92rem' }}>{evt.title}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 12 }}>
                      <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{evt.startTime || 'All day'}</span>
                      <span><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{evt.venue || 'Not specified'}</span>
                    </div>
                  </div>

                  <Button size="sm" variant="secondary" onClick={() => onSelectEvent(evt)}>
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

