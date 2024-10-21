const { obtenerDatosDeStock } = require('../services/bigQueryService');

// Controlador para obtener los datos de stock
const getStockData = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const query = req.query.query || '';

  try {
    const data = await obtenerDatosDeStock(limit, offset, query);

    // Filtrar resultados únicos por ARTICULO_CODIGO
    const uniqueData = Array.from(new Set(data.map(item => item.ARTICULO_CODIGO.trim())))
                            .map(codigo => data.find(item => item.ARTICULO_CODIGO.trim() === codigo));

    if (uniqueData.length === 0) {
      return res.status(404).json({ error: 'No se encontraron productos' });
    }

    res.json(uniqueData);
  } catch (error) {
    console.error('Error al obtener los datos:', error.message);
    res.status(500).json({ error: 'Error al obtener los datos: ' + error.message });
  }
};

module.exports = {
  getStockData
};
