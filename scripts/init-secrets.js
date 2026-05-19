const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const secretsDir = process.env.SECRETS_DIR || '/run/secrets';

function ensureSecret(fileName) {
  const filePath = path.join(secretsDir, fileName);

  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf8').trim();
    if (existing.length > 0) {
      return existing;
    }
  }

  const value = crypto.randomBytes(16).toString('hex');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${value}\n`, { mode: 0o600 });
  return value;
}

ensureSecret('db_password');
ensureSecret('jwt_secret');
ensureSecret('jwt_refresh_secret');

console.log(`Segredos inicializados em ${secretsDir}.`);