const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_marketplace_key_2026';

// Registro de usuario
router.post('/registro', async (req, res) => {
    try {
        const { nombre, email, password, rol, telefono, dni } = req.body;

        // Verificar si el usuario ya existe
        const [existingUsers] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRol = rol || 'CLIENTE';

        // Guardar usuario en la BD
        const [result] = await db.execute(
            'INSERT INTO usuarios (nombre, email, password, rol, telefono, dni) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, email, hashedPassword, userRol, telefono || null, dni || null]
        );

        const newUserId = result.insertId;

        // Si es Vendedor, crearle una tienda por defecto pendiente de aprobación
        if (userRol === 'VENDEDOR') {
            await db.execute(
                'INSERT INTO tiendas (usuario_id, nombre, estado) VALUES (?, ?, ?)',
                [newUserId, `Tienda de ${nombre}`, 'PENDIENTE']
            );
        }

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al registrar' });
    }
});

// Login de Usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const [users] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        const user = users[0];

        // Verificar password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar JWT con Rol
        const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Login exitoso',
            token,
            user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al iniciar sesión' });
    }
});

module.exports = router;
