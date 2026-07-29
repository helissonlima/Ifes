const express = require('express');
const { getMediaProducao } = require('../controllers/producaoController');
const { validateQuery } = require('../middleware/validate');
const { producaoQuerySchema } = require('../validation/schemas');

const router = express.Router();

// GET /api/producao/media?municipio=NAME&estado=UF
router.get('/media', validateQuery(producaoQuerySchema), getMediaProducao);

module.exports = router;
