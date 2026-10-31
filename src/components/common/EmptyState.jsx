import React from 'react';
import { CalendarX } from 'lucide-react';

export default function EmptyState({ icon: Icon = CalendarX, title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>
      <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
        {title}
      </h4>
      <p style={{ maxWidth: 400, fontSize: '0.88rem' }}>{message}</p>
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

