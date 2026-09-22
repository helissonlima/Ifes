import { useRegisterSW } from 'virtual:pwa-register/react';
import { FiCheckCircle, FiRefreshCw, FiX } from 'react-icons/fi';
import Button from '../ui/Button';

/**
 * Com registerType: 'prompt' (vite.config.js), uma nova versão do app fica
 * pronta em segundo plano mas só substitui a atual quando o usuário confirma.
 */
export default function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const fecharOfflineReady = () => setOfflineReady(false);
  const fecharNeedRefresh = () => setNeedRefresh(false);

  return (
    <>
      {offlineReady && (
        <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-xl">
          <FiCheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium text-slate-800">
            App pronto para uso offline.
          </span>
          <button
            type="button"
            onClick={fecharOfflineReady}
            className="ml-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caparao-700 focus-visible:ring-offset-1"
            aria-label="Fechar aviso offline"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {needRefresh && (
        <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 flex-wrap items-center gap-3 rounded-xl border border-sky-200 bg-white px-4 py-3 shadow-xl">
          <div className="flex items-center gap-2">
            <FiRefreshCw className="h-5 w-5 text-sky-600 shrink-0 animate-spin" />
            <span className="text-sm font-semibold text-slate-800">
              Nova versão disponível.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => updateServiceWorker(true)}
            >
              Atualizar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={fecharNeedRefresh}
            >
              Depois
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
