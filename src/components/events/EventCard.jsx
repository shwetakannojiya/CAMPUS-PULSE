import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Star,
  Copy,
  Check,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import Badge from '../common/Badge';

export default function EventCard({
  event,
  onToggleImportant,
  onEdit,
  onDelete,
  onViewDetails
}) {
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Fallback defaults for missing fields
  const title = event.title || 'Untitled Event';
  const venue = event.venue || 'Not specified';
  const category = event.category || 'Other';
  const description = event.description || 'No description provided.';
  const instructions = Array.isArray(event.instructions) ? event.instructions : [];

  // Formatted date and time
  const formattedDate = event.date ? event.date : 'Not specified';
  const timeString = event.startTime
    ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`
    : (event.date ? 'All Day' : 'Not specified');

  const statusClass = `status-${(event.computedStatus || 'upcoming').toLowerCase()}`;

  const handleCopy = (e) => {
    e.stopPropagation();
    const plainText = [
      `📅 ${title}`,
      `📂 Category: ${category}`,
      `🗓 Date: ${formattedDate}`,
      `⏰ Time: ${timeString}`,
      `📍 Venue: ${venue}`,
      event.registrationDeadline ? `⏳ Deadline: ${event.registrationDeadline}` : null,
      description ? `\n📝 Description: ${description}` : null,
      instructions.length > 0 ? `\n📌 Instructions:\n${instructions.map((i) => `• ${i}`).join('\n')}` : null
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`event-card ${statusClass}`} onClick={onViewDetails} style={{ cursor: 'pointer' }}>
      <div className="event-header">
        <div className="event-title-group">
          <div className="event-badges">
            <Badge status={event.computedStatus} />
            <Badge category={category} />
            {event.registrationClosed && <Badge isClosed={true} />}
          </div>
          <h3 className="event-title">{title}</h3>
        </div>

        <div className="event-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`btn-icon star-btn ${event.isImportant ? 'starred' : ''}`}
            onClick={() => onToggleImportant(event.id)}
            title={event.isImportant ? 'Unstar event' : 'Mark as important'}
          >
            <Star size={18} fill={event.isImportant ? 'currentColor' : 'none'} />
          </button>

          <button
            className="btn-icon"
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy details to clipboard'}
          >
            {copied ? <Check size={18} color="var(--primary)" /> : <Copy size={18} />}
          </button>

          {onEdit && (
            <button
              className="btn-icon"
              onClick={() => onEdit(event)}
              title="Edit event"
            >
              <Edit2 size={17} />
            </button>
          )}

          {onDelete && (
            <button
              className="btn-icon"
              onClick={() => onDelete(event.id)}
              title="Delete event"
            >
              <Trash2 size={17} color="var(--status-urgent-accent)" />
            </button>
          )}
        </div>
      </div>

      <div className="event-meta">
        <div className="meta-item">
          <CalendarIcon size={15} color="var(--primary)" />
          <span>{formattedDate}</span>
        </div>

        <div className="meta-item">
          <Clock size={15} color="var(--primary)" />
          <span>{timeString}</span>
        </div>

        <div className="meta-item">
          <MapPin size={15} color="var(--primary)" />
          <span>{venue}</span>
        </div>
      </div>

      {description && <p className="event-desc">{description}</p>}

      {instructions.length > 0 && (
        <div className="event-instructions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              fontWeight: 600,
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <span>Instructions & Requirements ({instructions.length})</span>
            {showInstructions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showInstructions && (
            <ul className="instruction-list" style={{ marginTop: 8 }}>
              {instructions.map((item, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

