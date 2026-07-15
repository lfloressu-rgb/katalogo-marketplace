USE marketplace;

-- Desactivar temporalmente foreign keys para evitar problemas de orden al truncar/insertar
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos de prueba anteriores usando CASCADE
DELETE FROM usuarios WHERE email IN ('juan@tienda.com', 'maria@tienda.com');

-- 1. Insertar Usuarios Vendedores (password es '123456' hasheado con bcrypt)
INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES 
('Juan Vendedor', 'juan@tienda.com', '$2a$10$wzZ6D5j/g6x9vX3M9Zg1M.5aQ3p8yN0Q6L8b/7wZp4L7m5O9v9kOq', 'VENDEDOR', 1),
('Maria Vendedora', 'maria@tienda.com', '$2a$10$wzZ6D5j/g6x9vX3M9Zg1M.5aQ3p8yN0Q6L8b/7wZp4L7m5O9v9kOq', 'VENDEDOR', 1);

-- Guardamos los IDs generados asumiendo que empiezan desde auto_increment (usaremos subconsultas si es necesario)
-- Pero mejor forzar los IDs para asegurar integridad:
INSERT INTO tiendas (usuario_id, nombre, descripcion, estado) 
SELECT id, 'Tech Store Juan', 'Tienda de Tecnología', 'APROBADA' FROM usuarios WHERE email = 'juan@tienda.com' LIMIT 1;

INSERT INTO tiendas (usuario_id, nombre, descripcion, estado) 
SELECT id, 'Ropa Maria', 'Tienda de Ropa', 'APROBADA' FROM usuarios WHERE email = 'maria@tienda.com' LIMIT 1;

-- 2. Insertar Categoria
INSERT INTO categorias (nombre, descripcion) VALUES ('Electrónica', 'Productos tecnológicos'), ('Moda', 'Ropa y accesorios');

-- 3. Insertar Productos Tienda Juan (Electrónica)
INSERT INTO productos (tienda_id, categoria_id, nombre, descripcion_corta, precio, estado)
SELECT t.id, (SELECT id FROM categorias WHERE nombre = 'Electrónica' LIMIT 1), 'Laptop Gamer Asus', 'Laptop para juegos pesados', 3500.00, 'ACTIVO'
FROM tiendas t WHERE t.nombre = 'Tech Store Juan' LIMIT 1;

INSERT INTO variantes (producto_id, stock) 
SELECT id, 10 FROM productos WHERE nombre = 'Laptop Gamer Asus' LIMIT 1;

INSERT INTO imagenes_producto (producto_id, url, es_principal) 
SELECT id, 'https://cdn-icons-png.flaticon.com/512/3173/3173073.png', 1 FROM productos WHERE nombre = 'Laptop Gamer Asus' LIMIT 1;


INSERT INTO productos (tienda_id, categoria_id, nombre, descripcion_corta, precio, estado)
SELECT t.id, (SELECT id FROM categorias WHERE nombre = 'Electrónica' LIMIT 1), 'Mouse Inalámbrico Logitech', 'Mouse ergonómico 2.4GHz', 120.00, 'ACTIVO'
FROM tiendas t WHERE t.nombre = 'Tech Store Juan' LIMIT 1;

INSERT INTO variantes (producto_id, stock) 
SELECT id, 50 FROM productos WHERE nombre = 'Mouse Inalámbrico Logitech' LIMIT 1;

INSERT INTO imagenes_producto (producto_id, url, es_principal) 
SELECT id, 'https://cdn-icons-png.flaticon.com/512/3173/3173075.png', 1 FROM productos WHERE nombre = 'Mouse Inalámbrico Logitech' LIMIT 1;

-- 4. Insertar Productos Tienda Maria (Moda)
INSERT INTO productos (tienda_id, categoria_id, nombre, descripcion_corta, precio, estado)
SELECT t.id, (SELECT id FROM categorias WHERE nombre = 'Moda' LIMIT 1), 'Casaca de Cuero', 'Casaca 100% cuero genuino', 250.00, 'ACTIVO'
FROM tiendas t WHERE t.nombre = 'Ropa Maria' LIMIT 1;

INSERT INTO variantes (producto_id, stock) 
SELECT id, 15 FROM productos WHERE nombre = 'Casaca de Cuero' LIMIT 1;

INSERT INTO imagenes_producto (producto_id, url, es_principal) 
SELECT id, 'https://cdn-icons-png.flaticon.com/512/1785/1785255.png', 1 FROM productos WHERE nombre = 'Casaca de Cuero' LIMIT 1;


INSERT INTO productos (tienda_id, categoria_id, nombre, descripcion_corta, precio, estado)
SELECT t.id, (SELECT id FROM categorias WHERE nombre = 'Moda' LIMIT 1), 'Zapatillas Running Nike', 'Zapatillas ultraligeras para correr', 180.00, 'ACTIVO'
FROM tiendas t WHERE t.nombre = 'Ropa Maria' LIMIT 1;

INSERT INTO variantes (producto_id, stock) 
SELECT id, 20 FROM productos WHERE nombre = 'Zapatillas Running Nike' LIMIT 1;

INSERT INTO imagenes_producto (producto_id, url, es_principal) 
SELECT id, 'https://cdn-icons-png.flaticon.com/512/2589/2589886.png', 1 FROM productos WHERE nombre = 'Zapatillas Running Nike' LIMIT 1;

SET FOREIGN_KEY_CHECKS = 1;
