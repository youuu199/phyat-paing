import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2, Upload, Check, X as XIcon } from 'lucide-react';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './components/AuthContext';
import { UploadProvider, useUpload } from './components/UploadContext';
import AuthPage from './components/AuthPage';
import AppLayout from './layouts/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { useThemeStore, initTheme } from './hooks/useTheme';
import './index.css';

// Lazy load pages for smaller initial bundle
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BillsPage = lazy(() => import('./pages/BillsPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Initialize theme from localStorage immediately
initTheme();

// Apply theme from global store
function ThemeEffect() {
  const { theme } = useThemeStore();

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.add('light');
    }
    // 'system' uses CSS media query
  }, [theme]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-bg">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/" replace /> : <AuthPage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="bills" element={<BillsPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

function UploadProgressIndicator() {
  const { jobs, clearDone, removeJob } = useUpload();
  const activeJobs = jobs.filter((j) => j.stage === 'uploading' || j.stage === 'ocr' || j.stage === 'ai');
  const doneJobs = jobs.filter((j) => j.stage === 'done' || j.stage === 'error');

  if (jobs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 max-w-[320px]">
      {/* Active uploads */}
      {activeJobs.map((job) => (
        <div
          key={job.id}
          className="flex items-center gap-3 px-4 py-3 bg-bg-card rounded-xl border border-border shadow-lg"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[13px] font-medium text-text-primary truncate">
              {job.fileName}
            </span>
            <span className="text-[11px] text-text-secondary capitalize">
              {job.stage === 'uploading' && 'Uploading...'}
              {job.stage === 'ocr' && 'Extracting text...'}
              {job.stage === 'ai' && 'Classifying...'}
            </span>
          </div>
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <button
            onClick={() => removeJob(job.id)}
            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-bg transition-colors shrink-0"
          >
            <XIcon className="w-3 h-3 text-text-muted" />
          </button>
        </div>
      ))}

      {/* Done/error summary */}
      {doneJobs.length > 0 && activeJobs.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-bg-card rounded-xl border border-border shadow-lg">
          {doneJobs.some((j) => j.stage === 'done') ? (
            <Check className="w-5 h-5 text-success shrink-0" />
          ) : (
            <XIcon className="w-5 h-5 text-danger shrink-0" />
          )}
          <span className="text-[13px] text-text-primary flex-1">
            {doneJobs.filter((j) => j.stage === 'done').length} uploaded
            {doneJobs.some((j) => j.stage === 'error') && (
              <>, <span className="text-danger">{doneJobs.filter((j) => j.stage === 'error').length} failed</span></>
            )}
          </span>
          <button
            onClick={clearDone}
            className="text-[11px] text-text-muted hover:text-text-primary transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeEffect />
        <UploadProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <AppRoutes />
              <UploadProgressIndicator />
            </ErrorBoundary>
          </BrowserRouter>
        </UploadProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
