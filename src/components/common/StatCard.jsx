import React from 'react';

export default function StatCard({ title, value, type, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${type}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

