/**
 * AQUA MONITOR — Authentication Context
 * ----------------------------------------
 * Simple session-based auth gate.
 * Credentials come from VITE_ env vars (bundled into client).
 *
 * SECURITY NOTE: This is a prototype access gate only.
 * The hashed credential is visible to anyone who inspects the
 * built JS bundle. Do NOT use for sensitive production systems.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SESSION_KEY = 'aquamon_session';
const VALID_USERNAME = import.meta.env.VITE_APP_USERNAME || 'admin';
const VALID_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'aquamonitor2024';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.username) {
          setIsAuthenticated(true);
          setUser({ username: session.username });
        }
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((username, password) => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const session = { username };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setIsAuthenticated(true);
      setUser({ username });
      return { success: true };
    }
    return { success: false, error: 'Username atau password salah.' };
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
