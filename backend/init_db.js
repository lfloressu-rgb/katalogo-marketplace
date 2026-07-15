const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
    try {
        console.log('Conectando a MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true // Permite ejecutar múltiples queries a la vez
        });

        console.log('Borrando base de datos antigua (si existe) y creando nueva...');
        await connection.query('DROP DATABASE IF EXISTS marketplace');
        await connection.query('CREATE DATABASE marketplace');
        await connection.query('USE marketplace');

        console.log('Ejecutando database.sql...');
        const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
        await connection.query(sql);

        console.log('¡Estructura de la base de datos recreada exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('Error inicializando BD:', error);
        process.exit(1);
    }
}

initDB();
