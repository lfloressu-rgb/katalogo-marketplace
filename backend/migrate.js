const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'marketplace'
  });

  try {
    console.log("Creando tabla configuracion...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comision_plataforma DECIMAL(5,2) DEFAULT 5.00,
        igv DECIMAL(5,2) DEFAULT 18.00,
        moneda VARCHAR(10) DEFAULT 'PEN'
      )
    `);

    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM configuracion');
    if (rows[0].count === 0) {
      await connection.execute("INSERT INTO configuracion (comision_plataforma) VALUES (5.00)");
      console.log("Configuracion inicial insertada.");
    }

    console.log("Modificando tabla ordenes...");
    await connection.execute(`
      ALTER TABLE ordenes
      ADD COLUMN estado_liquidacion ENUM('PENDIENTE', 'PAGADO') DEFAULT 'PENDIENTE'
    `);
    console.log("Columna estado_liquidacion añadida a ordenes.");

  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("La columna estado_liquidacion ya existe, ignorando...");
    } else {
      console.error(err);
    }
  } finally {
    await connection.end();
  }
}

run();
