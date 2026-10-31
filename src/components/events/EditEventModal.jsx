import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';
import { CATEGORIES } from '../../lib/constants';
import { isValidCalendarDate } from '../../lib/dateUtils';

export default function EditEventModal({ event, isOpen, onClose, onSave, checkDuplicateFn }) {
  if (!isOpen || !event) return null;

  const [title, setTitle] = useState(event.title || '');
  const [category, setCategory] = useState(event.category || 'Other');
  const [date, setDate] = useState(event.date || '');
  const [startTime, setStartTime] = useState(event.startTime || '');
  const [endTime, setEndTime] = useState(event.endTime || '');
  const [venue, setVenue] = useState(event.venue || '');
  const [description, setDescription] = useState(event.description || '');
  const [registrationDeadline, setRegistrationDeadline] = useState(event.registrationDeadline || '');
  const [instructionsText, setInstructionsText] = useState(
    Array.isArray(event.instructions) ? event.instructions.join('\n') : ''
  );
  const [dateConfirmed, setDateConfirmed] = useState(event.dateConfirmed !== false);

  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setWarning('');

    if (!title.trim()) {
      setError('Title is required and cannot be empty.');
      return;
    }

    if (date.trim() && !isValidCalendarDate(date.trim())) {
      setError('The entered date is not a valid calendar date.');
      return;
    }

    if (startTime && endTime && startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }

    if (date.trim() && registrationDeadline.trim()) {
      const deadlineDateMatch = registrationDeadline.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (deadlineDateMatch && deadlineDateMatch[0] > date.trim()) {
        const proceed = window.confirm(
          'Notice: The registration deadline is set after the event date. Is this intentional?'
        );
        if (!proceed) return;
      }
    }

    const updatedEvent = {
      ...event,
      title: title.trim(),
      category: CATEGORIES.includes(category) ? category : 'Other',
      date: date.trim() || null,
      startTime: startTime.trim() || null,
      endTime: endTime.trim() || null,
      venue: venue.trim() || 'Not specified',
      description: description.trim(),
      registrationDeadline: registrationDeadline.trim() || null,
      instructions: instructionsText.split('\n').map((s) => s.trim()).filter(Boolean),
      dateConfirmed
    };

    // Duplicate check
    if (checkDuplicateFn) {
      const duplicate = checkDuplicateFn(updatedEvent);
      if (duplicate && duplicate.id !== event.id) {
        if (!window.confirm(`Warning: An event matching "${title}" on ${date} already exists. Save anyway?`)) {
          return;
        }
      }
    }

    onSave(updatedEvent);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            {event.id ? 'Edit Event' : 'Create Event'}
          </h2>
          <button className="btn-icon" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {error && (
              <div style={{ padding: '8px 12px', background: 'var(--status-urgent-bg)', color: 'var(--status-urgent-text)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                Event Title *
              </label>
              <input
                type="text"
                className="notice-textarea"
                style={{ minHeight: 'auto', padding: '8px 12px' }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hackathon Orientation"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                  Category
                </label>
                <select
                  className="notice-textarea"
                  style={{ minHeight: 'auto', padding: '8px 12px' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                  Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  className="notice-textarea"
                  style={{ minHeight: 'auto', padding: '8px 12px' }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                  Start Time (HH:mm)
                </label>
                <input
                  type="time"
                  className="notice-textarea"
                  style={{ minHeight: 'auto', padding: '8px 12px' }}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                  End Time (HH:mm)
                </label>
                <input
                  type="time"
                  className="notice-textarea"
                  style={{ minHeight: 'auto', padding: '8px 12px' }}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                  Venue
                </label>
                <input
                  type="text"
                  className="notice-textarea"
                  style={{ minHeight: 'auto', padding: '8px 12px' }}
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Auditorium Hall A"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                  Registration Deadline
                </label>
                <input
                  type="text"
                  className="notice-textarea"
                  style={{ minHeight: 'auto', padding: '8px 12px' }}
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  placeholder="YYYY-MM-DD HH:mm"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                Description
              </label>
              <textarea
                className="notice-textarea"
                style={{ minHeight: 70 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="1-2 sentences summarizing the notice"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                Instructions (one item per line)
              </label>
              <textarea
                className="notice-textarea"
                style={{ minHeight: 60 }}
                value={instructionsText}
                onChange={(e) => setInstructionsText(e.target.value)}
                placeholder="Carry ID card&#10;Bring laptop"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <input
                type="checkbox"
                id="dateConfirmedCheck"
                checked={dateConfirmed}
                onChange={(e) => setDateConfirmed(e.target.checked)}
              />
              <label htmlFor="dateConfirmedCheck" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                Date is confirmed (uncheck if date is tentative or ambiguous)
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
