const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Crear una nueva orden (Checkout)
router.post('/', async (req, res) => {
    try {
        const { usuario_id, items, metodo_pago } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }

        // 1. Agrupar items por tienda_id
        const ordenesPorTienda = {};
        for (const item of items) {
            const tiendaId = item.tienda_id;
            if (!ordenesPorTienda[tiendaId]) {
                ordenesPorTienda[tiendaId] = { total: 0, items: [] };
            }
            ordenesPorTienda[tiendaId].items.push(item);
            ordenesPorTienda[tiendaId].total += (Number(item.precio) * Number(item.cantidad));
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const ordenesCreadas = [];

            // 2. Crear una orden por cada tienda
            for (const [tiendaId, ordenData] of Object.entries(ordenesPorTienda)) {
                
                // Insertar Orden
                const [orderResult] = await connection.execute(
                    'INSERT INTO ordenes (usuario_id, tienda_id, total, estado, metodo_pago) VALUES (?, ?, ?, ?, ?)',
                    [usuario_id, tiendaId, ordenData.total, 'PENDIENTE', metodo_pago || 'Tarjeta']
                );
                
                const nuevaOrdenId = orderResult.insertId;
                ordenesCreadas.push(nuevaOrdenId);

                // 3. Insertar Detalles de la Orden
                for (const item of ordenData.items) {
                    await connection.execute(
                        'INSERT INTO detalles_orden (orden_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                        [nuevaOrdenId, item.id, item.cantidad, item.precio]
                    );

                    // 4. Reducir stock (asumiendo variante por defecto por ahora)
                    await connection.execute(
                        'UPDATE variantes SET stock = GREATEST(0, stock - ?) WHERE producto_id = ? LIMIT 1',
                        [item.cantidad, item.id]
                    );
                }
            }

            await connection.commit();
            res.status(201).json({ message: 'Órdenes procesadas con éxito', ordenes: ordenesCreadas });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al procesar la orden' });
    }
});

// Obtener compras de un usuario (Panel de Usuario)
router.get('/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(`
            SELECT o.*, t.nombre as tienda_nombre 
            FROM ordenes o 
            JOIN tiendas t ON o.tienda_id = t.id 
            WHERE o.usuario_id = ? 
            ORDER BY o.fecha_creacion DESC
        `, [id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el historial de compras' });
    }
});

module.exports = router;
