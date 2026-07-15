const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
const productosRoutes = require('./routes/productos');
const authRoutes = require('./routes/auth');
const ordenesRoutes = require('./routes/ordenes');
const vendedorRoutes = require('./routes/vendedor');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const perfilRoutes = require('./routes/perfil');
const direccionesRoutes = require('./routes/direcciones');
const pagosRoutes = require('./routes/pagos');

app.use('/api/productos', productosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/vendedor', vendedorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/direcciones', direccionesRoutes);
app.use('/api/pagos', pagosRoutes);
const soporteRoutes = require('./routes/soporte');
app.use('/api/soporte', soporteRoutes);

const favoritosRoutes = require('./routes/favoritos');
app.use('/api/favoritos', favoritosRoutes);

// Servir la carpeta de imágenes de manera estática
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'API del Marketplace en funcionamiento' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});
