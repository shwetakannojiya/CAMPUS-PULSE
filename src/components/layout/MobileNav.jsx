import React from 'react';
import { LayoutDashboard, Layers, Calendar, Star, Settings } from 'lucide-react';

export default function MobileNav({ activeTab, onSelectTab }) {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'all-events', label: 'Events', icon: Layers },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'important', label: 'Starred', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="mobile-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

