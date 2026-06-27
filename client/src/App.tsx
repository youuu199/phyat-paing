import { useState, useCallback } from 'react';
import { LogOut, ReceiptText, Loader2, User } from 'lucide-react';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './components/AuthContext';
import AuthPage from './components/AuthPage';
import BillDashboard from './components/BillDashboard';
import InsightsPage from './components/InsightsPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import ThemeToggle from './components/ThemeToggle';
import MobileNav from './components/MobileNav';
import ErrorBoundary from './components/ErrorBoundary';
import { type Page, NAV_ITEMS, BRAND_NAME, TAGLINE } from './utils/nav';
import './App.css';

function Hamburger({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      className={`hamburger${isOpen ? ' hamburger--open' : ''}`}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls="mobile-nav"
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
    >
      <span className="hamburger__line hamburger__line--top" />
      <span className="hamburger__line hamburger__line--mid" />
      <span className="hamburger__line hamburger__line--bot" />
    </button>
  );
}

function AppContent() {
  const { token, user, loading, logout } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  const navigateTo = useCallback((p: Page) => {
    setPage(p);
    setMobileNavOpen(false);
  }, []);

  // Full-page spinner while checking stored token
  if (loading) {
    return (
      <div className="auth-loading">
        <Loader2 className="auth-loading__spinner" size={32} strokeWidth={1.5} />
        <p>Loading…</p>
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
          <div className="app-header__brand">
            <h1 className="app-title" style={{ cursor: 'pointer' }} onClick={() => navigateTo('dashboard')}>
              <ReceiptText size={24} strokeWidth={1.75} className="app-title__icon" />
              {BRAND_NAME}
            </h1>
            <p>{TAGLINE}</p>
          </div>
          <div className="app-header__user">
            <nav className="app-header__nav" aria-label="Main navigation">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={`app-header__nav-btn${page === id ? ' app-header__nav-btn--active' : ''}`}
                  onClick={() => setPage(id)}
                  aria-current={page === id ? 'page' : undefined}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  {label}
                </button>
              ))}
            </nav>
            <ThemeToggle />
            <span className="app-header__email" title={user?.email}>
              <User size={14} strokeWidth={1.5} />
              {user?.email}
            </span>
            <button className="app-header__logout" onClick={logout}>
              <LogOut size={14} strokeWidth={1.5} />
              Logout
            </button>
          </div>

          <Hamburger
            isOpen={mobileNavOpen}
            onClick={() => setMobileNavOpen((o) => !o)}
          />
        </div>

      </header>

      <MobileNav
        isOpen={mobileNavOpen}
        page={page}
        userEmail={user?.email}
        onNavigate={navigateTo}
        onClose={closeMobileNav}
        onLogout={logout}
      />

      <main id="main-content" tabIndex={-1}>
        <ErrorBoundary>
          {page === 'dashboard' && <BillDashboard />}
          {page === 'insights' && <InsightsPage />}
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
