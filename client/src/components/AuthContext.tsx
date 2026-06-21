import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface User {
  email: string;
  createdAt: string;
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  apiFetch: (path: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

const TOKEN_KEY = 'bill_organizer_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    // Validate the stored token by calling /api/auth/me
    (async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${stored}` },
        });
        const data = await safeJSON(res);
        if (!res.ok) throw new Error('Token invalid');
        setToken(stored);
        setUser(data);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const apiFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      try {
        const res = await fetch(path, { ...options, headers });

        // Detect backend-down conditions (Render cold start, server crash)
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          throw new Error(
            'Server is starting up — Render free tier takes 30-60s to wake up. Please wait and try again.'
          );
        }

        return res;
      } catch (err) {
        // Network errors (backend completely unreachable)
        if (err instanceof TypeError && err.message.includes('fetch')) {
          throw new Error(
            'Cannot reach the server — it may be starting up (Render free tier takes 30-60s). Please wait and try again.'
          );
        }
        throw err;
      }
    },
    [token],
  );

  // Safe JSON parse — backend may return HTML when down (Vite proxy error page)
  const safeJSON = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      throw new Error('Received an invalid response from the server');
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await safeJSON(res);

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await safeJSON(res);

    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}
