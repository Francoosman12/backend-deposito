// routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerDatosDeStock } = require('../controllers/stockController');

// Ruta para obtener datos de stock
router.get('/stock', async (req, res) => {
  try {
    const query = req.query.q || ''; // Obtiene el parámetro de consulta
    const datos = await obtenerDatosDeStock(query);
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos de stock' });
  }
});

module.exports = router;
