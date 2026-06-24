import { useState, useRef, useEffect, useCallback } from 'react';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './components/AuthContext';
import AuthPage from './components/AuthPage';
import BillDashboard from './components/BillDashboard';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

type Page = 'dashboard' | 'profile' | 'settings';

function AppContent() {
  const { token, user, loading, logout } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Close mobile nav on Escape key
  useEffect(() => {
    if (!mobileNavOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileNavOpen]);

  // Focus trap: when nav opens, focus first nav button; when it closes, restore focus to hamburger
  useEffect(() => {
    if (mobileNavOpen) {
      const firstBtn = mobileNavRef.current?.querySelector<HTMLElement>('.mobile-nav__item');
      firstBtn?.focus();
    } else {
      hamburgerRef.current?.focus();
    }
  }, [mobileNavOpen]);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileNavOpen]);

  const navigateTo = useCallback((p: Page) => {
    setPage(p);
    setMobileNavOpen(false);
  }, []);

  // Full-page spinner while checking stored token
  if (loading) {
    return (
      <div className="auth-loading">
        <span className="auth-loading__spinner">⏳</span>
        <p>Loading...</p>
      </div>
    );
  }

  // Not authenticated → show auth page
  if (!token) {
    return <AuthPage />;
  }

  // Authenticated → show the full app
  return (
    <>
      {/* Skip link for keyboard users */}
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="app-header">
        <div className="app-header__inner">
          <div>
            <h1 style={{ cursor: 'pointer' }} onClick={() => setPage('dashboard')}>
              🧾 Smart Bill Organizer
            </h1>
            <p>Upload your bills and receipts — we'll extract the data automatically.</p>
          </div>
          <div className="app-header__user">
            <nav className="app-header__nav" aria-label="Main navigation">
              <button
                className={`app-header__nav-btn${page === 'dashboard' ? ' app-header__nav-btn--active' : ''}`}
                onClick={() => setPage('dashboard')}
                aria-current={page === 'dashboard' ? 'page' : undefined}
              >
                📊 Dashboard
              </button>
              <button
                className={`app-header__nav-btn${page === 'profile' ? ' app-header__nav-btn--active' : ''}`}
                onClick={() => setPage('profile')}
                aria-current={page === 'profile' ? 'page' : undefined}
              >
                👤 Profile
              </button>
              <button
                className={`app-header__nav-btn${page === 'settings' ? ' app-header__nav-btn--active' : ''}`}
                onClick={() => setPage('settings')}
                aria-current={page === 'settings' ? 'page' : undefined}
              >
                ⚙️ Settings
              </button>
            </nav>
            <ThemeToggle />
            <span className="app-header__email" title={user?.email}>
              👤 {user?.email}
            </span>
            <button className="app-header__logout" onClick={logout}>
              🚪 Logout
            </button>
          </div>

          {/* Hamburger button — visible only on mobile */}
          <button
            ref={hamburgerRef}
            className="hamburger"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav"
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <span className={`hamburger__line${mobileNavOpen ? ' hamburger__line--open' : ''}`} />
            <span className={`hamburger__line${mobileNavOpen ? ' hamburger__line--open' : ''}`} />
            <span className={`hamburger__line${mobileNavOpen ? ' hamburger__line--open' : ''}`} />
          </button>
        </div>

        {/* Mobile nav overlay */}
        <div
          className={`mobile-nav-overlay${mobileNavOpen ? ' mobile-nav-overlay--visible' : ''}`}
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />

        {/* Mobile nav drawer */}
        <div
          id="mobile-nav"
          ref={mobileNavRef}
          className={`mobile-nav${mobileNavOpen ? ' mobile-nav--open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <nav className="mobile-nav__list" aria-label="Main navigation">
            <button
              className={`mobile-nav__item${page === 'dashboard' ? ' mobile-nav__item--active' : ''}`}
              onClick={() => navigateTo('dashboard')}
              aria-current={page === 'dashboard' ? 'page' : undefined}
            >
              📊 Dashboard
            </button>
            <button
              className={`mobile-nav__item${page === 'profile' ? ' mobile-nav__item--active' : ''}`}
              onClick={() => navigateTo('profile')}
              aria-current={page === 'profile' ? 'page' : undefined}
            >
              👤 Profile
            </button>
            <button
              className={`mobile-nav__item${page === 'settings' ? ' mobile-nav__item--active' : ''}`}
              onClick={() => navigateTo('settings')}
              aria-current={page === 'settings' ? 'page' : undefined}
            >
              ⚙️ Settings
            </button>
          </nav>
          <div className="mobile-nav__footer">
            <ThemeToggle />
            <span className="mobile-nav__email" title={user?.email}>
              👤 {user?.email}
            </span>
            <button className="mobile-nav__logout" onClick={() => { logout(); setMobileNavOpen(false); }}>
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <ErrorBoundary>
          {page === 'dashboard' && <BillDashboard />}
          {page === 'profile' && <ProfilePage onBack={() => setPage('dashboard')} />}
          {page === 'settings' && <SettingsPage onBack={() => setPage('dashboard')} />}
        </ErrorBoundary>
      </main>
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
