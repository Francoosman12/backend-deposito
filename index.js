const express = require('express');
const path = require('path');
const { BigQuery } = require('@google-cloud/bigquery');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS para permitir solicitudes desde el frontend
app.use(cors());

// Configuración del cliente de BigQuery
const bigQueryClient = new BigQuery({
    projectId: 'sigma-410715',
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    location: 'US'
  });

// Variable para almacenar datos en memoria
let stockData = [];

// Función para obtener datos específicos de BigQuery
async function obtenerDatosDeStock(limit, offset, query) {
  const queryString = `
    SELECT 
      ARTICULO_CODIGO, 
      ARTICULO_NOMBRE, 
      ARTICULO_EANUNI, 
      ARTICULO_PROVEEDOR, 
      ARTICULO_RUBRO, 
      DEPOSITO, 
      ARTICULO_STOCK
    FROM \`sigma-410715.sigmarepo.bq_stocks\`
    WHERE ARTICULO_CODIGO LIKE @query OR ARTICULO_NOMBRE LIKE @query OR ARTICULO_EANUNI LIKE @query
    LIMIT @limit OFFSET @offset
  `;
  const options = {
    query: queryString,
    params: {
      query: `%${query}%`,
      limit: limit,
      offset: offset
    },
    location: 'US'
  };

  try {
    const [rows] = await bigQueryClient.query(options);
    return rows;
  } catch (error) {
    console.error('Error en la consulta a BigQuery:', error.message);
    throw error;
  }
}

// Función para actualizar los datos de la base de datos
async function actualizarDatos() {
  try {
    const limit = 1000; 
    const offset = 0;
    stockData = await obtenerDatosDeStock(limit, offset, '');
    console.log('Datos actualizados:', stockData.length, 'registros obtenidos');
  } catch (error) {
    console.error('Error al actualizar datos de BigQuery:', error.message);
  }
}

// Programar la tarea para que se ejecute cada 60 minutos
cron.schedule('0 * * * *', () => {
  console.log('Iniciando tarea programada para actualizar datos');
  actualizarDatos();
});

// Inicialmente cargar los datos al iniciar el servidor
actualizarDatos();

// Endpoint para obtener datos específicos de stock
app.get('/api/stock', async (req, res) => {
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
});

// Servir archivos estáticos desde la carpeta build (para front-end)
app.use(express.static(path.join(__dirname, 'build')));

// Ruta para manejar cualquier ruta no definida y servir el front-end
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
