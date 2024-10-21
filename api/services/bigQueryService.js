const { BigQuery } = require('@google-cloud/bigquery');

// Configuración del cliente de BigQuery
const bigQueryClient = new BigQuery({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
    },
    location: 'US'
  });
  
  console.log('clave privada después de reemplazar saltos de línea:', process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));

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

module.exports = { obtenerDatosDeStock };
