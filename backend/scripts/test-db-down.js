#!/usr/bin/env node
// Remove o container de banco de teste (ver test-db-up.js). Não roda
// automaticamente — chame com `npm run test:db:down` quando quiser liberar
// os recursos.
const { execSync } = require('child_process');

const NOME = 'sustenta-test-db';

try {
  execSync(`docker rm -f ${NOME}`, { stdio: 'inherit' });
  console.log(`✅ Container "${NOME}" removido.`);
} catch {
  console.log(`ℹ️  Container "${NOME}" não existia.`);
}
