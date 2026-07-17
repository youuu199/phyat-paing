import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Receipt, Settings, LogOut } from 'lucide-react';
import { NAV_ITEMS, BRAND_NAME } from '../utils/nav';
import { useAuth } from './AuthContext';

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const { user, apiFetch, logout } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
    <aside
      className={`h-screen bg-bg-sidebar flex flex-col py-7 shrink-0 transition-all duration-200 overflow-hidden ${
        collapsed ? 'w-[72px] px-2 items-center' : 'w-[260px] px-5'
      }`}
    >
      {/* Brand */}
      <div className={`flex items-center gap-2.5 px-1 mb-8 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/image-logo.png" alt="Phyat Paing" className="w-5 h-5 object-contain" />
        </div>
        {!collapsed && (
          <span className="font-heading text-lg font-bold text-slate-100 whitespace-nowrap">
            {BRAND_NAME}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1 w-full">
        {NAV_ITEMS.map((item) => (
          <div key={item.id} className="relative">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg text-sm transition-colors ${
                  collapsed ? 'justify-center px-0 py-2.5 w-full' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-primary-dark text-white font-semibold'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
                }`
              }
              onMouseEnter={() => collapsed && setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && item.label}
            </NavLink>
            {collapsed && hoveredItem === item.id && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap z-50 shadow-lg pointer-events-none">
                {item.label}
              </div>
            )}
          </div>
        ))}

        <div className={`my-4 h-px bg-slate-700 ${collapsed ? 'w-8' : ''}`} />

        <div className="relative">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg text-sm transition-colors ${
                collapsed ? 'justify-center px-0 py-2.5 w-full' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-primary-dark text-white font-semibold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
              }`
            }
            onMouseEnter={() => collapsed && setHoveredItem('settings')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!collapsed && 'Settings'}
          </NavLink>
          {collapsed && hoveredItem === 'settings' && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap z-50 shadow-lg pointer-events-none">
              Settings
            </div>
          )}
        </div>
      </nav>

      {/* Profile & Logout */}
      <div className={`flex items-center gap-3 py-3 rounded-xl bg-white/5 ${
        collapsed ? 'px-0 justify-center w-12 mt-4' : 'px-1'
      }`}>
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
        {!collapsed && (
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
        )}
        {!collapsed && (
          <button
            onClick={logout}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-red-400 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
