const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isVendedor } = require('../middleware/auth');

// Cliente: Obtener sus reclamos
router.get('/cliente', verifyToken, async (req, res) => {
    try {
        const [reclamos] = await db.execute(
            `SELECT r.*, t.nombre as tienda_nombre 
             FROM reclamos r 
             JOIN tiendas t ON r.tienda_id = t.id 
             WHERE r.usuario_id = ? ORDER BY r.fecha_creacion DESC`,
            [req.user.id]
        );
        res.json(reclamos);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

// Cliente: Crear reclamo
router.post('/cliente', verifyToken, async (req, res) => {
    try {
        const { tienda_id, orden_id, asunto, mensaje } = req.body;
        await db.execute(
            'INSERT INTO reclamos (usuario_id, tienda_id, orden_id, asunto, mensaje) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, tienda_id, orden_id || null, asunto, mensaje]
        );
        res.status(201).json({ message: 'Reclamo enviado' });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

// Vendedor: Obtener reclamos de su tienda
router.get('/vendedor', verifyToken, isVendedor, async (req, res) => {
    try {
        const [tiendas] = await db.execute('SELECT id FROM tiendas WHERE usuario_id = ?', [req.user.id]);
        if (tiendas.length === 0) return res.status(404).json({ message: 'Tienda no encontrada' });
        
        const [reclamos] = await db.execute(
            `SELECT r.*, u.nombre as cliente_nombre, u.email as cliente_email 
             FROM reclamos r 
             JOIN usuarios u ON r.usuario_id = u.id 
             WHERE r.tienda_id = ? ORDER BY r.fecha_creacion DESC`,
            [tiendas[0].id]
        );
        res.json(reclamos);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

// Vendedor: Resolver reclamo
router.put('/vendedor/:id/resolver', verifyToken, isVendedor, async (req, res) => {
    try {
        const [tiendas] = await db.execute('SELECT id FROM tiendas WHERE usuario_id = ?', [req.user.id]);
        if (tiendas.length === 0) return res.status(404).json({ message: 'Tienda no encontrada' });

        const [reclamo] = await db.execute('SELECT id FROM reclamos WHERE id = ? AND tienda_id = ?', [req.params.id, tiendas[0].id]);
        if (reclamo.length === 0) return res.status(403).json({ message: 'Reclamo no pertenece a tu tienda' });

        await db.execute('UPDATE reclamos SET estado = "RESUELTO" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Reclamo marcado como resuelto' });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

module.exports = router;
