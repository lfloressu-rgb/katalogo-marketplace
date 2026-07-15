const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todos los métodos de pago de un usuario
router.get('/usuario/:id', async (req, res) => {
    try {
        const [pagos] = await db.execute('SELECT * FROM metodos_pago WHERE usuario_id = ?', [req.params.id]);
        res.json(pagos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener métodos de pago' });
    }
});

// Agregar método de pago
router.post('/', async (req, res) => {
    try {
        const { usuario_id, numero_tarjeta, titular, fecha_expiracion, cvv, tipo } = req.body;
        
        // Enmascarar tarjeta (guardar solo los últimos 4 dígitos visualmente si se desea, pero aquí lo guardaremos normal como demo, en prod se usaría tokenización)
        // Para este proyecto guardaremos la tarjeta completa
        const [result] = await db.execute(
            'INSERT INTO metodos_pago (usuario_id, numero_tarjeta, titular, fecha_expiracion, cvv, tipo) VALUES (?, ?, ?, ?, ?, ?)',
            [usuario_id, numero_tarjeta, titular, fecha_expiracion, cvv, tipo || 'VISA']
        );
        
        res.status(201).json({ message: 'Método de pago agregado', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al agregar método de pago' });
    }
});

// Eliminar método de pago
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM metodos_pago WHERE id = ?', [req.params.id]);
        res.json({ message: 'Método de pago eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar método de pago' });
    }
});

module.exports = router;
