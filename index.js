const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

const stockRoutes = require('./routes/stockRoutes');
const { obtenerDatosDeStock } = require('./controllers/stockController');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS para permitir solicitudes desde el frontend
app.use(cors());
app.use(express.json());

// Uso de las rutas
app.use('/api', stockRoutes);

// Servir archivos estáticos desde la carpeta build (para front-end)
app.use(express.static(path.join(__dirname, 'build')));

// Ruta para manejar cualquier ruta no definida y servir el front-end
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Programar la tarea para que se ejecute cada 60 minutos
cron.schedule('0 * * * *', () => {
  console.log('Iniciando tarea programada para actualizar datos');
  obtenerDatosDeStock('');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
