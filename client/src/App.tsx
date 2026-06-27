import { useState, useCallback } from 'react';
import { Menu, X, LogOut, ReceiptText, Loader2, User } from 'lucide-react';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { useTranslation } from './i18n/useTranslation';
import AuthPage from './components/AuthPage';
import BillDashboard from './components/BillDashboard';
import AnalyticsPage from './components/AnalyticsPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import MobileNav from './components/MobileNav';
import ErrorBoundary from './components/ErrorBoundary';
import { NAV_ITEMS } from './navigation';
import type { Page } from './types';
import './components/AppHeader.css';

function Hamburger({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      className="hamburger"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls="mobile-nav"
      aria-label={isOpen ? t('hamburger.close') : t('hamburger.open')}
    >
      {isOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
    </button>
  );
}

function AppContent() {
  const { token, user, loading, logout } = useAuth();
  const { t } = useTranslation();
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
        <p>{t('app.loading')}</p>
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
        {t('app.skipLink')}
      </a>

      <header className="app-header">
        <div className="app-header__inner">
          <div>
            <h1 className="app-title" style={{ cursor: 'pointer' }} onClick={() => navigateTo('dashboard')}>
              <ReceiptText size={24} strokeWidth={1.75} className="app-title__icon" />
              {t('app.title')}
            </h1>
            <p>{t('app.tagline')}</p>
          </div>
          <div className="app-header__user">
            <nav className="app-header__nav" aria-label="Main navigation">
              {NAV_ITEMS.map(({ page: p, icon: Icon, labelKey }) => (
                <button
                  key={p}
                  className={`app-header__nav-btn${page === p ? ' app-header__nav-btn--active' : ''}`}
                  onClick={() => setPage(p)}
                  aria-current={page === p ? 'page' : undefined}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  {t(labelKey)}
                </button>
              ))}
            </nav>
            <ThemeToggle />
            <LanguageToggle />
            <span className="app-header__email" title={user?.email}>
              <User size={14} strokeWidth={1.5} />
              {user?.email}
            </span>
            <button className="app-header__logout" onClick={logout}>
              <LogOut size={14} strokeWidth={1.5} />
              {t('nav.logout')}
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
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ToastProvider>
  );
}

export default App;
