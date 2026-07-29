#!/usr/bin/env node
require('dotenv').config();
const { runMigrations } = require('../src/config/migrations');

runMigrations()
  .then(() => {
    console.log('✅ Migrações aplicadas.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Falha ao aplicar migrações:', err.message);
    process.exit(1);
  });
