import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { CATEGORIES } from '../../lib/constants';
import { isValidCalendarDate, parseDateString } from '../../lib/dateUtils';

export default function ReviewCardModal({
  isOpen,
  extractedData,
  onClose,
  onSave
}) {
  if (!isOpen || !extractedData) return null;

  const [title, setTitle] = useState(extractedData.title || '');
  const [category, setCategory] = useState(extractedData.category || 'Other');
  const [date, setDate] = useState(extractedData.date || '');
  const [startTime, setStartTime] = useState(extractedData.startTime || '');
  const [endTime, setEndTime] = useState(extractedData.endTime || '');
  const [venue, setVenue] = useState(extractedData.venue || '');
  const [description, setDescription] = useState(extractedData.description || '');
  const [registrationDeadline, setRegistrationDeadline] = useState(extractedData.registrationDeadline || '');
  const [instructionsText, setInstructionsText] = useState(
    Array.isArray(extractedData.instructions) ? extractedData.instructions.join('\n') : ''
  );

  const ambiguities = extractedData.ambiguities || [];
  const hasDateAmbiguity = ambiguities.some((a) => a.field === 'date') || !date;

  const [dateConfirmed, setDateConfirmed] = useState(!hasDateAmbiguity);
  const [selectedAmbiguityOption, setSelectedAmbiguityOption] = useState(date);
  const [error, setError] = useState('');

  const [warning, setWarning] = useState('');

  const handleSelectOption = (opt) => {
    setSelectedAmbiguityOption(opt);
    setDate(opt);
    setDateConfirmed(true);
  };

  const handleSave = () => {
    setError('');
    setWarning('');

    if (!title.trim()) {
      setError('Event title cannot be empty.');
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

    // Check if registration deadline is after the event date
    if (date.trim() && registrationDeadline.trim()) {
      const deadlineDateMatch = registrationDeadline.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (deadlineDateMatch && deadlineDateMatch[0] > date.trim()) {
        const proceed = window.confirm(
          'Notice: The registration deadline is set after the event date. Is this intentional?'
        );
        if (!proceed) return;
      }
    }

    const finalEvent = {
      title: title.trim(),
      category: CATEGORIES.includes(category) ? category : 'Other',
      date: date.trim() || null,
      startTime: startTime.trim() || null,
      endTime: endTime.trim() || null,
      venue: venue.trim() || 'Not specified',
      description: description.trim(),
      registrationDeadline: registrationDeadline.trim() || null,
      instructions: instructionsText.split('\n').map((s) => s.trim()).filter(Boolean),
      dateConfirmed: Boolean(dateConfirmed && date.trim()),
      sourceText: extractedData.sourceText || ''
    };

    onSave(finalEvent);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={20} color="var(--primary)" />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Review Extracted Event Details
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {extractedData.isDemoResult
                  ? '⚡ Demo Mode Extraction (Verify and edit below before saving)'
                  : '✨ AI Generated Extraction (Verify and edit below before saving)'}
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} title="Cancel">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Ambiguity Alert Notice */}
          {ambiguities.length > 0 && (
            <div className="ambiguity-box">
              {ambiguities.map((amb, idx) => (
                <div key={idx} style={{ marginBottom: idx < ambiguities.length - 1 ? 8 : 0 }}>
                  <div className="ambiguity-header">
                    <AlertTriangle size={16} />
                    <span>Attention Needed: {amb.reason}</span>
                  </div>

                  {amb.options && amb.options.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Select the intended date:
                      </div>
                      <div className="ambiguity-options">
                        {amb.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className={`ambiguity-option-btn ${selectedAmbiguityOption === opt ? 'selected' : ''}`}
                            onClick={() => handleSelectOption(opt)}
                          >
                            {opt} {opt === '2026-05-04' ? '(4th May - DD/MM)' : opt === '2026-04-05' ? '(5th April - MM/DD)' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ padding: '8px 12px', background: 'var(--status-urgent-bg)', color: 'var(--status-urgent-text)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* Form inputs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Event Title *
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Confidence: {extractedData.confidence?.title || 'high'}
              </span>
            </div>
            <input
              type="text"
              className="notice-textarea"
              style={{ minHeight: 'auto', padding: '8px 12px', fontWeight: 600 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Date (YYYY-MM-DD)
                </label>
                <span style={{ fontSize: '0.72rem', color: hasDateAmbiguity ? 'var(--status-unconfirmed-accent)' : 'var(--text-muted)' }}>
                  {hasDateAmbiguity ? 'Ambiguous' : 'High confidence'}
                </span>
              </div>
              <input
                type="date"
                className="notice-textarea"
                style={{
                  minHeight: 'auto',
                  padding: '8px 12px',
                  borderColor: hasDateAmbiguity && !dateConfirmed ? 'var(--status-unconfirmed-accent)' : undefined
                }}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setDateConfirmed(true);
                }}
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
                placeholder="e.g. Auditorium Hall B"
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
              style={{ minHeight: 65 }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
              Instructions / Things to Bring (one per line)
            </label>
            <textarea
              className="notice-textarea"
              style={{ minHeight: 60 }}
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
            />
          </div>

          {/* Date confirmation checkbox */}
          <div style={{
            padding: '10px 14px',
            background: dateConfirmed ? 'var(--bg-main)' : 'var(--status-unconfirmed-bg)',
            border: `1px solid ${dateConfirmed ? 'var(--border-light)' : 'var(--status-unconfirmed-border)'}`,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <input
              type="checkbox"
              id="confirmDateCheck"
              checked={dateConfirmed}
              onChange={(e) => setDateConfirmed(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <label htmlFor="confirmDateCheck" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              {date
                ? 'I confirm this date and time are accurate.'
                : 'Save as "Date Unconfirmed" (will appear under Needs Date Confirmation group)'}
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {dateConfirmed ? 'Save Event' : 'Save as Unconfirmed'}
          </Button>
        </div>
      </div>
    </div>
  );
}
