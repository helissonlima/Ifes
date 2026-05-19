import { useState, useEffect } from 'react';

/**
 * Retorna { isOnline, wasOffline }
 * - isOnline: estado atual da conexão
 * - wasOffline: flag que fica true quando a conexão cai pelo menos uma vez
 *   (útil para disparar sincronização ao reconectar)
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const resetWasOffline = () => setWasOffline(false);

  return { isOnline, wasOffline, resetWasOffline };
}
