import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import * as usersApi from '../api/users';
import { setSessionExpiredHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const userRef = useRef(user);
  userRef.current = user;
  const locationRef = useRef(location);
  locationRef.current = location;

  // When a refresh fails the session is over: clear it and send the user
  // to /login, remembering where they were.
  useEffect(() => {
    setSessionExpiredHandler(({ silent }) => {
      const hadSession = Boolean(userRef.current);
      setUser(null);
      if (!silent && hadSession) {
        navigate('/login', {
          replace: true,
          state: { from: locationRef.current, reason: 'session-expired' },
        });
      }
    });
    return () => setSessionExpiredHandler(() => {});
  }, [navigate]);

  // Restore an existing session on first load.
  useEffect(() => {
    let cancelled = false;
    authApi
      .me({ skipSessionRedirect: true })
      .then((res) => {
        if (!cancelled) setUser(res.data.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      // Clear local state even if the network call fails.
      setUser(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    await authApi.logoutAll();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await authApi.me();
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const updatePreferences = useCallback(async (preferences) => {
    const res = await usersApi.updatePreferences(preferences);
    setUser(res.data.user);
    return res;
  }, []);

  const value = useMemo(
    () => ({ user, loading, register, login, logout, logoutAll, refreshUser, updatePreferences }),
    [user, loading, register, login, logout, logoutAll, refreshUser, updatePreferences],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
