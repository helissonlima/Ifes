import { useEffect } from 'react';

/**
 * Registra atalhos de teclado globais para o sistema ICSR.
 * callbacks: { onNewEvaluation, onGoHistory, onGoHome, onGoProperties }
 */
export function useGlobalKeyboardShortcuts(callbacks = {}, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      const { onNewEvaluation, onGoHistory, onGoHome, onGoProperties } = callbacks;

      if (e.altKey) {
        switch (e.key) {
          case 'n': case 'N': e.preventDefault(); onNewEvaluation?.(); break;
          case 'h': case 'H': e.preventDefault(); onGoHistory?.(); break;
          case 'i': case 'I': e.preventDefault(); onGoHome?.(); break;
          case 'p': case 'P': e.preventDefault(); onGoProperties?.(); break;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, callbacks]);
}

/**
 * Atalhos de teclado dentro do wizard de avaliação.
 * callbacks: { onNext, onPrev, onSave }
 */
export function useEvaluationKeyboardShortcuts(callbacks = {}, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      if (e.target.tagName === 'TEXTAREA') return;
      const { onNext, onPrev, onSave } = callbacks;

      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') { e.preventDefault(); onNext?.(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') { e.preventDefault(); onPrev?.(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); onSave?.(); }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, callbacks]);
}
