const express = require('express');
const { getStockData } = require('../controllers/stockController'); // Importa el controlador

const router = express.Router();

// Endpoint para obtener datos específicos de stock
router.get('/stock', getStockData); // Usa el controlador directamente

module.exports = router;
