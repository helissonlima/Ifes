const fs = require('fs');

function resolveSecret(name) {
  const filePath = process.env[`${name}_FILE`];

  if (filePath) {
    try {
      const value = fs.readFileSync(filePath, 'utf8').trim();
      if (value) {
        return value;
      }
    } catch (err) {
      console.warn(`Não foi possível ler ${name}_FILE em ${filePath}: ${err.message}`);
    }
  }

  const directValue = process.env[name];
  if (directValue && directValue.trim()) {
    return directValue.trim();
  }

  return null;
}

function readSecret(name, fallback = '') {
  return resolveSecret(name) ?? fallback;
}

function abortarSemSegredo(name) {
  console.error(
    `❌ ${name} não foi definido. Configure a variável de ambiente ${name} (ou ${name}_FILE) antes de iniciar em produção.`
  );
  process.exit(1);
}

// Como readSecret, mas em NODE_ENV=production aborta o processo se o valor
// não estiver configurado, em vez de seguir silenciosamente com o fallback.
function requireSecret(name, fallback = '') {
  const resolved = resolveSecret(name);
  if (resolved) return resolved;
  if (process.env.NODE_ENV === 'production') abortarSemSegredo(name);
  return fallback;
}

// Mesma ideia de requireSecret, mas para variáveis simples (sem suporte a _FILE).
function requireEnv(name, fallback = '') {
  const value = process.env[name] && process.env[name].trim();
  if (value) return value;
  if (process.env.NODE_ENV === 'production') abortarSemSegredo(name);
  return fallback;
}

module.exports = { readSecret, requireSecret, requireEnv };
