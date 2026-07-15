const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isVendedor } = require('../middleware/auth');

// Obtener datos de la tienda del vendedor
router.get('/tienda', verifyToken, isVendedor, async (req, res) => {
    try {
        const [tiendas] = await db.execute('SELECT * FROM tiendas WHERE usuario_id = ?', [req.user.id]);
        if (tiendas.length === 0) {
            return res.status(404).json({ message: 'No tienes una tienda registrada' });
        }
        res.json(tiendas[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la tienda' });
    }
});

// Obtener productos del vendedor
router.get('/productos', verifyToken, isVendedor, async (req, res) => {
    try {
        const [tiendas] = await db.execute('SELECT id FROM tiendas WHERE usuario_id = ?', [req.user.id]);
        if (tiendas.length === 0) return res.status(404).json({ message: 'Tienda no encontrada' });
        
        const tiendaId = tiendas[0].id;
        const [productos] = await db.execute('SELECT * FROM productos WHERE tienda_id = ? ORDER BY fecha_creacion DESC', [tiendaId]);
        
        // Adjuntar variantes
        for (let p of productos) {
            const [variantes] = await db.execute('SELECT * FROM variantes WHERE producto_id = ?', [p.id]);
            p.variantes = variantes;
        }

        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los productos de la tienda' });
    }
});

// Agregar nuevo producto
router.post('/productos', verifyToken, isVendedor, async (req, res) => {
    try {
        const { nombre, descripcion_corta, descripcion_detallada, precio, precio_oferta, costo, stock_disponible, stock_minimo, sku, codigo_barras, marca, modelo, color, material, garantia, estado_publicacion, destacado, imagen_url, categoria_id, condicion, peso, dimensiones, variantes } = req.body;
        
        const [tiendas] = await db.execute('SELECT id FROM tiendas WHERE usuario_id = ?', [req.user.id]);
        if (tiendas.length === 0) return res.status(404).json({ message: 'Tienda no encontrada' });
        
        const tiendaId = tiendas[0].id;

        const catId = categoria_id || 1;
        const cond = condicion || 'NUEVO';
        const estPub = estado_publicacion || 'PUBLICADO';

        const query = `
            INSERT INTO productos (
                tienda_id, categoria_id, nombre, descripcion_corta, descripcion_detallada, precio, precio_oferta, 
                costo, stock_disponible, stock_minimo, sku, codigo_barras, marca, modelo, color, material, 
                garantia, estado_publicacion, destacado, condicion, peso, dimensiones, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            tiendaId, catId, nombre, descripcion_corta || null, descripcion_detallada || null, precio, precio_oferta || null,
            costo || 0, stock_disponible || 0, stock_minimo || 0, sku || null, codigo_barras || null, marca || null, modelo || null, color || null, material || null,
            garantia || null, estPub, destacado || false, cond, peso || 0, dimensiones || null, 'ACTIVO'
        ];

        const [result] = await db.execute(query, values);
        const productoId = result.insertId;

        // Insertar imagen
        if (imagen_url) {
            await db.execute('INSERT INTO imagenes_producto (producto_id, url, es_principal) VALUES (?, ?, TRUE)', [productoId, imagen_url]);
        }
        
        // Insertar variantes
        if (variantes && variantes.length > 0) {
            for (const v of variantes) {
                await db.execute(
                    'INSERT INTO variantes (producto_id, color, talla, stock, precio_adicional) VALUES (?, ?, ?, ?, ?)',
                    [productoId, v.color || '', v.talla || '', v.stock || 0, v.precio_adicional || 0]
                );
            }
        } else {
            // Variante por defecto
            await db.execute('INSERT INTO variantes (producto_id, stock) VALUES (?, ?)', [productoId, stock || 0]);
        }

        res.status(201).json({ message: 'Producto agregado exitosamente', productoId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al agregar el producto' });
    }
});

// Obtener ventas/pedidos de la tienda
router.get('/ordenes', verifyToken, isVendedor, async (req, res) => {
    try {
        const [tiendas] = await db.execute('SELECT id FROM tiendas WHERE usuario_id = ?', [req.user.id]);
        if (tiendas.length === 0) return res.status(404).json({ message: 'Tienda no encontrada' });
        
        const tiendaId = tiendas[0].id;
        
        const [ordenes] = await db.execute('SELECT * FROM ordenes WHERE tienda_id = ? ORDER BY fecha_creacion DESC', [tiendaId]);
        res.json(ordenes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las órdenes' });
    }
});

// Actualizar el estado de una orden
router.put('/ordenes/:id/estado', verifyToken, isVendedor, async (req, res) => {
    try {
        const { estado } = req.body;
        const ordenId = req.params.id;

        const estadosPermitidos = ['PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO', 'DEVUELTO'];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({ message: 'Estado no válido' });
        }

        const [tiendas] = await db.execute('SELECT id FROM tiendas WHERE usuario_id = ?', [req.user.id]);
        if (tiendas.length === 0) return res.status(404).json({ message: 'Tienda no encontrada' });
        
        const tiendaId = tiendas[0].id;

        const [ordenes] = await db.execute('SELECT * FROM ordenes WHERE id = ? AND tienda_id = ?', [ordenId, tiendaId]);
        if (ordenes.length === 0) {
            return res.status(403).json({ message: 'No tienes permiso para modificar esta orden' });
        }

        await db.execute('UPDATE ordenes SET estado = ? WHERE id = ?', [estado, ordenId]);
        res.json({ message: 'Estado de la orden actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar la orden' });
    }
});

// Actualizar producto existente (incluye imagen)
router.put('/productos/:id', verifyToken, isVendedor, async (req, res) => {
    try {
        const { nombre, descripcion_corta, descripcion_detallada, precio, precio_oferta, costo, stock_disponible, stock_minimo, sku, codigo_barras, marca, modelo, color, material, garantia, estado_publicacion, destacado, imagen_url, categoria_id, condicion, peso, dimensiones } = req.body;
        const productoId = req.params.id;

        const [tiendas] = await db.execute('SELECT id FROM tiendas WHERE usuario_id = ?', [req.user.id]);
        if (tiendas.length === 0) return res.status(404).json({ message: 'Tienda no encontrada' });
        const tiendaId = tiendas[0].id;

        const [productos] = await db.execute('SELECT id FROM productos WHERE id = ? AND tienda_id = ?', [productoId, tiendaId]);
        if (productos.length === 0) return res.status(403).json({ message: 'No tienes permiso para editar este producto' });

        const query = `
            UPDATE productos SET 
                nombre = ?, descripcion_corta = ?, descripcion_detallada = ?, precio = ?, precio_oferta = ?, 
                costo = ?, stock_disponible = ?, stock_minimo = ?, sku = ?, codigo_barras = ?, marca = ?, 
                modelo = ?, color = ?, material = ?, garantia = ?, estado_publicacion = ?, destacado = ?, 
                condicion = ?, peso = ?, dimensiones = ?, categoria_id = ?
            WHERE id = ?
        `;
        const values = [
            nombre, descripcion_corta || null, descripcion_detallada || null, precio, precio_oferta || null,
            costo || 0, stock_disponible || 0, stock_minimo || 0, sku || null, codigo_barras || null, marca || null,
            modelo || null, color || null, material || null, garantia || null, estado_publicacion || 'PUBLICADO', destacado || false,
            condicion || 'NUEVO', peso || 0, dimensiones || null, categoria_id || 1, productoId
        ];

        await db.execute(query, values);

        await db.execute('UPDATE variantes SET stock = ? WHERE producto_id = ? LIMIT 1', [stock_disponible || 0, productoId]);

        if (imagen_url === null || imagen_url === '') {
            await db.execute('DELETE FROM imagenes_producto WHERE producto_id = ?', [productoId]);
        } else if (imagen_url) {
            const [imagenes] = await db.execute('SELECT id FROM imagenes_producto WHERE producto_id = ?', [productoId]);
            if (imagenes.length > 0) {
                await db.execute('UPDATE imagenes_producto SET url = ? WHERE producto_id = ?', [imagen_url, productoId]);
            } else {
                await db.execute('INSERT INTO imagenes_producto (producto_id, url, es_principal) VALUES (?, ?, TRUE)', [productoId, imagen_url]);
            }
        }

        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el producto' });
    }
});

/* CUPONES */
router.get('/cupones', verifyToken, isVendedor, async (req, res) => {
    try {
        const [tiendas] = await db.execute('SELECT id FROM tiendas WHERE usuario_id = ?', [req.user.id]);
        if (tiendas.length === 0) return res.status(404).json({ message: 'Tienda no encontrada' });
        
        const [cupones] = await db.execute('SELECT * FROM cupones WHERE tienda_id = ?', [tiendas[0].id]);
        res.json(cupones);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

router.post('/cupones', verifyToken, isVendedor, async (req, res) => {
    try {
        const { codigo, descuento, producto_id, vencimiento } = req.body;
        const [tiendas] = await db.execute('SELECT id FROM tiendas WHERE usuario_id = ?', [req.user.id]);
        if (tiendas.length === 0) return res.status(404).json({ message: 'Tienda no encontrada' });
        
        const pid = producto_id === 'todos' || !producto_id ? null : producto_id;

        await db.execute(
            'INSERT INTO cupones (tienda_id, codigo, descuento, producto_id, vencimiento) VALUES (?, ?, ?, ?, ?)',
            [tiendas[0].id, codigo, descuento, pid, vencimiento || null]
        );
        res.status(201).json({ message: 'Cupón creado' });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

/* REPORTES */
router.get('/reportes/ventas', verifyToken, isVendedor, async (req, res) => {
    try {
        const [tiendas] = await db.execute('SELECT id FROM tiendas WHERE usuario_id = ?', [req.user.id]);
        if (tiendas.length === 0) return res.status(404).json({ message: 'Tienda no encontrada' });
        
        // Agrupar por fecha de creación (día)
        const [datos] = await db.execute(
            "SELECT DATE(fecha_creacion) as fecha, SUM(total) as total, COUNT(*) as cantidad FROM ordenes WHERE tienda_id = ? GROUP BY DATE(fecha_creacion) ORDER BY fecha ASC",
            [tiendas[0].id]
        );
        res.json(datos);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

module.exports = router;
