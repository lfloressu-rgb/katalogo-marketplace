const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        console.log('Iniciando seed...');
        
        // 1. Crear Vendedores
        const passwordHash = await bcrypt.hash('123456', 10);
        
        const [vend1Res] = await db.execute(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            ['Juan Vendedor', 'juan@tienda.com', passwordHash, 'VENDEDOR']
        );
        const vend1Id = vend1Res.insertId;

        const [vend2Res] = await db.execute(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            ['Maria Vendedora', 'maria@tienda.com', passwordHash, 'VENDEDOR']
        );
        const vend2Id = vend2Res.insertId;

        // 2. Crear Tiendas
        const [tienda1Res] = await db.execute(
            'INSERT INTO tiendas (usuario_id, nombre, estado) VALUES (?, ?, ?)',
            [vend1Id, 'Tech Store Juan', 'APROBADA']
        );
        const tienda1Id = tienda1Res.insertId;

        const [tienda2Res] = await db.execute(
            'INSERT INTO tiendas (usuario_id, nombre, estado) VALUES (?, ?, ?)',
            [vend2Id, 'Ropa Maria', 'APROBADA']
        );
        const tienda2Id = tienda2Res.insertId;

        // 3. Crear Categoria
        const [catRes] = await db.execute('INSERT INTO categorias (nombre) VALUES (?)', ['General']);
        const catId = catRes.insertId;

        // 4. Crear Productos Tienda 1
        const [prod1Res] = await db.execute(
            'INSERT INTO productos (tienda_id, categoria_id, nombre, precio, estado) VALUES (?, ?, ?, ?, ?)',
            [tienda1Id, catId, 'Laptop Gamer Asus', 3500.00, 'ACTIVO']
        );
        const prod1Id = prod1Res.insertId;
        await db.execute('INSERT INTO variantes (producto_id, stock) VALUES (?, ?)', [prod1Id, 10]);
        await db.execute('INSERT INTO imagenes_producto (producto_id, url, es_principal) VALUES (?, ?, TRUE)', [prod1Id, '💻']);

        const [prod2Res] = await db.execute(
            'INSERT INTO productos (tienda_id, categoria_id, nombre, precio, estado) VALUES (?, ?, ?, ?, ?)',
            [tienda1Id, catId, 'Mouse Inalámbrico', 120.00, 'ACTIVO']
        );
        const prod2Id = prod2Res.insertId;
        await db.execute('INSERT INTO variantes (producto_id, stock) VALUES (?, ?)', [prod2Id, 50]);
        await db.execute('INSERT INTO imagenes_producto (producto_id, url, es_principal) VALUES (?, ?, TRUE)', [prod2Id, '🖱️']);

        // 5. Crear Productos Tienda 2
        const [prod3Res] = await db.execute(
            'INSERT INTO productos (tienda_id, categoria_id, nombre, precio, estado) VALUES (?, ?, ?, ?, ?)',
            [tienda2Id, catId, 'Casaca de Cuero', 250.00, 'ACTIVO']
        );
        const prod3Id = prod3Res.insertId;
        await db.execute('INSERT INTO variantes (producto_id, stock) VALUES (?, ?)', [prod3Id, 15]);
        await db.execute('INSERT INTO imagenes_producto (producto_id, url, es_principal) VALUES (?, ?, TRUE)', [prod3Id, '🧥']);

        const [prod4Res] = await db.execute(
            'INSERT INTO productos (tienda_id, categoria_id, nombre, precio, estado) VALUES (?, ?, ?, ?, ?)',
            [tienda2Id, catId, 'Zapatillas Running', 180.00, 'ACTIVO']
        );
        const prod4Id = prod4Res.insertId;
        await db.execute('INSERT INTO variantes (producto_id, stock) VALUES (?, ?)', [prod4Id, 20]);
        await db.execute('INSERT INTO imagenes_producto (producto_id, url, es_principal) VALUES (?, ?, TRUE)', [prod4Id, '👟']);

        console.log('Seed completado. 2 Tiendas y 4 Productos creados exitosamente.');
        process.exit(0);

    } catch (error) {
        console.error('Error en seed:', error);
        process.exit(1);
    }
}

seed();
