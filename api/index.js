const express = require('express');
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();
const stockRoutes = require('./routes/stock');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS para permitir solicitudes desde el frontend
app.use(cors());

// Rutas de la API
app.use('/api', stockRoutes);

// Programar la tarea para que se ejecute cada 60 minutos
cron.schedule('0 * * * *', () => {
  console.log('Iniciando tarea programada para actualizar datos');
  // Aquí podrías llamar a actualizarDatos() si está en un servicio
});

// Inicialmente cargar los datos al iniciar el servidor
// actualizarDatos(); // Descomenta esto si tienes esa función definida

// Servir archivos estáticos desde la carpeta build (para front-end)
app.use(express.static(path.join(__dirname, 'build')));

// Ruta para manejar cualquier ruta no definida y servir el front-end
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
