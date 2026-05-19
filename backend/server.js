require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { runMigrations } = require('./src/config/migrations');
const { bootstrapAuth } = require('./src/config/authBootstrap');
const { authRequired } = require('./src/middleware/auth');

const propriedadesRoutes = require('./src/routes/propriedades');
const avaliacoesRoutes = require('./src/routes/avaliacoes');
const indicadoresRoutes = require('./src/routes/indicadores');
const authRoutes = require('./src/routes/auth');
const producaoRoutes = require('./src/routes/producao');
const graosRoutes = require('./src/routes/graos');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/graos', graosRoutes); // Rotas de grãos (parcialmente públicas, parcialmente autenticadas)

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use(authRequired);
app.use('/api/propriedades', propriedadesRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes);
app.use('/api/indicadores', indicadoresRoutes);
app.use('/api/producao', producaoRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

runMigrations()
  .then(() => bootstrapAuth())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 API rodando em http://localhost:${PORT}`);
      console.log(`📊 Sistema de Sustentabilidade Rural ISA-EPAMIG/INCAPER`);
    });
  })
  .catch((err) => {
    console.error('❌ Falha ao iniciar autenticação:', err.message);
    process.exit(1);
  });
