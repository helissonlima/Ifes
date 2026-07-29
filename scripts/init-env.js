#!/usr/bin/env node
// Gera o arquivo .env (na raiz do projeto) na PRIMEIRA execução, com todas
// as senhas/segredos aleatórios no primeiro deploy. Se o .env já existir,
// nada é alterado — os segredos atuais são preservados.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');

if (fs.existsSync(envPath)) {
  console.log('ℹ️  .env já existe — mantendo segredos atuais.');
  process.exit(0);
}

// 16 bytes em hex = 32 caracteres (senhas)
const secret = () => crypto.randomBytes(16).toString('hex');
// 32 bytes em hex = 64 caracteres (recomendado para HMAC-SHA256 usado no JWT)
const jwtSecret = () => crypto.randomBytes(32).toString('hex');

const adminEmail = 'admin@example.com';
const adminPassword = secret();

const env = `# Gerado automaticamente em ${new Date().toISOString()}
# Segredos aleatórios gerados automaticamente. NÃO commitar este arquivo.

# --- Aplicação ---
APP_PORT=5173
NODE_ENV=production
FRONTEND_URL=http://localhost:5173

# --- Banco de Dados ---
DB_NAME=sustentabilidade_rural
DB_USER=postgres
DB_PASSWORD=${secret()}

# --- Segredos JWT (32 bytes / 64 caracteres cada) ---
JWT_SECRET=${jwtSecret()}
JWT_REFRESH_SECRET=${jwtSecret()}

# --- Usuário Admin inicial ---
ADMIN_EMAIL=${adminEmail}
ADMIN_PASSWORD=${adminPassword}
`;

fs.writeFileSync(envPath, env, { mode: 0o600 });
console.log('✅ .env criado com segredos aleatórios de 32 caracteres.');
console.log('');
console.log('🔑 Login admin inicial (anote — não será exibido novamente):');
console.log(`   E-mail: ${adminEmail}`);
console.log(`   Senha:  ${adminPassword}`);
console.log('');
