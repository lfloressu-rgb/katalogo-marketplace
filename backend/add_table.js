const db = require('./config/db');

async function addTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS metodos_pago (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                numero_tarjeta VARCHAR(20) NOT NULL,
                titular VARCHAR(100) NOT NULL,
                fecha_expiracion VARCHAR(5) NOT NULL,
                cvv VARCHAR(4) NOT NULL,
                tipo ENUM('VISA', 'MASTERCARD', 'OTRO') DEFAULT 'VISA',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            );
        `;
        await db.execute(query);
        console.log("Tabla metodos_pago creada exitosamente.");
    } catch (error) {
        console.error("Error creando tabla:", error);
    } finally {
        process.exit();
    }
}

addTable();
