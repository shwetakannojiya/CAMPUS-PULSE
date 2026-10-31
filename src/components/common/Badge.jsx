import React from 'react';
import { AlertCircle, Clock, CheckCircle2, HelpCircle, AlertTriangle } from 'lucide-react';

export default function Badge({ status, category, isClosed, label }) {
  if (category) {
    return <span className="badge badge-category">{category}</span>;
  }

  if (isClosed) {
    return (
      <span className="badge badge-closed">
        <AlertTriangle size={12} />
        Registration Closed
      </span>
    );
  }

  switch (status) {
    case 'URGENT':
      return (
        <span className="badge badge-urgent">
          <AlertCircle size={13} />
          {label || 'URGENT'}
        </span>
      );
    case 'UPCOMING':
      return (
        <span className="badge badge-upcoming">
          <Clock size={13} />
          {label || 'UPCOMING'}
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="badge badge-expired">
          <CheckCircle2 size={13} />
          {label || 'EXPIRED'}
        </span>
      );
    case 'DATE_UNCONFIRMED':
      return (
        <span className="badge badge-unconfirmed">
          <HelpCircle size={13} />
          {label || 'DATE UNCONFIRMED'}
        </span>
      );
    default:
      return null;
  }
}

