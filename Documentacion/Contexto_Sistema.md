# Contexto del Sistema: Marketplace "Katalogo"

Este documento proporciona una visión detallada de la arquitectura, flujo y tecnologías empleadas en el sistema para dar contexto tanto a la IA como al equipo de desarrollo.

## 1. Tipo de Sistema
El sistema es una **Plataforma Web de Comercio Electrónico (Marketplace)**, inspirada en modelos como Mercado Libre, donde múltiples vendedores pueden registrarse, crear sus tiendas y ofrecer productos, mientras que los clientes pueden explorar el catálogo, realizar compras y dejar valoraciones.

## 2. Nombre del Sistema
**Katalogo**

## 3. Flujo Principal del Sistema
El flujo principal se divide según los tres roles de usuario (CLIENTE, VENDEDOR, ADMIN):
*   **Cliente:** Se registra, busca productos en el catálogo público, gestiona su carrito, genera una orden de compra, configura su dirección de envío, realiza el pago y, al recibir el producto, puede dejar una valoración o reseña.
*   **Vendedor (Tienda):** Se registra y solicita la creación de una tienda. Una vez aprobada por un Administrador, puede acceder a su panel de gestión. Allí puede crear productos, categorías, definir variantes (talla, color, SKU), manejar su stock y cambiar el estado de las órdenes de venta que recibe.
*   **Administrador:** Gestiona la plataforma de manera global. Es el encargado de aprobar o suspender tiendas de vendedores, administrar usuarios del sistema, y supervisar que el catálogo y las transacciones funcionen correctamente.

## 4. Paneles y Módulos Principales
El backend de la plataforma expone distintas rutas (API REST) bajo el prefijo `/api` que alimentan paneles específicos:
*   **Módulo de Autenticación (`/api/auth`):** Registro, inicio de sesión (Login) y recuperación.
*   **Panel Administrativo (`/api/admin`):** Gestión global del sistema, aprobación de vendedores y métricas.
*   **Panel de Vendedor (`/api/vendedor`):** Dashboard exclusivo para que los dueños de tiendas gestionen inventario, productos y órdenes.
*   **Módulo de Productos/Catálogo (`/api/productos`):** Visualización pública del catálogo, filtrado, detalle de productos e imágenes.
*   **Módulo de Órdenes (`/api/ordenes`):** Manejo transaccional del carrito, creación de pedidos (checkout), seguimiento de envíos e historial de compras.
*   **Módulo de Archivos (`/api/upload`):** Subida y gestión de imágenes para productos, logos de tiendas y perfiles.

## 5. Estructura del Proyecto
La arquitectura sigue un patrón Cliente-Servidor (Frontend y Backend desacoplados):
*   **`frontend/`**: Interfaz de usuario de Katalogo. Emplea la estructura **App Router** de Next.js (directorio `src/app/`).
*   **`backend/`**: Lógica del servidor (se ejecuta por defecto en el puerto `5000`), API RESTful, configuraciones de conexión y middlewares. Almacena las imágenes localmente en la carpeta `uploads/` y las sirve de forma estática.
*   **`Documentacion/`**: Archivos de diseño, especificaciones, metodologías (Scrum) y contexto del sistema.

## 6. Tecnologías de Desarrollo (Tech Stack)
*   **Frontend:** Next.js (React 19, App Router), Tailwind CSS (estilizado).
*   **Backend:** Node.js, Express.js.
*   **Base de Datos:** MySQL (esquema principal llamado `marketplace`, usando el driver `mysql2`).
*   **Despliegue/Infraestructura:** Diseñado para correr en servidores Linux (Ubuntu Server) empleando metodologías ágiles (Scrum).

## 7. Parámetros de Seguridad
*   **Autenticación y Autorización:** Implementación de **JWT (JSON Web Tokens)** para manejar las sesiones y asegurar los endpoints privados a través de middlewares.
*   **Cifrado de Contraseñas:** Se utiliza **Bcryptjs** para encriptar las contraseñas de los usuarios de forma segura antes de su almacenamiento.
*   **Protección de Recursos Cruzados:** Configuración de **CORS** para delimitar qué orígenes (dominios frontend) pueden comunicarse con la API.
*   **Validación de Archivos:** Uso de `multer` para procesar y validar de forma controlada la subida de recursos (imágenes).
*   **Variables de Entorno:** Uso de `.env` (`dotenv`) para proteger credenciales de base de datos y firmas JWT sin exponerlas en el código fuente.

## 8. Estructura de la Base de Datos
Es un esquema relacional con tablas bien interconectadas, cuyas divisiones principales son:
1.  **Usuarios y Configuración:** 
    *   `usuarios` (id, nombre, email, password cifrado, rol, estado activo).
    *   `direcciones` (distrito, provincia, departamento, principal).
2.  **Tiendas (Sellers):** 
    *   `tiendas` (estado de aprobación, RUC, logo, descripción).
3.  **Catálogo:** 
    *   `categorias`, `productos` (precio, descripción, condición).
    *   `imagenes_producto` (URL, imagen principal).
    *   `variantes` (SKU, color, talla, stock, precio adicional).
4.  **Transacciones:** 
    *   `ordenes` (estado de la compra, total, método de pago).
    *   `detalles_orden` (cantidades y precios fijos al momento de compra).
5.  **Interacción Social:** 
    *   `valoraciones` (calificación de 1 a 5 estrellas, y reseñas por producto).
