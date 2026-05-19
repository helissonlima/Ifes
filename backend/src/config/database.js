const { Pool } = require('pg');
require('dotenv').config();
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
