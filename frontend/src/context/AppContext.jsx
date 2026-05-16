import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { authAPI, setAuthToken } from '../services/api';

const AppContext = createContext(null);
const TOKEN_KEY = 'sustenta_token';

export function AppProvider({ children }) {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

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
