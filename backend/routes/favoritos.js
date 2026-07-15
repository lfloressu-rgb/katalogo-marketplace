const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener los favoritos de un usuario
router.get('/usuario/:id', async (req, res) => {
    try {
        const query = `
            SELECT f.id as favorito_id, f.producto_id, f.fecha_creacion,
                   p.nombre, p.precio, p.precio_oferta, p.condicion,
                   img.url as imagen_url, t.nombre as tienda
            FROM favoritos f
            JOIN productos p ON f.producto_id = p.id
            JOIN tiendas t ON p.tienda_id = t.id
            LEFT JOIN imagenes_producto img ON p.id = img.producto_id AND img.es_principal = TRUE
            WHERE f.usuario_id = ?
            ORDER BY f.fecha_creacion DESC
        `;
        const [rows] = await db.execute(query, [req.params.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener favoritos' });
    }
});

// Agregar a favoritos
router.post('/', async (req, res) => {
    try {
        const { usuario_id, producto_id } = req.body;
        
        // Verificar si ya existe para evitar duplicados en UI (aunque DB tiene UNIQUE key)
        const [existente] = await db.execute('SELECT id FROM favoritos WHERE usuario_id = ? AND producto_id = ?', [usuario_id, producto_id]);
        if (existente.length > 0) {
            return res.json({ message: 'Ya está en favoritos', id: existente[0].id });
        }

        const [result] = await db.execute(
            'INSERT INTO favoritos (usuario_id, producto_id) VALUES (?, ?)',
            [usuario_id, producto_id]
        );
        
        res.status(201).json({ message: 'Agregado a favoritos', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al agregar a favoritos' });
    }
});

// Eliminar de favoritos (pasando el producto_id y usuario_id)
router.delete('/', async (req, res) => {
    try {
        const { usuario_id, producto_id } = req.body;
        await db.execute('DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?', [usuario_id, producto_id]);
        res.json({ message: 'Eliminado de favoritos' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar de favoritos' });
    }
});

module.exports = router;
