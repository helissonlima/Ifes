const express = require('express');
const { getMediaProducao } = require('../controllers/producaoController');

const router = express.Router();

// GET /api/producao/media?municipio=NAME&estado=UF
router.get('/media', getMediaProducao);

module.exports = router;
