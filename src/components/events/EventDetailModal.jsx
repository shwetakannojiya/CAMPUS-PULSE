import React from 'react';
import { X, Calendar, Clock, MapPin, AlertCircle, FileText, Check, Copy } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function EventDetailModal({ event, onClose, onEdit, onDelete }) {
  if (!event) return null;

  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = [
      `📅 ${event.title}`,
      `📂 Category: ${event.category || 'Other'}`,
      `🗓 Date: ${event.date || 'Not specified'}`,
      `⏰ Time: ${event.startTime || 'Not specified'}${event.endTime ? ` - ${event.endTime}` : ''}`,
      `📍 Venue: ${event.venue || 'Not specified'}`,
      event.registrationDeadline ? `⏳ Deadline: ${event.registrationDeadline}` : null,
      event.description ? `\n📝 Description: ${event.description}` : null,
      event.instructions?.length ? `\n📌 Instructions:\n${event.instructions.map((i) => `• ${i}`).join('\n')}` : null
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge status={event.computedStatus} />
            <Badge category={event.category} />
            {event.registrationClosed && <Badge isClosed={true} />}
          </div>
          <button className="btn-icon" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {event.title}
          </h2>

          <div className="event-meta" style={{ marginTop: 4 }}>
            <div className="meta-item">
              <Calendar size={16} color="var(--primary)" />
              <strong>{event.date || 'Not specified'}</strong>
            </div>
            <div className="meta-item">
              <Clock size={16} color="var(--primary)" />
              <span>{event.startTime ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}` : 'All Day'}</span>
            </div>
            <div className="meta-item">
              <MapPin size={16} color="var(--primary)" />
              <span>{event.venue || 'Not specified'}</span>
            </div>
          </div>

          {event.registrationDeadline && (
            <div style={{ padding: '8px 12px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              <strong>Registration Deadline:</strong> {event.registrationDeadline}
            </div>
          )}

          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 4 }}>
              Description
            </h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {event.description || 'No description provided.'}
            </p>
          </div>

          {event.instructions && event.instructions.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Instructions & Things to Bring
              </h4>
              <ul style={{ paddingLeft: 20, listStyleType: 'disc', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {event.instructions.map((inst, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{inst}</li>
                ))}
              </ul>
            </div>
          )}

          {event.sourceText && (
            <div style={{ marginTop: 8 }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                Original Raw Notice Text
              </h4>
              <pre style={{
                background: 'var(--bg-main)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                maxHeight: 120,
                overflowY: 'auto'
              }}>
                {event.sourceText}
              </pre>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>

          {onEdit && (
            <Button variant="secondary" size="sm" onClick={() => { onClose(); onEdit(event); }}>
              Edit
            </Button>
          )}

          {onDelete && (
            <Button variant="danger" size="sm" onClick={() => { onClose(); onDelete(event.id); }}>
              Delete
            </Button>
          )}

          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

