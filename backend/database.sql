CREATE DATABASE IF NOT EXISTS marketplace;
USE marketplace;

-- 1. USUARIOS Y ROLES
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('CLIENTE', 'VENDEDOR', 'ADMIN') DEFAULT 'CLIENTE',
    telefono VARCHAR(20),
    dni VARCHAR(20),
    fecha_nacimiento DATE,
    foto_perfil VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Direcciones de Clientes
CREATE TABLE IF NOT EXISTS direcciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    distrito VARCHAR(100),
    provincia VARCHAR(100),
    departamento VARCHAR(100),
    es_principal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 2. TIENDAS (Vendedores)
CREATE TABLE IF NOT EXISTS tiendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    logo_url VARCHAR(255),
    banner_url VARCHAR(255),
    ruc VARCHAR(20),
    razon_social VARCHAR(150),
    estado ENUM('PENDIENTE', 'APROBADA', 'SUSPENDIDA') DEFAULT 'PENDIENTE',
    cuenta_bancaria VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 3. CATÁLOGO
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT NOT NULL,
    categoria_id INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion_corta VARCHAR(255),
    descripcion_detallada TEXT,
    precio DECIMAL(10,2) NOT NULL,
    precio_oferta DECIMAL(10,2),
    condicion ENUM('NUEVO', 'USADO') DEFAULT 'NUEVO',
    estado ENUM('ACTIVO', 'INACTIVO', 'AGOTADO') DEFAULT 'ACTIVO',
    peso DECIMAL(10,2),
    dimensiones VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS imagenes_producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS variantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    sku VARCHAR(100) UNIQUE,
    color VARCHAR(50),
    talla VARCHAR(50),
    stock INT NOT NULL DEFAULT 0,
    precio_adicional DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- 4. ÓRDENES Y VENTAS
CREATE TABLE IF NOT EXISTS ordenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tienda_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO', 'DEVUELTO') DEFAULT 'PENDIENTE',
    metodo_pago VARCHAR(50),
    direccion_envio_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id) ON DELETE CASCADE,
    FOREIGN KEY (direccion_envio_id) REFERENCES direcciones(id)
);

CREATE TABLE IF NOT EXISTS detalles_orden (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id INT NOT NULL,
    producto_id INT NOT NULL,
    variante_id INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (variante_id) REFERENCES variantes(id)
);

-- 5. VALORACIONES Y LISTA DE DESEOS
CREATE TABLE IF NOT EXISTS valoraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);
