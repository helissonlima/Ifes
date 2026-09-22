const { Pool, types } = require('pg');
require('dotenv').config();

// Colunas DATE (OID 1082) chegam como string 'YYYY-MM-DD' em vez de Date.
// O default do driver monta um Date na meia-noite do fuso do SERVIDOR; como
// o container roda em UTC e o usuário está em UTC-3, a data serializada
// ("2026-07-01T00:00:00.000Z") era exibida no navegador como 30/06.
// Data de avaliação é dia civil, não instante: trafega como texto.
types.setTypeParser(1082, (valor) => valor);
const { readSecret } = require('./secrets');

const password = readSecret('DB_PASSWORD', '');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'sustentabilidade_rural',
  user: process.env.DB_USER || 'postgres',
  password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexões:', err);
});

module.exports = pool;
