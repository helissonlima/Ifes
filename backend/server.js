const app = require('./src/app');
const { runMigrations } = require('./src/config/migrations');
const { bootstrapAuth } = require('./src/config/authBootstrap');

const PORT = process.env.PORT || 3001;

runMigrations()
  .then(() => bootstrapAuth())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 API rodando em http://localhost:${PORT}`);
      console.log(`📊 Sistema de Sustentabilidade Rural referência metodológica regional`);
    });
  })
  .catch((err) => {
    console.error('❌ Falha ao iniciar autenticação:', err.message);
    process.exit(1);
  });
