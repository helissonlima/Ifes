const fs = require('fs');
const path = require('path');
const pool = require('../src/config/database');

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('Executando migrações...');
    const sqlFile = path.join(__dirname, '001_initial.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    await client.query(sql);
    console.log('✅ Migrações executadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao executar migrações:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
