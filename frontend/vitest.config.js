import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Módulo virtual do vite-plugin-pwa (não carregado nesta config, que não
// inclui o plugin de PWA) — App.jsx renderiza <UpdatePrompt/>, que importa
// isso; alias não resolve especificadores com ":" (não é um path normal),
// então intercepta via resolveId/load. Ver tests/mocks/pwaRegisterMock.js.
const mockarPwaRegister = () => ({
  name: 'mock-virtual-pwa-register',
  resolveId(id) {
    if (id === 'virtual:pwa-register/react') {
      return fileURLToPath(new URL('./tests/mocks/pwaRegisterMock.js', import.meta.url));
    }
    return null;
  },
});

// Config separada de vite.config.js (que carrega o plugin de PWA/Workbox,
// irrelevante e potencialmente problemático em ambiente de teste).
export default defineConfig({
  plugins: [react(), mockarPwaRegister()],
  test: {
    environment: 'jsdom',
    // jsdom só expõe localStorage/sessionStorage com uma origem http(s) real
    // (o padrão "about:blank" não tem origem válida pra Storage) — vários
    // utils testados aqui (requestCache, avaliacaoCache) dependem disso.
    environmentOptions: {
      jsdom: { url: 'http://localhost/' },
    },
    globals: true,
    setupFiles: ['./tests/setup.js'],
    css: false,
  },
});
