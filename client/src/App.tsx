import { useState } from 'react';
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
