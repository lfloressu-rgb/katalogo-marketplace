const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todas las direcciones de un usuario
router.get('/usuario/:id', async (req, res) => {
    try {
        const [direcciones] = await db.execute('SELECT * FROM direcciones WHERE usuario_id = ?', [req.params.id]);
        res.json(direcciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener direcciones' });
    }
});

// Agregar nueva dirección
router.post('/', async (req, res) => {
    try {
        const { usuario_id, direccion, distrito, provincia, departamento, es_principal } = req.body;
        
        if (es_principal) {
            // Desmarcar otras principales
            await db.execute('UPDATE direcciones SET es_principal = FALSE WHERE usuario_id = ?', [usuario_id]);
        }
        
        const [result] = await db.execute(
            'INSERT INTO direcciones (usuario_id, direccion, distrito, provincia, departamento, es_principal) VALUES (?, ?, ?, ?, ?, ?)',
            [usuario_id, direccion, distrito, provincia, departamento, es_principal ? true : false]
        );
        
        res.status(201).json({ message: 'Dirección agregada', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al agregar dirección' });
    }
});

// Eliminar dirección
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM direcciones WHERE id = ?', [req.params.id]);
        res.json({ message: 'Dirección eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar dirección' });
    }
});

// Actualizar dirección
router.put('/:id', async (req, res) => {
    try {
        const { direccion, distrito, provincia, departamento, es_principal, usuario_id } = req.body;
        
        if (es_principal) {
            await db.execute('UPDATE direcciones SET es_principal = FALSE WHERE usuario_id = ? AND id != ?', [usuario_id, req.params.id]);
        }
        
        await db.execute(
            'UPDATE direcciones SET direccion = ?, distrito = ?, provincia = ?, departamento = ?, es_principal = ? WHERE id = ?',
            [direccion, distrito, provincia, departamento, es_principal ? true : false, req.params.id]
        );
        
        res.json({ message: 'Dirección actualizada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar dirección' });
    }
});

module.exports = router;
