#!/usr/bin/env node
// Gera o arquivo .env (na raiz do projeto) na PRIMEIRA execução, com todas
// as senhas/segredos aleatórios de 32 caracteres. Se o .env já existir, nada
// é alterado — os segredos atuais são preservados.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');

if (fs.existsSync(envPath)) {
  console.log('ℹ️  .env já existe — mantendo segredos atuais.');
  process.exit(0);
}

// 16 bytes em hex = 32 caracteres
const secret = () => crypto.randomBytes(16).toString('hex');

const env = `# Gerado automaticamente em ${new Date().toISOString()}
# Segredos aleatórios de 32 caracteres. NÃO commitar este arquivo.

# --- Aplicação ---
APP_PORT=5173
NODE_ENV=production
FRONTEND_URL=http://localhost:5173

# --- Banco de Dados ---
DB_NAME=sustentabilidade_rural
DB_USER=postgres
DB_PASSWORD=${secret()}

# --- Segredos JWT (32 caracteres cada) ---
JWT_SECRET=${secret()}
JWT_REFRESH_SECRET=${secret()}
`;

fs.writeFileSync(envPath, env, { mode: 0o600 });
console.log('✅ .env criado com segredos aleatórios de 32 caracteres.');
