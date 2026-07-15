const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('El archivo debe ser una imagen'), false);
        }
    }
});

router.post('/', verifyToken, upload.single('imagen'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ninguna imagen' });
        }
        
        // Devolvemos la ruta relativa de la imagen
        const imagenUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        res.json({ message: 'Imagen subida exitosamente', url: imagenUrl });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({ message: 'Error interno al subir la imagen' });
    }
});

module.exports = router;
