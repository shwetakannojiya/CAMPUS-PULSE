import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Star,
  Settings,
  Zap,
  Globe,
  Layers
} from 'lucide-react';
import { APP_TIMEZONE } from '../../lib/constants';

export default function Sidebar({ activeTab, onSelectTab, counts = {} }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: null },
    { id: 'all-events', label: 'All Events', icon: Layers, count: counts.total || 0 },
    { id: 'calendar', label: 'Calendar', icon: Calendar, count: null },
    { id: 'important', label: 'Important', icon: Star, count: counts.important || 0 },
    { id: 'settings', label: 'Settings', icon: Settings, count: null },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">
          <Zap size={20} />
        </div>
        <div className="brand-text">
          <h1>Campus Pulse</h1>
          <div className="brand-tag">AI Notice Hub</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.count !== null && item.count > 0 && (
                <span className="nav-count">{item.count}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="timezone-pill">
          <Globe size={13} />
          <span>TZ: {APP_TIMEZONE}</span>
        </div>
      </div>
    </aside>
  );
}

