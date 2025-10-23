import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, History, Mailbox, Search, List } from 'lucide-react';

export default function BottomNav({ premiumActive }) {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Today', route: 'Journal' },
    { icon: History, label: 'To You', route: 'TimeCapsulePage' },
    { icon: Mailbox, label: 'Future', route: 'SealedNotes' },
    { icon: List, label: 'Timeline', route: 'Timeline' },
    { icon: Search, label: 'Search', route: 'Search', gated: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 h-20 bg-[var(--paper-bg)] bg-opacity-80 backdrop-blur-sm border-t border-[var(--paper-line)]">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.gated && !premiumActive) return null;

          const url = createPageUrl(item.route);
          const isActive = location.pathname === url;

          return (
            <Link
              key={item.label}
              to={url}
              className={`flex flex-col items-center justify-center w-20 transition-colors duration-200 ${
                isActive ? 'text-[var(--paper-accent-2)]' : 'text-[var(--paper-ink-faded)] hover:text-[var(--paper-accent)]'
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}