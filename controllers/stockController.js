// controllers/stockController.js
const { BigQuery } = require('@google-cloud/bigquery');
require('dotenv').config();

const formattedPrivateKey = process.env.PRIVATE_KEY.split(String.raw`\n`).join('\n');

const bigQueryClient = new BigQuery({
  projectId: process.env.PROJECT_ID,
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: formattedPrivateKey,
  },
  location: 'US',
});

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
    console.log('Consultando BigQuery con opciones:', options);
    const [rows] = await bigQueryClient.query(options);
    console.log('Datos obtenidos de BigQuery:', rows);
    return rows;
  } catch (error) {
    console.error('Error en la consulta a BigQuery:', error.message);
    throw error;
  }
}

module.exports = { obtenerDatosDeStock };
