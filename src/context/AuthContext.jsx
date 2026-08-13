import { createContext, useCallback, useEffect, useState } from 'react';
import { getMe, login as loginApi, logout as logoutApi } from '../services/authApi.js';
import { setAuthToken } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMe();
      setAdmin(res.data?.admin || res.data || null);
    } catch (_err) {
      setAdmin(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async (email, password) => {
    const res = await loginApi(email, password);
    if (res.data?.token) setAuthToken(res.data.token);
    setAdmin(res.data?.admin || null);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (_err) {
      // ignore network errors on logout, clear client state regardless
    }
    setAuthToken(null);
    setAdmin(null);
  }, []);

  const value = {
    admin,
    isAuthenticated: !!admin,
    loading,
    initialized,
    login,
    logout,
    refresh: hydrate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
