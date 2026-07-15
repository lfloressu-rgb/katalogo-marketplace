const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_marketplace_key_2026';

// Middleware genérico para verificar si está logueado
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Se requiere un token de acceso' });

    try {
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET); // asume "Bearer <token>"
        req.user = decoded; // { id, email, rol }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

// Middleware para verificar si es Vendedor o Admin
const isVendedor = (req, res, next) => {
    if (req.user && (req.user.rol === 'VENDEDOR' || req.user.rol === 'ADMIN')) {
        next();
    } else {
        return res.status(403).json({ message: 'Acceso denegado. Requiere permisos de vendedor.' });
    }
};

// Middleware para verificar si es Admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ message: 'Acceso denegado. Requiere permisos de administrador.' });
    }
};

module.exports = { verifyToken, isVendedor, isAdmin };
