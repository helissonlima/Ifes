import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { authAPI, setAuthToken, onUnauthorized, TOKEN_KEY } from '../services/api';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

// Último perfil (cargo/permissões) confirmado pelo backend — usado só quando
// /auth/me não pôde ser verificado por falta de conexão (ver loadSession):
// sem isso, um técnico em campo sem sinal seria deslogado a cada reabertura
// do app mesmo com um token ainda válido.
const USER_CACHE_KEY = 'sustenta_user_cache';

function lerUsuarioCache() {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function salvarUsuarioCache(user) {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {
    // localStorage indisponível/cheio — segue só em memória nesta sessão.
  }
}

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
      salvarUsuarioCache(me.data);
    } catch (err) {
      const cache = err?.isOffline ? lerUsuarioCache() : null;
      if (cache) {
        setUser(cache);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
        setUser(null);
      }
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  const notify = useCallback((message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification((n) => ({ ...n, open: false }));
  }, []);

  useEffect(() => {
    if (!notification.open) return;
    const timer = setTimeout(() => {
      closeNotification();
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification.open, closeNotification]);

  // O interceptor axios (fora do React) já limpou o token; aqui só limpamos o
  // usuário da sessão — o RequireAuth em App.jsx cuida do redirect para /login.
  useEffect(() => {
    onUnauthorized(() => {
      setUser(null);
      localStorage.removeItem(USER_CACHE_KEY);
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

  const login = useCallback(async (email, senha) => {
    const response = await authAPI.login(email, senha);
    const { token, user: logged } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    setUser(logged);
    salvarUsuarioCache(logged);
    return logged;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
    setAuthToken(null);
    setUser(null);
  }, []);

  const hasPermission = useCallback((key) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Boolean(user.permissions?.[key]);
  }, [user]);

  const toastIcons = {
    success: <FiCheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />,
    warning: <FiAlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
    error: <FiAlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
    info: <FiInfo className="h-5 w-5 text-sky-600 shrink-0" />,
  };

  const toastStyles = {
    success: 'bg-white border-emerald-200 text-slate-800 shadow-lg',
    warning: 'bg-white border-amber-200 text-slate-800 shadow-lg',
    error: 'bg-white border-red-200 text-slate-800 shadow-lg',
    info: 'bg-white border-sky-200 text-slate-800 shadow-lg',
  };

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

      {/* Toast Notification */}
      {notification.open && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-3 shadow-xl transition-all"
        >
          <div className={`flex items-center gap-3 rounded-lg px-1 ${toastStyles[notification.severity] || toastStyles.info}`}>
            {toastIcons[notification.severity] || toastIcons.info}
            <span className="text-sm font-medium text-slate-800">
              {notification.message}
            </span>
            <button
              type="button"
              onClick={closeNotification}
              className="ml-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-hidden"
              aria-label="Fechar notificação"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
