import { Snackbar, Alert, Button } from '@mui/material';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Com registerType: 'prompt' (vite.config.js), uma nova versão do app fica
 * pronta em segundo plano mas só substitui a atual quando o usuário confirma
 * — evita perder um rascunho de avaliação em andamento por causa de um
 * reload automático no meio do preenchimento.
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
      <Snackbar
        open={offlineReady}
        autoHideDuration={5000}
        onClose={fecharOfflineReady}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={fecharOfflineReady} severity="success" variant="filled" sx={{ width: '100%' }}>
          App pronto para uso offline.
        </Alert>
      </Snackbar>

      <Snackbar
        open={needRefresh}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          variant="filled"
          sx={{ width: '100%' }}
          action={
            <>
              <Button color="inherit" size="small" onClick={() => updateServiceWorker(true)}>
                Atualizar
              </Button>
              <Button color="inherit" size="small" onClick={fecharNeedRefresh}>
                Depois
              </Button>
            </>
          }
        >
          Nova versão disponível.
        </Alert>
      </Snackbar>
    </>
  );
}
