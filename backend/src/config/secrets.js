const fs = require('fs');

function readSecret(name, fallback = '') {
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

  return fallback;
}

module.exports = { readSecret };