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

// Ruta al archivo de credenciales
const keyFilePath = path.join(__dirname, 'config', 'google-credentials.json');

// Configuración del cliente de BigQuery
const bigQueryClient = new BigQuery({
  keyFilename: keyFilePath,
  projectId: 'sigma-410715',
  location: 'US'
});

// Variable para almacenar datos en memoria
let stockData = [];

// Función para obtener datos específicos de BigQuery
async function obtenerDatosDeStock(query) {
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
  `;
  const options = {
    query: queryString,
    params: {
      query: `%${query}%`
    },
    location: 'US'
  };

  try {
    console.log('Consultando BigQuery con opciones:', options); // Log para depuración
    const [rows] = await bigQueryClient.query(options);
    console.log('Datos obtenidos de BigQuery:', rows); // Log para depuración
    return rows;
  } catch (error) {
    console.error('Error en la consulta a BigQuery:', error.message);
    throw error;
  }
}

// Función para actualizar los datos de la base de datos
async function actualizarDatos() {
  try {
    stockData = await obtenerDatosDeStock('');
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
  const query = req.query.query || '';

  try {
    const data = await obtenerDatosDeStock(query);

    // Mostrar datos para depuración
    console.log('Datos recibidos para enviar:', data);

    if (data.length === 0) {
      return res.status(404).json({ error: 'No se encontraron productos' });
    }

    res.json(data);
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
