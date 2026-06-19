import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './components/AuthContext';
import AuthPage from './components/AuthPage';
import BillDashboard from './components/BillDashboard';
import './App.css';

function AppContent() {
  const { token, user, loading, logout } = useAuth();

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
            <h1>🧾 Smart Bill Organizer</h1>
            <p>Upload your bills and receipts — we'll extract the data automatically.</p>
          </div>
          <div className="app-header__user">
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
        <BillDashboard />
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
