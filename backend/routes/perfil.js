const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener perfil (por si se necesita recargar)
router.get('/:id', async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, nombre, email, rol, telefono, dni, fecha_nacimiento, foto_perfil FROM usuarios WHERE id = ?', [req.params.id]);
        if (users.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
});

// Actualizar datos del perfil
router.put('/:id', async (req, res) => {
    try {
        const { nombre, telefono, dni, fecha_nacimiento, foto_perfil } = req.body;
        
        let query = 'UPDATE usuarios SET nombre = ?';
        let params = [nombre];
        
        if (telefono !== undefined) { query += ', telefono = ?'; params.push(telefono); }
        if (dni !== undefined) { query += ', dni = ?'; params.push(dni); }
        if (fecha_nacimiento !== undefined) { query += ', fecha_nacimiento = ?'; params.push(fecha_nacimiento); }
        if (foto_perfil !== undefined) { query += ', foto_perfil = ?'; params.push(foto_perfil); }
        
        query += ' WHERE id = ?';
        params.push(req.params.id);
        
        await db.execute(query, params);
        
        res.json({ message: 'Perfil actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar perfil' });
    }
});

module.exports = router;
