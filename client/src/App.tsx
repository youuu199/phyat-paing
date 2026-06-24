import { useState, useCallback } from 'react';
import { Menu, X, LayoutDashboard, BarChart3, User, Settings, LogOut, ReceiptText, Loader2 } from 'lucide-react';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './components/AuthContext';
import AuthPage from './components/AuthPage';
import BillDashboard from './components/BillDashboard';
import AnalyticsPage from './components/AnalyticsPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import ThemeToggle from './components/ThemeToggle';
import MobileNav from './components/MobileNav';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

type Page = 'dashboard' | 'analytics' | 'profile' | 'settings';

function Hamburger({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      className="hamburger"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls="mobile-nav"
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
    >
      {isOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
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
            <h1 className="app-title" style={{ cursor: 'pointer' }} onClick={() => navigateTo('dashboard')}>
              <ReceiptText size={24} strokeWidth={1.75} className="app-title__icon" />
              Smart Bill Organizer
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
                <LayoutDashboard size={16} strokeWidth={1.75} />
                Dashboard
              </button>
              <button
                className={`app-header__nav-btn${page === 'analytics' ? ' app-header__nav-btn--active' : ''}`}
                onClick={() => setPage('analytics')}
                aria-current={page === 'analytics' ? 'page' : undefined}
              >
                <BarChart3 size={16} strokeWidth={1.75} />
                Analytics
              </button>
              <button
                className={`app-header__nav-btn${page === 'profile' ? ' app-header__nav-btn--active' : ''}`}
                onClick={() => setPage('profile')}
                aria-current={page === 'profile' ? 'page' : undefined}
              >
                <User size={16} strokeWidth={1.75} />
                Profile
              </button>
              <button
                className={`app-header__nav-btn${page === 'settings' ? ' app-header__nav-btn--active' : ''}`}
                onClick={() => setPage('settings')}
                aria-current={page === 'settings' ? 'page' : undefined}
              >
                <Settings size={16} strokeWidth={1.75} />
                Settings
              </button>
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
          {page === 'analytics' && <AnalyticsPage />}
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
