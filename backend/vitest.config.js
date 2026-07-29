const { defineConfig } = require('vitest/config');

// Testes de integração usam um Postgres real (porta 5433, isolado do banco de
// dev/produção) — ver tests/README.md. Todos os arquivos de teste compartilham
// essa mesma instância, então rodam em SEQUÊNCIA (fileParallelism: false) para
// truncar as tabelas entre testes sem uma corrida entre arquivos paralelos.
module.exports = defineConfig({
  test: {
    environment: 'node',
    // Backend é CommonJS (sem "type": "module") — globals evita ter que usar
    // import/ESM só nos arquivos de teste. describe/it/expect ficam globais.
    globals: true,
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 15000,
    env: {
      NODE_ENV: 'test',
      DB_HOST: process.env.TEST_DB_HOST || 'localhost',
      DB_PORT: process.env.TEST_DB_PORT || '5433',
      DB_NAME: process.env.TEST_DB_NAME || 'sustenta_test',
      DB_USER: process.env.TEST_DB_USER || 'postgres',
      DB_PASSWORD: process.env.TEST_DB_PASSWORD || 'test',
      JWT_SECRET: 'test-secret-nao-usar-em-producao-0123456789ab',
      JWT_EXPIRES_IN: '1h',
      ADMIN_EMAIL: 'admin@teste.local',
      ADMIN_PASSWORD: 'admin-teste-123',
      FRONTEND_URL: 'http://localhost:5173',
    },
  },
});
