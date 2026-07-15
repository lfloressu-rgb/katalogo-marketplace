const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Obtener métricas globales del Dashboard
router.get('/metricas', verifyToken, isAdmin, async (req, res) => {
    try {
        const [usuarios] = await db.execute('SELECT COUNT(*) as total FROM usuarios');
        const [tiendas] = await db.execute('SELECT COUNT(*) as total FROM tiendas');
        const [productos] = await db.execute('SELECT COUNT(*) as total FROM productos');
        const [ventas] = await db.execute('SELECT SUM(total) as ingresos, COUNT(*) as ordenes FROM ordenes');

        res.json({
            usuarios: usuarios[0].total,
            tiendas: tiendas[0].total,
            productos: productos[0].total,
            ingresosTotales: ventas[0].ingresos || 0,
            ordenesTotales: ventas[0].ordenes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener métricas' });
    }
});

// Obtener lista de tiendas para aprobar/rechazar
router.get('/tiendas', verifyToken, isAdmin, async (req, res) => {
    try {
        const [tiendas] = await db.execute(`
            SELECT t.*, u.nombre as dueno, u.email 
            FROM tiendas t 
            JOIN usuarios u ON t.usuario_id = u.id 
            ORDER BY t.fecha_creacion DESC
        `);
        res.json(tiendas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener tiendas' });
    }
});

// Obtener lista de usuarios recientes
router.get('/usuarios', verifyToken, isAdmin, async (req, res) => {
    try {
        const [usuarios] = await db.execute('SELECT id, nombre, email, rol, activo, fecha_registro FROM usuarios ORDER BY fecha_registro DESC LIMIT 20');
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});

// Aprobar tienda
router.put('/tiendas/:id/aprobar', verifyToken, isAdmin, async (req, res) => {
    try {
        await db.execute('UPDATE tiendas SET estado = ? WHERE id = ?', ['APROBADA', req.params.id]);
        res.json({ message: 'Tienda aprobada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al aprobar tienda' });
    }
});
// Rechazar tienda
router.put('/tiendas/:id/rechazar', verifyToken, isAdmin, async (req, res) => {
    try {
        await db.execute('UPDATE tiendas SET estado = ? WHERE id = ?', ['RECHAZADA', req.params.id]);
        res.json({ message: 'Tienda rechazada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al rechazar tienda' });
    }
});

// Obtener todas las categorías
router.get('/categorias', verifyToken, isAdmin, async (req, res) => {
    try {
        const [categorias] = await db.execute('SELECT * FROM categorias ORDER BY fecha_creacion DESC');
        res.json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener categorias' });
    }
});

// Crear una nueva categoría
router.post('/categorias', verifyToken, isAdmin, async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) return res.status(400).json({ message: 'El nombre es requerido' });
        
        await db.execute('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
        res.status(201).json({ message: 'Categoría creada exitosamente' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'La categoría ya existe' });
        }
        res.status(500).json({ message: 'Error al crear categoria' });
    }
});

// Obtener configuración global
router.get('/config', verifyToken, isAdmin, async (req, res) => {
    try {
        const [config] = await db.execute('SELECT * FROM configuracion LIMIT 1');
        res.json(config[0] || { comision_plataforma: 5.00 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener configuración' });
    }
});

// Actualizar configuración global
router.put('/config', verifyToken, isAdmin, async (req, res) => {
    try {
        const { comision_plataforma } = req.body;
        if (comision_plataforma === undefined) return res.status(400).json({ message: 'Faltan parámetros' });
        await db.execute('UPDATE configuracion SET comision_plataforma = ? WHERE id = 1', [comision_plataforma]);
        res.json({ message: 'Configuración actualizada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar configuración' });
    }
});

// Obtener datos financieros detallados con rangos
router.get('/finanzas', verifyToken, isAdmin, async (req, res) => {
    try {
        const rango = req.query.rango || 'siempre'; // hoy, semana, mes, siempre
        let dateCondition = '';
        if (rango === 'hoy') dateCondition = 'WHERE DATE(fecha_creacion) = CURDATE()';
        else if (rango === 'semana') dateCondition = 'WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        else if (rango === 'mes') dateCondition = 'WHERE MONTH(fecha_creacion) = MONTH(CURDATE()) AND YEAR(fecha_creacion) = YEAR(CURDATE())';

        // 1. Obtener comisión actual
        const [config] = await db.execute('SELECT comision_plataforma FROM configuracion LIMIT 1');
        const porcentajeComision = config.length > 0 ? Number(config[0].comision_plataforma) : 5;

        // 2. Obtener volumen bruto global (según rango)
        const [ventas] = await db.execute(`SELECT SUM(total) as volumen_bruto FROM ordenes ${dateCondition}`);
        const volumenBruto = ventas[0].volumen_bruto || 0;
        const ingresosKatalogo = (volumenBruto * porcentajeComision) / 100;

        // 3. Obtener pagos pendientes
        const [pendientes] = await db.execute(`SELECT SUM(total) as total_pendiente FROM ordenes WHERE estado_liquidacion = 'PENDIENTE' ${dateCondition ? dateCondition.replace('WHERE', 'AND') : ''}`);
        const totalPendienteBruto = pendientes[0].total_pendiente || 0;
        const pagosPendientesTiendas = totalPendienteBruto - ((totalPendienteBruto * porcentajeComision) / 100);

        // 4. Datos para la gráfica
        const [grafica] = await db.execute(`
            SELECT DATE(fecha_creacion) as fecha, SUM(total) as volumen
            FROM ordenes
            ${dateCondition}
            GROUP BY DATE(fecha_creacion)
            ORDER BY fecha ASC
        `);
        
        const historico = grafica.map(g => {
            const fechaVal = g.fecha;
            const formattedDate = fechaVal ? new Date(fechaVal).toISOString().split('T')[0] : 'Desconocida';
            return {
                fecha: formattedDate,
                volumen: Number(g.volumen),
                ganancia: (Number(g.volumen) * porcentajeComision) / 100
            };
        });

        res.json({
            volumenBruto,
            porcentajeComision,
            ingresosKatalogo,
            pagosPendientesTiendas,
            historico
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener finanzas' });
    }
});

// Obtener todas las órdenes globales (para Gestión de Pedidos)
router.get('/ordenes', verifyToken, isAdmin, async (req, res) => {
    try {
        const [ordenes] = await db.execute(`
            SELECT o.*, u.nombre as cliente_nombre, t.nombre as tienda_nombre 
            FROM ordenes o 
            JOIN usuarios u ON o.usuario_id = u.id 
            JOIN tiendas t ON o.tienda_id = t.id 
            ORDER BY o.fecha_creacion DESC
        `);
        res.json(ordenes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las órdenes globales' });
    }
});

// Obtener liquidaciones pendientes por tienda
router.get('/liquidaciones', verifyToken, isAdmin, async (req, res) => {
    try {
        const [config] = await db.execute('SELECT comision_plataforma FROM configuracion LIMIT 1');
        const comision = config.length > 0 ? Number(config[0].comision_plataforma) : 5;

        const [liquidaciones] = await db.execute(`
            SELECT t.id as tienda_id, t.nombre as tienda_nombre, 
                   COUNT(o.id) as cantidad_ordenes, 
                   SUM(o.total) as volumen_total
            FROM ordenes o
            JOIN tiendas t ON o.tienda_id = t.id
            WHERE o.estado_liquidacion = 'PENDIENTE'
            GROUP BY t.id
        `);

        const resultado = liquidaciones.map(l => {
            const comisionMonto = (l.volumen_total * comision) / 100;
            return {
                tienda_id: l.tienda_id,
                tienda_nombre: l.tienda_nombre,
                cantidad_ordenes: l.cantidad_ordenes,
                volumen_total: Number(l.volumen_total),
                comision: comisionMonto,
                a_pagar: Number(l.volumen_total) - comisionMonto
            };
        });

        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener liquidaciones' });
    }
});

// Pagar liquidación a una tienda
router.put('/liquidaciones/:tiendaId/pagar', verifyToken, isAdmin, async (req, res) => {
    try {
        const tiendaId = req.params.tiendaId;
        await db.execute("UPDATE ordenes SET estado_liquidacion = 'PAGADO' WHERE tienda_id = ? AND estado_liquidacion = 'PENDIENTE'", [tiendaId]);
        res.json({ message: 'Liquidación registrada como pagada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al pagar liquidación' });
    }
});

module.exports = router;
