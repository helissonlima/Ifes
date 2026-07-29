require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { authRequired } = require('./middleware/auth');

const propriedadesRoutes = require('./routes/propriedades');
const avaliacoesRoutes = require('./routes/avaliacoes');
const indicadoresRoutes = require('./routes/indicadores');
const authRoutes = require('./routes/auth');
const producaoRoutes = require('./routes/producao');
const graosRoutes = require('./routes/graos');
const backupRoutes = require('./routes/backup');

const app = express();

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
    // Sem header Origin (!origin): requests same-origin, curl/Postman, apps
    // mobile e o healthcheck do docker-compose (node http.get interno ao
    // container) nunca enviam Origin — CORS é uma política de navegador, não
    // se aplica a esses casos, então aceitar aqui não abre brecha nova. Só
    // requests de NAVEGADOR chegam com Origin setado, e essas continuam
    // restritas à allowlist abaixo.
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    // callback(null, false) retorna 403 — NÃO throw Error, que causaria 500
    callback(null, false);
  },
}));
// Parser global com limite apertado; a restauração de backup é a única rota
// que legitimamente recebe um payload grande e traz o próprio parser (ver
// routes/backup.js), então fica de fora daqui.
const jsonPadrao = express.json({ limit: '1mb' });
app.use((req, res, next) => {
  if (req.path === '/api/admin/backup/restaurar') return next();
  return jsonPadrao(req, res, next);
});

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Tudo abaixo exige autenticação (M10.6): /graos não tem mais rotas GET
// públicas — só é consumido por telas já autenticadas do app, e deixar
// essas 3 rotas sem authRequired era a única inconsistência real na
// exposição da API (as demais já exigiam auth, com ou sem permissão extra).
app.use(authRequired);
app.use('/api/graos', graosRoutes);
app.use('/api/propriedades', propriedadesRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes);
app.use('/api/indicadores', indicadoresRoutes);
app.use('/api/producao', producaoRoutes);
app.use('/api/admin', backupRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

module.exports = app;
