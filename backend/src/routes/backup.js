const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/backupController');
const { requireAdmin } = require('../middleware/auth');

// authRequired já foi aplicado globalmente em app.js.
router.use(requireAdmin);

router.get('/backup', ctrl.exportar);
// Limite próprio: o app.js usa 1mb, insuficiente pra um dump completo.
router.post('/backup/restaurar', express.json({ limit: '100mb' }), ctrl.restaurar);

module.exports = router;
