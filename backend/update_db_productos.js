const db = require('./config/db');

async function updateProductosTable() {
    try {
        console.log("Iniciando actualización de la tabla productos...");

        // Actualizar el ENUM de condicion (agregando REACONDICIONADO)
        await db.execute(`ALTER TABLE productos MODIFY COLUMN condicion ENUM('NUEVO', 'USADO', 'REACONDICIONADO') DEFAULT 'NUEVO'`);

        const columnasNuevas = [
            `ADD COLUMN costo DECIMAL(10,2) DEFAULT 0`,
            `ADD COLUMN stock_disponible INT DEFAULT 0`,
            `ADD COLUMN stock_minimo INT DEFAULT 0`,
            `ADD COLUMN sku VARCHAR(100)`,
            `ADD COLUMN codigo_barras VARCHAR(100)`,
            `ADD COLUMN marca VARCHAR(100)`,
            `ADD COLUMN modelo VARCHAR(100)`,
            `ADD COLUMN color VARCHAR(50)`,
            `ADD COLUMN material VARCHAR(100)`,
            `ADD COLUMN garantia VARCHAR(100)`,
            `ADD COLUMN estado_publicacion ENUM('BORRADOR', 'PENDIENTE', 'PUBLICADO', 'RECHAZADO', 'OCULTO') DEFAULT 'PUBLICADO'`,
            `ADD COLUMN destacado BOOLEAN DEFAULT FALSE`,
            `ADD COLUMN visitas INT DEFAULT 0`,
            `ADD COLUMN ventas INT DEFAULT 0`,
            `ADD COLUMN calificacion_promedio DECIMAL(3,2) DEFAULT 0`,
            `ADD COLUMN fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
        ];

        for (const col of columnasNuevas) {
            try {
                await db.execute(`ALTER TABLE productos ${col}`);
                console.log(`Ejecutado: ${col}`);
            } catch (err) {
                // Ignore if column already exists
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Columna ya existe: ${col}`);
                } else {
                    console.error(`Error en ${col}:`, err);
                }
            }
        }

        console.log("Tabla productos actualizada exitosamente.");
    } catch (error) {
        console.error("Error actualizando la base de datos:", error);
    } finally {
        process.exit();
    }
}

updateProductosTable();
