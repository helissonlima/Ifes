// Stub de virtual:pwa-register/react (módulo virtual injetado pelo
// vite-plugin-pwa em dev/build) para os testes poderem importar App.jsx —
// que renderiza <UpdatePrompt/>, consumidor desse módulo — sem depender do
// plugin de PWA, que não faz parte do ambiente de teste.
export function useRegisterSW() {
  return {
    offlineReady: [false, () => {}],
    needRefresh: [false, () => {}],
    updateServiceWorker: () => {},
  };
}
