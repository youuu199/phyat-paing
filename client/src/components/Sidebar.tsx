import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Receipt, Settings, LogOut } from 'lucide-react';
import { NAV_ITEMS, BRAND_NAME } from '../utils/nav';
import { useAuth } from './AuthContext';

export default function Sidebar() {
  const { user, apiFetch, logout } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await apiFetch('/api/v1/users/me');
        if (res.ok) {
          const data = await res.json();
          setDisplayName(data.displayName || '');
          setAvatarUrl(data.avatarUrl || '');
        }
      } catch {
        // fallback to email
      }
    })();
  }, [user, apiFetch]);

  const name = displayName || user?.email?.split('@')[0] || 'User';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <aside className="w-[260px] h-screen bg-bg-sidebar flex flex-col py-7 px-5 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-1 mb-8">
        <Receipt className="w-7 h-7 text-primary-light" />
        <span className="font-heading text-lg font-bold text-slate-100">
          {BRAND_NAME}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary-dark text-white font-semibold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}

        <div className="my-4 h-px bg-slate-700" />

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-primary-dark text-white font-semibold'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          Settings
        </NavLink>
      </nav>

      {/* Profile & Logout */}
      <div className="flex items-center gap-3 px-1 py-3 rounded-xl bg-white/5">
        <NavLink
          to="/profile"
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 hover:ring-2 hover:ring-primary-light transition-all overflow-hidden"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-white">{initials}</span>
          )}
        </NavLink>
        <div className="flex flex-col text-left min-w-0 flex-1">
          <NavLink
            to="/profile"
            className="text-[13px] font-medium text-slate-100 truncate hover:text-white transition-colors"
          >
            {name}
          </NavLink>
          <span className="text-[11px] text-slate-400 truncate">
            {user?.email || ''}
          </span>
        </div>
        <button
          onClick={logout}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-red-400 transition-colors cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
