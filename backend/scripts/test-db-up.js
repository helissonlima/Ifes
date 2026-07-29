#!/usr/bin/env node
// Sobe (ou reaproveita, se já existir) um Postgres descartável pros testes de
// integração e aplica as migrations nele — ver tests/helpers.js e
// vitest.config.js. Rodado automaticamente antes de `npm test` (pretest).
// Não derruba o container ao final: reaproveitar entre execuções é bem mais
// rápido que recriar toda vez. Pra remover de vez: npm run test:db:down.
const { execSync, execFileSync } = require('child_process');

const NOME = 'sustenta-test-db';
const PORTA = process.env.TEST_DB_PORT || '5433';

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function containerExiste() {
  return sh(`docker ps -a --filter "name=^/${NOME}$" --format "{{.Names}}"`) === NOME;
}

function containerRodando() {
  return sh(`docker ps --filter "name=^/${NOME}$" --format "{{.Names}}"`) === NOME;
}

function dormir(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

try {
  execFileSync('docker', ['info'], { stdio: 'ignore' });
} catch {
  console.error('❌ Docker não está disponível/rodando. Inicie o Docker Desktop (ou daemon equivalente) antes de rodar os testes do backend.');
  process.exit(1);
}

if (!containerExiste()) {
  console.log(`🐘 Criando banco de teste "${NOME}" na porta ${PORTA}...`);
  execSync(
    `docker run -d --name ${NOME} -e POSTGRES_PASSWORD=test -e POSTGRES_DB=sustenta_test -e POSTGRES_USER=postgres -p ${PORTA}:5432 postgres:16-alpine`,
    { stdio: 'inherit' }
  );
} else if (!containerRodando()) {
  console.log(`🐘 Reiniciando banco de teste "${NOME}"...`);
  execSync(`docker start ${NOME}`, { stdio: 'inherit' });
} else {
  console.log(`🐘 Banco de teste "${NOME}" já está rodando.`);
}

process.stdout.write('⏳ Aguardando Postgres de teste ficar pronto');
const inicio = Date.now();
let pronto = false;
while (Date.now() - inicio < 30000) {
  try {
    execSync(`docker exec ${NOME} pg_isready -U postgres`, { stdio: 'ignore' });
    pronto = true;
    break;
  } catch {
    process.stdout.write('.');
    dormir(500);
  }
}
console.log('');

if (!pronto) {
  console.error(`❌ Postgres de teste não ficou pronto em 30s. Verifique "docker logs ${NOME}".`);
  process.exit(1);
}

console.log('📦 Aplicando migrations no banco de teste...');
const envMigracao = {
  ...process.env,
  DB_HOST: 'localhost',
  DB_PORT: PORTA,
  DB_NAME: 'sustenta_test',
  DB_USER: 'postgres',
  DB_PASSWORD: 'test',
};

// A imagem oficial do Postgres reinicia internamente após a inicialização
// (1ª subida só roda os scripts de init, depois reinicia pra valer) —
// pg_isready pode responder "OK" nessa janela, contra uma instância que já
// vai cair em seguida, derrubando a 1ª tentativa de conexão real (ECONNRESET).
// Não é falha nas migrations em si, então tenta de novo antes de desistir.
const MAX_TENTATIVAS = 5;
for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
  try {
    execSync('node scripts/migrate.js', { stdio: 'inherit', env: envMigracao });
    break;
  } catch (err) {
    if (tentativa === MAX_TENTATIVAS) throw err;
    console.log(`   conexão ainda não estável (tentativa ${tentativa}/${MAX_TENTATIVAS}), tentando de novo em 2s...`);
    dormir(2000);
  }
}

console.log('✅ Banco de teste pronto.');
