const db = require('./config/db');

async function addTables() {
    try {
        const queryCupones = `
            CREATE TABLE IF NOT EXISTS cupones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tienda_id INT NOT NULL,
                codigo VARCHAR(50) NOT NULL,
                descuento VARCHAR(50) NOT NULL,
                producto_id INT,
                vencimiento DATE,
                estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
            );
        `;
        await db.execute(queryCupones);
        console.log("Tabla cupones creada exitosamente.");

        const queryReclamos = `
            CREATE TABLE IF NOT EXISTS reclamos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                tienda_id INT NOT NULL,
                orden_id INT,
                asunto VARCHAR(200) NOT NULL,
                mensaje TEXT NOT NULL,
                estado ENUM('PENDIENTE', 'RESUELTO') DEFAULT 'PENDIENTE',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
                FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE
            );
        `;
        await db.execute(queryReclamos);
        console.log("Tabla reclamos creada exitosamente.");
    } catch (error) {
        console.error("Error creando tablas:", error);
    } finally {
        process.exit();
    }
}

addTables();
