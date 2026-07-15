const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function fix() {
    try {
        const hash = await bcrypt.hash('123456', 10);
        await db.execute('UPDATE usuarios SET password = ? WHERE email IN (?, ?)', [hash, 'juan@tienda.com', 'maria@tienda.com']);
        console.log('Passwords fixed!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
