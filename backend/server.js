require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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

// Normaliza a FRONTEND_URL: adiciona tanto a versão com porta quanto sem,
// cobrindo cenários onde um proxy reverso remove a porta (ex: :4300 → :443).
const buildAllowedOrigins = () => {
  const origins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ]);
  const raw = process.env.FRONTEND_URL;
  if (raw) {
    origins.add(raw.trim());
    try {
      // Adiciona também a versão sem porta (para proxy reverso com SSL)
      const u = new URL(raw.trim());
      u.port = '';
      origins.add(u.origin);
    } catch { /* URL inválida — ignora */ }
  }
  return origins;
};
const allowedOrigins = buildAllowedOrigins();

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    // callback(null, false) retorna 403 — NÃO throw Error, que causaria 500
    callback(null, false);
  },
}));
app.use(express.json({ limit: '1mb' }));

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
      console.log(`📊 Sistema de Sustentabilidade Rural referência metodológica regional`);
    });
  })
  .catch((err) => {
    console.error('❌ Falha ao iniciar autenticação:', err.message);
    process.exit(1);
  });
