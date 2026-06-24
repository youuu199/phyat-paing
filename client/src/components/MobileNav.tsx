import { useRef, useEffect } from 'react';
import { X, ReceiptText, LayoutDashboard, BarChart3, User, Settings, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

type Page = 'dashboard' | 'analytics' | 'profile' | 'settings';

interface MobileNavProps {
  isOpen: boolean;
  page: Page;
  userEmail?: string;
  onNavigate: (page: Page) => void;
  onClose: () => void;
  onLogout: () => void;
}

export default function MobileNav({ isOpen, page, userEmail, onNavigate, onClose, onLogout }: MobileNavProps) {
  const navRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Focus first nav item on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        navRef.current?.querySelector<HTMLElement>('.mobile-nav__item')?.focus();
      }, 200); // wait for slide animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const nav = (p: Page) => { onNavigate(p); onClose(); };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`mobile-nav__backdrop${isOpen ? ' mobile-nav__backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        id="mobile-nav"
        ref={navRef}
        className={`mobile-nav${isOpen ? ' mobile-nav--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
      {/* Header with brand + close */}
      <div className="mobile-nav__header">
        <span className="mobile-nav__brand">
          <ReceiptText size={20} strokeWidth={1.75} className="mobile-nav__brand-icon" />
          Smart Bill
        </span>
        <button
          className="mobile-nav__close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="mobile-nav__list" aria-label="Main navigation">
        <button
          className={`mobile-nav__item${page === 'dashboard' ? ' mobile-nav__item--active' : ''}`}
          onClick={() => nav('dashboard')}
          aria-current={page === 'dashboard' ? 'page' : undefined}
        >
          <LayoutDashboard size={18} strokeWidth={1.75} />
          Dashboard
        </button>
        <button
          className={`mobile-nav__item${page === 'analytics' ? ' mobile-nav__item--active' : ''}`}
          onClick={() => nav('analytics')}
          aria-current={page === 'analytics' ? 'page' : undefined}
        >
          <BarChart3 size={18} strokeWidth={1.75} />
          Analytics
        </button>
        <button
          className={`mobile-nav__item${page === 'profile' ? ' mobile-nav__item--active' : ''}`}
          onClick={() => nav('profile')}
          aria-current={page === 'profile' ? 'page' : undefined}
        >
          <User size={18} strokeWidth={1.75} />
          Profile
        </button>
        <button
          className={`mobile-nav__item${page === 'settings' ? ' mobile-nav__item--active' : ''}`}
          onClick={() => nav('settings')}
          aria-current={page === 'settings' ? 'page' : undefined}
        >
          <Settings size={18} strokeWidth={1.75} />
          Settings
        </button>
      </nav>

      {/* Footer */}
      <div className="mobile-nav__footer">
        <ThemeToggle />
        {userEmail && (
          <span className="mobile-nav__email" title={userEmail}>
            <User size={14} strokeWidth={1.5} />
            {userEmail}
          </span>
        )}
        <button className="mobile-nav__logout" onClick={onLogout}>
          <LogOut size={16} strokeWidth={1.5} />
          Logout
        </button>
      </div>
      </div>
    </>
  );
}
