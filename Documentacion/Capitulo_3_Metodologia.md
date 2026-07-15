# CAPÍTULO 3: METODOLOGÍA DE DESARROLLO

## 3.1 Selección de Metodología

Para el desarrollo del sistema web (Marketplace), se ha seleccionado **Scrum** como marco de trabajo ágil. Scrum es una metodología iterativa e incremental que permite la gestión de proyectos complejos, enfocándose en la entrega continua de valor, la adaptabilidad ante los cambios y la colaboración estrecha del equipo.

## 3.2 Justificación de la Metodología

El desarrollo de un Marketplace robusto, inspirado en plataformas como Mercado Libre, implica la integración de múltiples funcionalidades complejas (gestión de usuarios, catálogo de productos, carrito de compras, pasarelas de pago, sistema de reputación, etc.). La elección de Scrum se justifica por las siguientes razones:

1. **Adaptabilidad a los Cambios:** En el desarrollo de plataformas de comercio electrónico, los requerimientos del mercado o de los usuarios pueden cambiar rápidamente. Scrum permite ajustar el rumbo del proyecto al inicio de cada iteración (Sprint) sin afectar el progreso global.
2. **Entregas Continuas de Valor:** A través de ciclos de desarrollo cortos (Sprints de 2 a 4 semanas), el equipo puede entregar funcionalidades operativas y probadas de manera frecuente, permitiendo obtener retroalimentación temprana.
3. **Reducción de Riesgos:** Al dividir el proyecto en partes pequeñas y manejables, se facilita la identificación temprana de problemas arquitectónicos o de usabilidad, especialmente críticos al implementar un sistema en un servidor Linux (Ubuntu Server) con tecnologías modernas (Node.js, React, MySQL).
4. **Enfoque en la Calidad:** Scrum fomenta la mejora continua mediante las retrospectivas, lo cual se alinea perfectamente con los objetivos de aseguramiento de calidad (QA) que se detallarán en los próximos capítulos.

## 3.3 Descripción de la Metodología

Scrum se basa en el empirismo y el pensamiento Lean, dividiendo el trabajo en iteraciones estructuradas llamadas **Sprints**. El flujo de trabajo que seguiremos consta de los siguientes eventos clave:

1. **Sprint Planning (Planificación del Sprint):** Al inicio de cada iteración, el equipo define qué elementos del *Product Backlog* (lista de requerimientos del sistema) se abordarán y cómo se construirán, formando así el *Sprint Backlog*.
2. **Daily Scrum (Reunión Diaria):** Una breve sincronización diaria de 15 minutos donde el equipo de desarrollo inspecciona el progreso hacia el objetivo del Sprint y adapta el plan de trabajo si es necesario.
3. **Sprint Review (Revisión del Sprint):** Al finalizar el Sprint, el equipo presenta el incremento de software funcional (ej. un módulo del Marketplace terminado) para recibir retroalimentación y adaptar el Product Backlog según sea necesario.
4. **Sprint Retrospective (Retrospectiva del Sprint):** Una reunión interna del equipo para analizar qué funcionó bien, qué se puede mejorar y establecer un plan de acción para incrementar la calidad y eficiencia en el próximo Sprint.

## 3.4 Roles y Responsabilidades según la Metodología

Para garantizar el correcto funcionamiento de Scrum en el proyecto del Marketplace, se definen los siguientes roles fundamentales:

### 1. Product Owner (Dueño del Producto)
*   **Responsabilidad:** Maximizar el valor del producto y del trabajo del equipo de desarrollo.
*   **Funciones:**
    *   Definir y documentar los requerimientos del sistema (Historias de Usuario).
    *   Gestionar y priorizar el *Product Backlog* enfocado en las necesidades del negocio.
    *   Validar y aceptar o rechazar las funcionalidades entregadas al final de cada Sprint.

### 2. Scrum Master
*   **Responsabilidad:** Asegurar que Scrum se entienda y se aplique correctamente, actuando como un líder servicial.
*   **Funciones:**
    *   Facilitar los eventos de Scrum (Planificación, Daily, Review, Retrospectiva).
    *   Eliminar impedimentos técnicos u organizativos que bloqueen al equipo de desarrollo.
    *   Guiar al equipo hacia la autoorganización y la mejora continua.

### 3. Equipo de Desarrollo (Development Team)
*   **Responsabilidad:** Construir el producto entregando un incremento de software potencialmente desplegable al final de cada Sprint. En este caso, serán los encargados del Frontend, Backend, Base de Datos y configuración del Servidor Linux.
*   **Funciones:**
    *   Diseñar la arquitectura, escribir el código (Next.js, Node.js) y configurar la base de datos (MySQL/MariaDB).
    *   Asegurar la calidad del código mediante la ejecución de pruebas (Unitarias, de Integración).
    *   Estimar el esfuerzo técnico de las tareas durante el Sprint Planning.
    *   Organizarse internamente para cumplir con el *Sprint Goal*.
