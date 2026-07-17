import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Plus, Calendar, MoreHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const TABS = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard, path: '/' },
  { id: 'bills', label: 'Bills', icon: Receipt, path: '/bills' },
  { id: 'upload', label: 'Upload', icon: Plus, path: '/upload', accent: true },
  { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
  { id: 'more', label: 'More', icon: MoreHorizontal, path: '#more' },
];

const MORE_OPTIONS = [
  { label: 'Analytics', path: '/analytics' },
  { label: 'Settings', path: '/settings' },
  { label: 'Profile', path: '/profile' },
];

export default function MobileNav() {
  const [showMore, setShowMore] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    }
    if (showMore) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMore]);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-bg-sidebar border-t border-white/10 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {TABS.map((tab) => {
          if (tab.id === 'more') {
            return (
              <div key="more" className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMore(!showMore)}
                  className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
                    showMore ? 'text-primary-light' : 'text-slate-400'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>

                {showMore && (
                  <div className="absolute bottom-full right-0 mb-2 w-44 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-slide-in">
                    {MORE_OPTIONS.map((opt) => (
                      <NavLink
                        key={opt.path}
                        to={opt.path}
                        onClick={() => setShowMore(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-bg transition-colors"
                      >
                        {opt.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
                  isActive
                    ? 'text-primary-light'
                    : 'text-slate-400 hover:text-slate-300'
                }`
              }
            >
              {tab.accent ? (
                <span className="flex items-center justify-center w-10 h-10 -mt-4 rounded-full bg-primary text-white shadow-lg shadow-primary/30">
                  <tab.icon className="w-5 h-5" />
                </span>
              ) : (
                <tab.icon className="w-5 h-5" />
              )}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
