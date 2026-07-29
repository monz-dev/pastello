

## Contexto

Diseña una aplicación web **Mobile First** de nombre Pastello, para una pastelería que
permita realizar pedidos de tres formas: 1. Elegir un pastel prediseñado
de la sección **Más pedidos**. 2. Personalizar un pastel seleccionando
tamaño, pan, relleno y cobertura. 3. Subir una imagen de referencia y
describir un pastel personalizado.

La aplicación enviará el pedido completo mediante **WhatsApp** al número
configurado por la pastelería.

## Estilo visual

-   Mobile First
-   Diseño moderno, premium, minimalista
-   Inspirado en Airbnb, Uber Eats, Apple Store y Starbucks
-   Mucho espacio en blanco
-   Bordes redondeados
-   Sombras suaves
-   Componentes táctiles grandes
-   Microinteracciones
-   Animaciones fluidas
-   Light Mode y Dark Mode

### Colores

-   Rosa pastel (#F8BBD0)
-   Rosa claro
-   Blanco
-   Crema
-   Beige
-   Gris muy claro
-   Rosa intenso para CTA.

## Tipografía

Poppins, Inter o Nunito.

## Stack

-   Next.js
-   TypeScript
-   Tailwind CSS
-   Supabase

## Navegación

Bottom Navigation: - Inicio - Crear pastel - Mis pedidos - Perfil -
Administración (solo pastelero)

## Pantallas

### Splash

Logo, nombre, ilustración y animación.

### Login

Correo, Google y modo invitado.

### Home

Banner, buscador, promociones, carrusel "Más pedidos", botón "Crear mi
pastel" y acceso para subir imagen.

### Más pedidos

Tarjetas con imagen grande, nombre, descripción, ingredientes, tamaño,
precio, tiempo, favoritos, compartir y botón Pedir.

### Constructor de pastel (Stepper)

#### Paso 1 - Tamaño

Mostrar fotografías para: - Mini (7 cm) - Chico (12 cm) - Grande (14
cm) - Doble piso (14 cm)

Cada tarjeta: - Imagen - Nombre - Diámetro - Personas sugeridas -
Precio - Animación de selección

#### Paso 2 - Pan

Mostrar fotografías reales de: - Chocolate - Vainilla - Red Velvet -
Mantequilla

Cada tarjeta: - Imagen - Nombre - Descripción - Check animado - Escalado
al seleccionar

#### Paso 3 - Relleno

Mostrar fotografías de: - Nutella - Queso crema - Oreo - Chocolate

Con descripción y animación.

#### Paso 4 - Cobertura

Mostrar fotografías de: - Chocolate - Queso crema - Oreo

Con textura y vista previa.

#### Paso 5 - Resumen

Vista previa ilustrada del pastel mostrando: - Tamaño - Pan - Relleno -
Cobertura - Precio estimado - Botón Continuar

### Pastel personalizado

Área Drag & Drop, tomar foto, subir imagen, vista previa, descripción,
fecha requerida, observaciones y enviar.

### Confirmación

Resumen completo e importante botón "Enviar pedido por WhatsApp".

### Mis pedidos

Lista con imagen, precio, fecha y estados: - Pedido recibido - En
preparación - Enviado - Cancelado - Entregado

### Detalle del pedido

Timeline vertical con imágenes y botón Contactar por WhatsApp.

## Panel del pastelero

Dashboard con métricas. Kanban: - Pedido recibido - En preparación -
Enviado - Cancelado - Entregado

Administración de catálogo.

Administración de ingredientes:

### Pan

-   Chocolate
-   Vainilla
-   Red Velvet
-   Mantequilla

### Rellenos

-   Nutella
-   Queso crema
-   Oreo
-   Chocolate

### Coberturas

-   Chocolate
-   Queso crema
-   Oreo

Cada ingrediente: - Imagen - Disponibilidad - Precio adicional -
Activo/Inactivo

Configuración: - Número de WhatsApp - Horarios - Tema - Redes sociales

## UX

Botones de mínimo 44px, skeletons, feedback inmediato, estados vacíos
ilustrados, accesibilidad, confirmaciones antes de cancelar, formularios
cortos, indicadores de progreso, componentes reutilizables y animaciones
suaves.

## Componentes

Botones, cards, stepper, timeline, chips, modales, toasts, sidebar,
bottom navigation, métricas, carruseles.

## Entregable esperado

Generar un Design System completo y todas las pantallas en alta
fidelidad para Light y Dark Mode, optimizadas para Mobile First y listas
para implementarse con Next.js, TypeScript, Tailwind CSS y Supabase. Las
fotografías de pasteles e ingredientes deben ser protagonistas y toda la
experiencia debe transmitir una sensación premium y moderna.
