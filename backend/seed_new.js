const db = require('./config/db');

async function seedData() {
    try {
        console.log("Iniciando inserción de datos...");

        // 1. Insertar usuario admin/vendedor si no existe
        const [users] = await db.execute("SELECT id FROM usuarios WHERE email = 'admin@katalogo.com'");
        let userId;
        if (users.length === 0) {
            const [result] = await db.execute(
                "INSERT INTO usuarios (nombre, email, password, rol) VALUES ('Admin Katalogo', 'admin@katalogo.com', '123456', 'VENDEDOR')"
            );
            userId = result.insertId;
        } else {
            userId = users[0].id;
        }

        // 2. Insertar tienda
        const [tiendas] = await db.execute("SELECT id FROM tiendas WHERE usuario_id = ?", [userId]);
        let tiendaId;
        if (tiendas.length === 0) {
            const [result] = await db.execute(
                "INSERT INTO tiendas (usuario_id, nombre, descripcion, estado) VALUES (?, 'Katalogo Oficial', 'Tienda oficial', 'APROBADA')",
                [userId]
            );
            tiendaId = result.insertId;
        } else {
            tiendaId = tiendas[0].id;
        }

        // 3. Insertar categorías
        const categorias = ['Moda', 'Electrónica', 'Hogar', 'Belleza', 'Deportes', 'Juguetes', 'Tech'];
        const catMap = {};
        for (const cat of categorias) {
            const [rows] = await db.execute("SELECT id FROM categorias WHERE nombre = ?", [cat]);
            if (rows.length === 0) {
                const [result] = await db.execute("INSERT INTO categorias (nombre) VALUES (?)", [cat]);
                catMap[cat.toUpperCase()] = result.insertId;
            } else {
                catMap[cat.toUpperCase()] = rows[0].id;
            }
        }

        // 4. Insertar productos
        const productos = [
            { nombre: 'Bolso de Cuero Atelier', precio: 450.00, tag: 'MODA', desc: 'Diseño elegante y artesanal con acabados premium.', img: '👜' },
            { nombre: 'Silla Ergonómica Apex', precio: 285.00, tag: 'HOGAR', desc: 'Soporte superior para tu espacio de trabajo moderno.', img: '🪑' },
            { nombre: 'Auriculares Noise-Cancel V2', precio: 199.99, tag: 'TECH', desc: 'Inmersión sonora de alta fidelidad sin distracciones.', img: '🎧' },
            { nombre: 'Set de Cuidado Aurum', precio: 120.00, tag: 'BELLEZA', desc: 'Ingredientes botánicos puros para una piel radiante.', img: '✨' }
        ];

        for (const p of productos) {
            // Verificar si existe para no duplicar
            const [exists] = await db.execute("SELECT id FROM productos WHERE nombre = ?", [p.nombre]);
            if (exists.length === 0) {
                const catId = catMap[p.tag] || catMap['MODA']; // Fallback
                const [result] = await db.execute(
                    "INSERT INTO productos (tienda_id, categoria_id, nombre, descripcion_detallada, precio, estado) VALUES (?, ?, ?, ?, ?, 'ACTIVO')",
                    [tiendaId, catId, p.nombre, p.desc, p.precio]
                );
                const prodId = result.insertId;
                
                // Insertar imagen
                await db.execute(
                    "INSERT INTO imagenes_producto (producto_id, url, es_principal) VALUES (?, ?, TRUE)",
                    [prodId, p.img]
                );
            }
        }

        console.log("¡Datos insertados correctamente!");
        process.exit(0);
    } catch (error) {
        console.error("Error insertando datos:", error);
        process.exit(1);
    }
}

seedData();
