const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todas las categorias
router.get('/categorias', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM categorias');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener categorias' });
    }
});

// Obtener estadisticas (productos y tiendas)
router.get('/stats', async (req, res) => {
    try {
        const [prodCount] = await db.execute("SELECT COUNT(*) as total FROM productos WHERE estado = 'ACTIVO'");
        const [tiendaCount] = await db.execute("SELECT COUNT(*) as total FROM tiendas WHERE estado = 'APROBADA'");
        res.json({
            productos: prodCount[0].total,
            marcas: tiendaCount[0].total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener estadisticas' });
    }
});

// Obtener todos los productos (con su tienda e imagen principal)
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT p.id, p.nombre, p.precio, p.precio_oferta, p.condicion, p.descripcion_detallada,
                   t.nombre as tienda, img.url as imagen_url, c.nombre as categoria 
            FROM productos p
            JOIN tiendas t ON p.tienda_id = t.id
            JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN imagenes_producto img ON p.id = img.producto_id AND img.es_principal = TRUE
            WHERE p.estado = 'ACTIVO'
        `;
        let params = [];

        if (search) {
            query += ' AND (p.nombre LIKE ? OR p.descripcion_detallada LIKE ?)';
            params = [`%${search}%`, `%${search}%`];
        }

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
});

// Obtener un producto por ID con galería y variantes
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Datos del producto y su tienda
        const [rows] = await db.execute(`
            SELECT p.*, t.nombre as tienda, t.logo_url as tienda_logo 
            FROM productos p 
            JOIN tiendas t ON p.tienda_id = t.id 
            WHERE p.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        const producto = rows[0];

        // Obtener galería de imágenes
        const [imagenes] = await db.execute('SELECT url, es_principal FROM imagenes_producto WHERE producto_id = ?', [id]);
        producto.imagenes = imagenes;
        
        // Imagen principal de fallback para la UI
        const mainImg = imagenes.find(i => i.es_principal);
        producto.imagen_url = mainImg ? mainImg.url : '📦';

        // Obtener variantes
        const [variantes] = await db.execute('SELECT * FROM variantes WHERE producto_id = ?', [id]);
        producto.variantes = variantes;
        
        // Obtener calificación promedio y cantidad
        const [ratingData] = await db.execute('SELECT AVG(calificacion) as promedio, COUNT(*) as total FROM valoraciones WHERE producto_id = ?', [id]);
        producto.rating = {
            promedio: ratingData[0].promedio ? Number(ratingData[0].promedio).toFixed(1) : 0,
            total: ratingData[0].total
        };

        // Obtener lista de reseñas
        const [valoraciones] = await db.execute(`
            SELECT v.id, v.calificacion, v.comentario, v.fecha, u.nombre as usuario 
            FROM valoraciones v
            JOIN usuarios u ON v.usuario_id = u.id
            WHERE v.producto_id = ?
            ORDER BY v.fecha DESC
        `, [id]);
        producto.valoraciones_lista = valoraciones;
        
        res.json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el producto' });
    }
});

// Agregar valoración (Requiere compra verificada)
router.post('/:id/valorar', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id, calificacion, comentario } = req.body;
        
        // 1. Validar que el usuario haya COMPRADO el producto
        const [compras] = await db.execute(`
            SELECT do.id 
            FROM detalles_orden do
            JOIN ordenes o ON do.orden_id = o.id
            WHERE o.usuario_id = ? AND do.producto_id = ? AND o.estado != 'PENDIENTE'
            LIMIT 1
        `, [usuario_id, id]);
        
        if (compras.length === 0) {
            return res.status(403).json({ message: 'Solo puedes valorar productos que hayas comprado previamente (Compra Verificada).' });
        }
        
        // 2. Insertar valoración
        await db.execute(
            'INSERT INTO valoraciones (usuario_id, producto_id, calificacion, comentario) VALUES (?, ?, ?, ?)',
            [usuario_id, id, calificacion, comentario]
        );
        
        res.status(201).json({ message: 'Valoración publicada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al publicar valoración' });
    }
});

module.exports = router;
