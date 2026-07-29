const express = require('express');
const GraosController = require('../controllers/graosController');
const { requireAdmin } = require('../middleware/auth');

// authRequired já é aplicado globalmente antes deste router (ver app.js) —
// aqui só falta marcar o que é admin-only.
const router = express.Router();

// Rotas admin (mais específicas, colocadas antes de rotas genéricas)
router.get('/admin/todos', requireAdmin, (req, res, next) => GraosController.listarTodos(req, res));
router.post('/admin/criar', requireAdmin, (req, res, next) => GraosController.criar(req, res));
router.post('/admin/sincronizar-ibge', requireAdmin, (req, res, next) => GraosController.sincronizarIBGE(req, res));
router.put('/admin/:id/atualizar', requireAdmin, (req, res, next) => GraosController.atualizar(req, res));
router.delete('/admin/:id/deletar', requireAdmin, (req, res, next) => GraosController.deletar(req, res));

router.get('/', (req, res, next) => GraosController.listar(req, res));
router.get('/:id', (req, res, next) => GraosController.obter(req, res));
router.get('/propriedade/:propriedadeId', (req, res, next) => GraosController.listarPorPropriedade(req, res));
router.post('/propriedade/:propriedadeId/adicionar', (req, res, next) => GraosController.adicionarAPropriedade(req, res));
router.delete('/propriedade/:propriedadeId/:graoId', (req, res, next) => GraosController.removerDePropriedade(req, res));

module.exports = router;
