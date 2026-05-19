const express = require('express');
const GraosController = require('../controllers/graosController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Rotas admin (mais específicas, colocadas antes de rotas genéricas)
router.get('/admin/todos', authRequired, (req, res, next) => GraosController.listarTodos(req, res));
router.post('/admin/criar', authRequired, (req, res, next) => GraosController.criar(req, res));
router.put('/admin/:id/atualizar', authRequired, (req, res, next) => GraosController.atualizar(req, res));
router.delete('/admin/:id/deletar', authRequired, (req, res, next) => GraosController.deletar(req, res));

// Rotas públicas
router.get('/', (req, res, next) => GraosController.listar(req, res));
router.get('/:id', (req, res, next) => GraosController.obter(req, res));
router.get('/propriedade/:propriedadeId', (req, res, next) => GraosController.listarPorPropriedade(req, res));

// Rotas protegidas (requerem autenticação)
router.post('/propriedade/:propriedadeId/adicionar', authRequired, (req, res, next) => GraosController.adicionarAPropriedade(req, res));
router.delete('/propriedade/:propriedadeId/:graoId', authRequired, (req, res, next) => GraosController.removerDePropriedade(req, res));

module.exports = router;
