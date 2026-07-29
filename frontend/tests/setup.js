import '@testing-library/jest-dom/vitest';

// Node 22+ tem seu próprio localStorage/sessionStorage nativos (experimental,
// exigem --localstorage-file pra funcionar de verdade). Como esses nomes já
// existem no global do processo, o adaptador jsdom desta versão do vitest
// (populateGlobal em node_modules/vitest/dist/chunks/index.*.js) não os
// sobrescreve com a implementação real do jsdom — só globais que já existem
// são preservados, a menos que estejam na allowlist interna do vitest, que
// não inclui "localStorage"/"sessionStorage" (só a classe "Storage"). Sem
// isso, localStorage fica undefined em todo teste que dependa dele.
if (typeof globalThis.jsdom !== 'undefined') {
  globalThis.localStorage = globalThis.jsdom.window.localStorage;
  globalThis.sessionStorage = globalThis.jsdom.window.sessionStorage;
}
