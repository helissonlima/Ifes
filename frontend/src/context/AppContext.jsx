import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { authAPI, setAuthToken, onUnauthorized, TOKEN_KEY } from '../services/api';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const defaultContextValue = {
  notify: () => {},
  user: null,
  loadingAuth: true,
  isAuthenticated: false,
  loadSession: async () => {},
  login: async () => {},
  logout: () => {},
  hasPermission: () => false,
  isOnline: true,
  networkRecoveredAt: null,
};

const AppContext = createContext(defaultContextValue);

export function AppProvider({ children }) {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [networkRecoveredAt, setNetworkRecoveredAt] = useState(null);
  const { isOnline } = useNetworkStatus();

  const loadSession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoadingAuth(false);
      return;
    }

    try {
      setAuthToken(token);
      const me = await authAPI.me();
      setUser(me.data);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  const notify = useCallback((message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  }, []);

  // O interceptor axios (fora do React) já limpou o token; aqui só limpamos o
  // usuário da sessão — o RequireAuth em App.jsx cuida do redirect para /login.
  useEffect(() => {
    onUnauthorized(() => {
      setUser(null);
      notify('Sessão expirada. Faça login novamente.', 'warning');
    });
    return () => onUnauthorized(null);
  }, [notify]);

  useEffect(() => {
    if (isOnline) {
      setNetworkRecoveredAt(new Date().toISOString());
      return;
    }
    setNetworkRecoveredAt(null);
  }, [isOnline]);

  const closeNotification = () => setNotification((n) => ({ ...n, open: false }));

  const login = useCallback(async (email, senha) => {
    const response = await authAPI.login(email, senha);
    const { token, user: logged } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    setUser(logged);
    return logged;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
  }, []);

  const hasPermission = useCallback((key) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Boolean(user.permissions?.[key]);
  }, [user]);

  return (
    <AppContext.Provider value={{
      notify,
      user,
      loadingAuth,
      isAuthenticated: Boolean(user),
      loadSession,
      login,
      logout,
      hasPermission,
      isOnline,
      networkRecoveredAt,
    }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeNotification} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
