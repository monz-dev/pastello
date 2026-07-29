# PRD — Pastello: Pastelería de Alta Gama

> **Product Requirements Document**
> Versión: 1.0 | Fecha: 2026-07-25
> Stack: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Objetivos del Producto](#2-objetivos-del-producto)
3. [Historias de Usuario](#3-historias-de-usuario)
4. [Arquitectura Técnica](#4-arquitectura-técnica)
5. [Especificación de Pantallas](#5-especificación-de-pantallas)
6. [Sistema de Diseño (Design System)](#6-sistema-de-diseño-design-system)
7. [Bases de Datos y Supabase](#7-bases-de-datos-y-supabase)
8. [Mejores Prácticas](#8-mejores-prácticas)
9. [Estrategia de Pruebas](#9-estrategia-de-pruebas)
10. [CI/CD y Despliegue](#10-cicd-y-despliegue)
11. [Métricas de Éxito](#11-métricas-de-éxito)
12. [Roadmap y Fases](#12-roadmap-y-fases)

---

## 1. Resumen Ejecutivo

**Pastello** es una aplicación web Mobile First para una pastelería de alta gama. Permite a los clientes realizar pedidos personalizados de pastelería fina a través de tres modalidades: elegir un diseño prediseñado (sección "Más pedidos"), construir un pastel paso a paso (tamaño → pan → relleno → cobertura), o subir una imagen de referencia con descripción. Cada pedido se envía vía WhatsApp al número configurado por la pastelería.

### 1.1 Propuesta de Valor

- **Experiencia premium**: Diseño minimalista con fotografía como protagonista, glassmorphism, animaciones fluidas y atención obsesiva al detalle.
- **Tres modalidades de pedido**: Desde la compra rápida de un diseño existente hasta la personalización total con foto de referencia.
- **Gestión completa para el pastelero**: Panel con kanban, métricas, administración de catálogo e ingredientes.
- **Sin intermediarios de delivery**: El pedido se envía directo por WhatsApp al pastelero.

### 1.2 Stack Tecnológico

| Capa | Tecnología | Versión Objetivo |
|------|-----------|-------------------|
| Framework | Next.js (App Router) | 15+ |
| Lenguaje | TypeScript | 5.x (strict) |
| Estilos | Tailwind CSS | 4.x |
| Base de Datos | Supabase (PostgreSQL) | Última |
| Autenticación | Supabase Auth | SSR |
| Almacenamiento | Supabase Storage | — |
| Despliegue | Vercel | — |
| Testing | Vitest + Playwright | Última |

---

## 2. Objetivos del Producto

### 2.1 Objetivos de Negocio

1. Digitalizar por completo el proceso de pedidos de la pastelería.
2. Reducir la fricción entre "quiero un pastel" y "pedido enviado".
3. Proveer al pastelero herramientas de gestión en tiempo real.
4. Aumentar el ticket promedio mediante la personalización guiada (cross-selling de rellenos y coberturas premium).

### 2.2 Objetivos de Experiencia

1. **Mobile First**: Toda la experiencia diseñada y optimizada primero para móvil, adaptada a desktop.
2. **Cero fricción**: Máximo 5 taps desde la landing hasta enviar un pedido por WhatsApp.
3. **Fotografía como lenguaje**: Cada decisión del usuario está respaldada por imágenes reales de alta calidad.
4. **Sensación premium**: Animaciones suaves ("cremosas"), glassmorphism, espacios generosos.

### 2.3 No Objetivos (Exclusiones)

- No hay pasarela de pago integrada (el pago se acuerda por WhatsApp).
- No hay sistema de delivery/logística (el pastelero coordina la entrega).
- No hay app nativa (PWA es suficiente para la primera versión).
- No hay multi-tenant (una pastelería por instancia).

---

## 3. Historias de Usuario

### 3.1 Cliente

| ID | Historia | Prioridad |
|----|---------|-----------|
| US-01 | Como cliente, quiero ver pasteles prediseñados con fotos y precios para inspirarme y pedir rápido. | P0 |
| US-02 | Como cliente, quiero personalizar un pastel eligiendo tamaño, pan, relleno y cobertura con fotos reales. | P0 |
| US-03 | Como cliente, quiero subir una foto de referencia y describir mi idea para un pastel 100% personalizado. | P0 |
| US-04 | Como cliente, quiero enviar mi pedido completo por WhatsApp al pastelero con un solo tap. | P0 |
| US-05 | Como cliente, quiero ver el estado de mis pedidos (recibido, en preparación, enviado, entregado). | P1 |
| US-06 | Como cliente, quiero guardar pasteles como favoritos y compartirlos. | P2 |
| US-07 | Como cliente, quiero registrarme con email, Google o como invitado. | P1 |

### 3.2 Pastelero (Admin)

| ID | Historia | Prioridad |
|----|---------|-----------|
| US-08 | Como pastelero, quiero un panel con métricas y un kanban para gestionar pedidos. | P0 |
| US-09 | Como pastelero, quiero administrar el catálogo de ingredientes (panes, rellenos, coberturas). | P0 |
| US-10 | Como pastelero, quiero configurar el número de WhatsApp, horarios, tema y redes sociales. | P1 |
| US-11 | Como pastelero, quiero gestionar los pasteles prediseñados de la sección "Más pedidos". | P1 |

---

## 4. Arquitectura Técnica

### 4.1 Estructura del Proyecto

```
pastello/
├── public/
│   └── images/             # Assets estáticos
├── src/
│   ├── app/                # App Router (Next.js 15+)
│   │   ├── (auth)/         # Login, registro, layout auth
│   │   ├── (main)/         # Layout principal con BottomNav
│   │   │   ├── home/       # Home (inicio)
│   │   │   ├── create/     # Constructor de pastel (stepper)
│   │   │   ├── custom/     # Pastel personalizado (subir imagen)
│   │   │   ├── orders/     # Mis pedidos + detalle
│   │   │   └── profile/    # Perfil del usuario
│   │   ├── admin/          # Panel del pastelero
│   │   │   ├── dashboard/  # Métricas
│   │   │   ├── orders/     # Kanban de pedidos
│   │   │   ├── catalog/    # Catálogo de ingredientes
│   │   │   └── settings/   # Configuración
│   │   ├── api/            # API routes (Server Functions)
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Splash screen
│   ├── components/
│   │   ├── ui/             # Design System (Button, Card, Stepper, etc.)
│   │   ├── layout/         # Header, BottomNav, Sidebar
│   │   ├── features/       # Feature-specific components
│   │   └── shared/         # Shared utilities
│   ├── lib/
│   │   ├── supabase/       # Supabase clients (server, browser, middleware)
│   │   ├── utils/          # Utility functions
│   │   └── constants/      # Const types pattern
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand stores (carrito, auth UI state)
│   ├── types/              # TypeScript types globales
│   └── styles/             # Configuración global de Tailwind
├── supabase/
│   └── migrations/         # Migraciones SQL versionadas
├── tests/
│   ├── unit/               # Vitest (componentes, hooks, utils)
│   ├── integration/        # Pruebas de flujo
│   └── e2e/                # Playwright (user journeys completos)
├── .github/
│   └── workflows/          # CI/CD pipelines
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
└── playwright.config.ts
```

### 4.2 Patrón de Arquitectura

**Clean Architecture en capas** dentro del App Router:

```
Pages / Routes (App Router)
    ↓
Components (Server + Client)
    ↓
Hooks / Server Actions
    ↓
Supabase Client SDK
    ↓
PostgreSQL (Supabase)
```

- **Server Components** por defecto: datos, layout, lógica de negocio.
- **Client Components** solo cuando se necesita interactividad (stepper, kanban drag & drop, carruseles).
- **Server Actions** para toda mutación de datos (crear pedido, actualizar estado, etc.).

### 4.3 Variables de Entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# WhatsApp (configurable desde el panel admin)
NEXT_PUBLIC_DEFAULT_WHATSAPP=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=Pastello
```

---

## 5. Especificación de Pantallas

### 5.1 Splash
- Logo + nombre con animación de entrada.
- Transición automática al home o login según sesión.

### 5.2 Login / Registro
- Email + contraseña, Google OAuth, modo invitado.
- Diseño aireado con fondo crema y logo centrado.

### 5.3 Home (Inicio)
- **Header**: Logo + carrito + menú hamburguesa con glassmorphism.
- **Buscador**: Estilo Airbnb (barra redondeada con sombra).
- **Hero Banner**: Carrusel/imagen destacada con CTA y overlay degradado.
- **Más Pedidos**: Carrusel horizontal con snap scroll, cards de imagen grande con zoom en hover.
- **CTA Personalizado**: Sección destacada con botón "Diseñar mi Pastel" y efecto glass.
- **Acceso rápido**: Subir foto de referencia como acceso directo desde home.

### 5.4 Constructor de Pastel (Stepper 5 pasos)

**Paso 1 — Tamaño**: Grid de 4 opciones (Mini 7cm, Chico 12cm, Grande 14cm, Doble piso 18+12cm). Cada card con foto, diámetro, personas sugeridas, precio. Radio selección con borde animado.

**Paso 2 — Pan**: Chocolate, Vainilla, Red Velvet, Mantequilla. Cards con foto, nombre y descripción. Check animado + escalado al seleccionar.

**Paso 3 — Relleno**: Nutella, Queso Crema, Oreo, Chocolate. Con descripción y animación de selección.

**Paso 4 — Cobertura**: Chocolate, Queso Crema, Oreo. Con textura visual y preview del acabado.

**Paso 5 — Resumen**: Vista previa ilustrada del pastel (imagen compuesta o generada), resumen de selecciones, precio total estimado. Botón "Continuar".

**Bottom Action Bar**: Barra fija con precio estimado + botón "Siguiente". Glassmorphism, visible en todos los pasos.

### 5.5 Pastel Personalizado (Custom)
- Área de drag & drop + botón para tomar foto/subir imagen.
- Vista previa de la imagen seleccionada.
- Campo de descripción del pastel deseado.
- Fecha requerida y observaciones adicionales.
- Botón "Enviar pedido por WhatsApp".

### 5.6 Confirmación
- Resumen completo del pedido (producto + precio + datos).
- Botón grande "Enviar pedido por WhatsApp" que abre WhatsApp con el mensaje preformateado.

### 5.7 Mis Pedidos
- Lista de pedidos con imagen, precio, fecha y timeline de estados.
- Estados: Pedido recibido → En preparación → Enviado → Cancelado → Entregado.
- Cada pedido es expandible al detalle.

### 5.8 Detalle del Pedido
- Timeline vertical con iconos + imágenes para cada estado.
- Botón "Contactar por WhatsApp" para hablar con el pastelero.
- Fechas y horas de cada transición de estado.

### 5.9 Panel del Pastelero (Admin)

**Dashboard**: Métricas clave (pedidos hoy, ingresos, pasteles más populares, tasa de conversión).

**Kanban**: Drag & drop entre columnas: Recibido → En preparación → Enviado → Cancelado → Entregado.

**Catálogo**: CRUD de ingredientes (panes, rellenos, coberturas) con imagen, disponibilidad, precio adicional, activo/inactivo.

**Configuración**: Número WhatsApp, horarios, tema (light/dark), redes sociales.

---

## 6. Sistema de Diseño (Design System)

### 6.1 Filosofía de Diseño

Basado en los archivos `DESIGN.md` y los mockups HTML existentes en carpeta design/. El núcleo visual es **Minimalismo con acentos Glassmorphism**, donde la fotografía de pastelería de alta gama es el protagonista absoluto.

La interfaz debe sentirse **amplia y aireada**, evocando calma e indulgencia. Cada interacción debe ser **fluida, suave e intencional** — como la textura de un buttercream premium.

Principios visuales clave:
- **Photography First**: Imágenes grandes, alta resolución, iluminación natural suave.
- **Translucency**: Glassmorphism sutil en navbars y overlays para mantener profundidad.
- **Fluidity**: Cada transición debe sentirse "cremosa", no mecánica.

### 6.2 Paleta de Colores — Tokens Tailwind

Basada en tonos "Pastelería" — cremas, blancos y beiges suaves, complementados con intensidades variables de rosa.

```typescript
// tailwind.config.ts — Pastello Theme Tokens
colors: {
  // Surface (fondos)
  surface: '#fcf9f8',
  'surface-dim': '#dcd9d9',
  'surface-bright': '#fcf9f8',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#f6f3f2',
  'surface-container': '#f0eded',
  'surface-container-high': '#eae7e7',
  'surface-container-highest': '#e5e2e1',

  // On Surface (texto sobre fondos)
  'on-surface': '#1c1b1b',
  'on-surface-variant': '#504447',
  'inverse-surface': '#313030',
  'inverse-on-surface': '#f3f0ef',

  // Outline
  outline: '#827377',
  'outline-variant': '#d4c2c6',

  // Primary (Rosa pastel — fondos suaves, selección)
  primary: '#805062',
  'on-primary': '#ffffff',
  'primary-container': '#f8bbd0',
  'on-primary-container': '#76485a',
  'inverse-primary': '#f2b6cb',
  'primary-fixed': '#ffd9e4',
  'primary-fixed-dim': '#f2b6cb',
  'on-primary-fixed': '#330f1f',
  'on-primary-fixed-variant': '#65394b',

  // Secondary (Rosa intenso — CTAs exclusivamente)
  secondary: '#b7004d',
  'on-secondary': '#ffffff',
  'secondary-container': '#de2264',
  'on-secondary-container': '#fffbff',
  'secondary-fixed': '#ffd9de',
  'secondary-fixed-dim': '#ffb2bf',
  'on-secondary-fixed': '#3f0016',
  'on-secondary-fixed-variant': '#90003b',

  // Tertiary (Neutros cálidos)
  tertiary: '#615e57',
  'on-tertiary': '#ffffff',
  'tertiary-container': '#d0cbc3',
  'on-tertiary-container': '#58564f',
  'tertiary-fixed': '#e7e2d9',
  'tertiary-fixed-dim': '#cbc6bd',
  'on-tertiary-fixed': '#1d1b16',
  'on-tertiary-fixed-variant': '#494640',

  // Extras
  cream: '#FFF9F0',
  'beige-soft': '#F5F5DC',
  'surface-dark': '#121212',
  'surface-light': '#FFFFFF',
  'border-subtle': '#EFEFEF',

  // Error
  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',
}
```

**Uso de secundarios**: El `secondary` (rosa intenso `#b7004d`) está reservado **exclusivamente** para CTAs críticos y estados interactivos. No se usa como decoración.

**Dark Mode**: Fondo charcoal profundo con overlays con tinte rosa para mantener calidez.

### 6.3 Tipografía

**Inter** es la familia tipográfica única (Tech-Luxury, estilo Apple).

```typescript
fontFamily: {
  display: ['Inter', 'sans-serif'],
  body: ['Inter', 'sans-serif'],
},
fontSize: {
  'display-lg': ['40px', { lineHeight: '48px', fontWeight: '700', letterSpacing: '-0.02em' }],
  'display-lg-mobile': ['32px', { lineHeight: '38px', fontWeight: '700', letterSpacing: '-0.02em' }],
  'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.01em' }],
  'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
  'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
  'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
  'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
  'label-md': ['12px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.05em' }],
  'button-text': ['16px', { lineHeight: '24px', fontWeight: '600' }],
}
```

- **Headlines**: Tracking más cerrado, pesos pesados para anclaje visual fuerte.
- **Body**: Altura de línea generosa para legibilidad.
- **label-md**: Mayúsculas con tracking aumentado para metadatos pequeños (ingredientes, dimensiones).

### 6.4 Layout y Espaciado

Basado en escala rítmica de 8px (con microajustes de 4px).

```typescript
spacing: {
  'base-unit': '4px',
  'container-padding-mobile': '20px',
  'container-padding-desktop': '40px',
  'gutter': '16px',
  'stack-sm': '8px',
  'stack-md': '16px',
  'stack-lg': '32px',
  'section-gap': '64px',
}
```

- **Mobile**: Columna única, márgenes laterales de 20px.
- **Desktop**: Grid fijo de 12 columnas centrado (max-width 1280px).
- **Vertical Rhythm**: Separación entre secciones de 64px+ para estética minimalista de alta gama.

### 6.5 Elevación y Sombras

- **Nivel 0**: Fondo principal (blanco/crema light, charcoal deep dark).
- **Nivel 1**: Cards (relleno blanco sutil, sombra 2% black).
- **Nivel 2**: Modales y flotantes (sombra 8% con blur mayor).
- **Carácter**: Sombras teñidas con el color de marca (rosa desaturado) para evitar gris sucio sobre fondos crema.
- **Backdrop Blur**: Navbars con blur de 20px + opacidad 80%.

### 6.6 Formas (Border Radius)

```typescript
borderRadius: {
  sm: '0.25rem',   // 4px
  DEFAULT: '0.5rem', // 8px
  md: '0.75rem',    // 12px — botones, inputs
  lg: '1rem',        // 16px
  xl: '1.5rem',      // 24px — cards de producto
  full: '9999px',    // Chips, píldoras
}
```

Geometría "Extra Rounded" para evocar la forma orgánica y suave de los productos.

### 6.7 Componentes del Design System

| Componente | Especificación |
|-----------|---------------|
| **Button** | Min 48px altura. Primary = secondary color. Secondary = pastel pink fill o borde sutil. |
| **Product Card** | Imagen full-width en mobile, zoom en hover/tap. Precio + título con headline-sm / body-md. |
| **Stepper** | Línea horizontal minimalista con dots. Current step: escala + transición a primary pink. |
| **Input** | Floating labels, fondo beige suave. Focus: border transition a primary pink con outer glow. |
| **Chips** | Selección: borde neutro → primary pink con bounce animation. |
| **Bottom Nav** | Glassmorphic bar, iconos centrados. Ícono "Crear" prominente y elevado. |
| **Modal** | Nivel 2 de elevación, backdrop semi-translúcido con blur. |
| **Toast** | Esquina inferior, slide-in animation, auto-dismiss. |
| **Timeline** | Vertical con dots conectados, usado en detalle de pedido. |

### 6.8 Animaciones y Microinteracciones

- **Card zoom**: Scale(1.05) en hover sobre imágenes de producto (CSS `transition-transform duration-500`).
- **Stepper bounce**: Transición suave entre pasos con glow en el active step.
- **Floating button**: Animación `float` 3s ease-in-out infinita (sutil).
- **Parallax hero**: Movimiento del fondo de hero en desktop según posición del mouse.
- **Header hide/show**: Ocultar al hacer scroll down, mostrar al scroll up (como Safari).
- **Selection feedback**: Scale bounce 0.98 → 1.0 en 150ms al seleccionar opciones.
- **Page transitions**: Transiciones suaves entre rutas (View Transitions API si es soportado).

---

## 7. Bases de Datos y Supabase

### 7.1 Esquema de Base de Datos

```sql
-- Profiles (extiende auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cakes prediseñados ("Más pedidos")
CREATE TABLE pre_designed_cakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[],
  size TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  estimated_time INTEGER, -- minutos
  image_url TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ingredientes
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('pan', 'relleno', 'cobertura')),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  additional_price DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  order_type TEXT NOT NULL CHECK (order_type IN ('pre_designed', 'custom_build', 'reference_image')),
  pre_designed_cake_id UUID REFERENCES pre_designed_cakes(id),
  -- Para custom_build
  size_choice TEXT,
  pan_choice UUID REFERENCES ingredients(id),
  relleno_choice UUID REFERENCES ingredients(id),
  cobertura_choice UUID REFERENCES ingredients(id),
  -- Para reference_image
  reference_image_url TEXT,
  description TEXT,
  -- Campos comunes
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'preparing', 'shipped', 'cancelled', 'delivered')),
  required_date DATE,
  notes TEXT,
  whatsapp_message TEXT, -- mensaje pre-generado
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Historial de estados del pedido
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Favoritos
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pre_designed_cake_id UUID REFERENCES pre_designed_cakes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, pre_designed_cake_id)
);

-- Configuración de la pastelería
CREATE TABLE bakery_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number TEXT NOT NULL,
  business_hours JSONB,
  theme TEXT DEFAULT 'system',
  social_links JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_ingredients_type ON ingredients(type);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
```

### 7.2 RLS (Row Level Security)

Para cada tabla, habilitar RLS y crear políticas granulares:

```sql
-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by owner and admin"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Orders: clientes ven sus propios pedidos, admin ve todos
CREATE POLICY "Users view own orders, admin view all"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Public: catálogo e ingredientes visibles para todos
CREATE POLICY "Catalog is public"
  ON pre_designed_cakes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Ingredients are public"
  ON ingredients FOR SELECT
  USING (is_active = true);
```

### 7.3 Storage

Buckets necesarios:
- `cake-images`: Imágenes de pasteles prediseñados e ingredientes.
- `reference-uploads`: Imágenes subidas por clientes para pedidos personalizados.

Políticas de Storage:
- `cake-images`: Público (lectura para todos, escritura solo admin).
- `reference-uploads`: Lectura para owner y admin, escritura para usuario autenticado.

### 7.4 Migraciones

Todas las migraciones SQL versionadas en `supabase/migrations/` usando `supabase migration new`:

```
supabase/migrations/
├── 20260725000001_create_profiles.sql
├── 20260725000002_create_ingredients.sql
├── 20260725000003_create_pre_designed_cakes.sql
├── 20260725000004_create_orders.sql
├── 20260725000005_create_favorites.sql
├── 20260725000006_create_bakery_settings.sql
├── 20260725000007_seed_ingredients.sql
└── 20260725000008_seed_cakes.sql
```

---

## 8. Mejores Prácticas

### 8.1 TypeScript (Strict Mode)

- **Const Types Pattern**: Objeto `const` primero, tipo extraído después. Nunca union types directos.

```typescript
const ORDER_STATUS = {
  RECEIVED: 'received',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  CANCELLED: 'cancelled',
  DELIVERED: 'delivered',
} as const;

type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
```

- **Flat Interfaces**: Sin objetos anidados inline. Cada nivel es su propio tipo.
- **Never `any`**: Usar `unknown` + type guards. Usar genéricos para flexibilidad.
- **Utility Types**: `Pick`, `Omit`, `Partial`, `Record`, `ReturnType` para composición.
- **Import Types**: `import type { X } from './types'` para tipos separados de runtime.
- **Type Guards**: Funciones `isX(value: unknown): value is X` para validación en runtime.

### 8.2 Tailwind CSS

- **Nunca usar `var()` en className**: Usar clases semánticas de Tailwind.
- **Nunca usar hex en className**: Usar tokens de color del theme config.
- **`cn()` utility**: Solo para clases condicionales o merge. No para clases estáticas.
- **Valores dinámicos**: Usar `style` prop para valores verdaderamente dinámicos.
- **Dark Mode**: Usar `dark:` variant con la clase `dark` en el HTML.
- **Responsive**: Mobile first — `sm:`, `md:`, `lg:`, `xl:` siempre progresivos.

### 8.3 Next.js (App Router)

- **Server Components por defecto**: Toda página y layout son server components a menos que necesiten interactividad.
- **Client Components explícitos**: Marcar con `'use client'` solo cuando se necesite estado, efectos, o event handlers del navegador.
- **Server Actions para mutaciones**: Usar `'use server'` para crear pedidos, actualizar perfiles, cambiar estados.
- **Data Fetching en Server Components**: Fetch directo desde el componente, no desde useEffect.
- **Suspense Boundaries**: Para cada sección que carga datos asíncronos, envolver en Suspense con fallback.

### 8.4 Supabase

- **Clientes SSR**: Usar `@supabase/ssr` con `createServerClient` para server components y middleware. Usar `createBrowserClient` para client components.
- **Middleware de autenticación**: Refrescar sesión en cada request via middleware.
- **Mínimas llamadas**: Una sola query con `select(*)` y joins en lugar de N queries.
- **Políticas RLS granulares**: Una política por operación (select, insert, update, delete) y por rol (anon, authenticated).
- **Buckets Storage**: Configurar `allowed_mime_types` y `file_size_limit` a nivel de bucket.
- **Database migrations**: Siempre versionadas. Nunca DDL directo en producción.

### 8.5 Rendimiento

- **Imágenes**: Usar `next/image` con lazy loading, tamaños responsivos y WebP.
- **Bundle**: Analizar con `@next/bundle-analyzer`. Dividir chunks pesados.
- **Streaming**: Usar `loading.tsx` y Suspense boundaries para carga progresiva.
- **Caching**: Configurar `stale-while-revalidate` para datos de catálogo (poco volátiles).

### 8.6 Accesibilidad

- **Touch targets**: Botones mín. 44x44px (ideal 48px según Apple HIG).
- **Contraste**: Cumplir WCAG AA (4.5:1 texto normal, 3:1 texto grande).
- **ARIA**: Labels en iconos solitarios, roles en elementos interactivos custom.
- **Focus**: Outline visible en navegación por teclado. `focus-visible:` para estilos.
- **Estados vacíos**: Ilustraciones informativas cuando no hay datos (no solo "no hay resultados").
- **Formularios**: Errores asociados a inputs via `aria-describedby`.

### 8.7 WhatsApp Integration

El pedido se envía mediante URL de WhatsApp generada dinámicamente:

```typescript
function generateWhatsAppUrl(phone: string, message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encoded}`;
}
```

Formato del mensaje del pedido:

```
🍰 *Nuevo Pedido - Pastello*
━━━━━━━━━━━━━━━━
👤 *Cliente:* {{nombre}}
📞 *Teléfono:* {{telefono}}

*Tipo:* {{tipo}} (Personalizado / Prediseñado)
*Tamaño:* {{tamaño}}
*Pan:* {{pan}}
*Relleno:* {{relleno}}
*Cobertura:* {{cobertura}}

💰 *Total:* ${{total}}
📅 *Fecha requerida:* {{fecha}}

{{#if descripcion}}
📝 *Descripción:* {{descripcion}}
{{/if}}

{{#if imagen_url}}
🖼️ *Imagen de referencia:* {{imagen_url}}
{{/if}}

━━━━━━━━━━━━━━━━
📍 *Pedido #{{id}}*
```

---

## 9. Estrategia de Pruebas

### 9.1 Stack de Testing

| Tipo | Herramienta | Propósito |
|------|------------|-----------|
| Unitario | Vitest + React Testing Library | Componentes UI + hooks + utils |
| Integración | Vitest + MSW | Flujos de datos, Server Actions |
| E2E | Playwright | Journeys completos del usuario |
| Visual | Playwright snapshot | Regresión visual de componentes |
| Base de datos | Vitest + Supabase local | Queries y RLS policies |

### 9.2 Configuración

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/*.stories.*'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

**playwright.config.ts:**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Mobile Chrome',
      use: { browserName: 'chromium', viewport: { width: 375, height: 812 } },
    },
  ],
});
```

### 9.3 Pruebas Unitarias

**Componentes UI** (por cada componente del Design System):

```typescript
describe('Button', () => {
  it('renders children text');
  it('applies primary variant styles');
  it('applies secondary variant styles');
  it('fires onClick when clicked');
  it('is disabled when disabled prop is true');
  it('shows loading state');
  it('meets minimum touch target of 44px');
});
```

**Hooks**:

```typescript
describe('useStepper', () => {
  it('initializes with first step');
  it('advances to next step');
  it('goes back to previous step');
  it('does not go below first step');
  it('does not exceed total steps');
  it('returns isFirstStep and isLastStep correctly');
});
```

**Utils**:

```typescript
describe('generateWhatsAppUrl', () => {
  it('formats phone number correctly');
  it('encodes message as URI component');
  it('handles phone with special characters');
  it('generates valid wa.me URL');
});
```

### 9.4 Pruebas de Integración

```typescript
describe('Order Creation Flow', () => {
  it('creates an order from pre-designed cake');
  it('creates an order from custom build (stepper)');
  it('creates an order from reference image');
  it('calculates total price correctly');
  it('generates WhatsApp message with order details');
});
```

### 9.5 Pruebas E2E (Playwright)

**Journeys Críticos:**

1. **Guest checkout flow** — Usuario invitado ve home → selecciona "Más pedidos" → elige pastel → envía por WhatsApp.
2. **Custom build flow** — Usuario logueado va a "Crear" → stepper completo (tamaño → pan → relleno → cobertura) → resumen → WhatsApp.
3. **Reference image flow** — Usuario sube imagen → completa formulario → envía.
4. **Auth flow** — Registro con email → login → Google OAuth → modo invitado.
5. **Order tracking** — Usuario ve lista de pedidos → abre detalle → ve timeline → contacta por WhatsApp.
6. **Admin kanban** — Admin ve dashboard → arrastra pedido entre columnas → cambia estado.

### 9.6 Pruebas de Regresión Visual

- Playwright snapshot tests para cada pantalla en light y dark mode.
- Breakpoints: 375px (mobile), 768px (tablet), 1280px+ (desktop).

### 9.7 Comandos de Testing

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:chromium": "playwright test --project=chromium",
    "test:all": "vitest run && playwright test"
  }
}
```

---

## 10. CI/CD y Despliegue

### 10.1 Pipeline de CI (GitHub Actions)

**Archivo**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}

jobs:
  quality:
    name: Quality Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm tsc --noEmit

      - name: Lint
        run: pnpm lint

      - name: Unit & Integration tests
        run: pnpm test:run --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  e2e:
    name: E2E Tests
    needs: quality
    runs-on: ubuntu-latest
    services:
      postgres:
        image: supabase/postgres:15.6.1.116
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm & Node.js
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm playwright install chromium

      - name: Start Supabase local
        run: |
          pnpm supabase start
          pnpm supabase db push

      - name: Build app
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  preview:
    name: Deploy Preview
    needs: e2e
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          github-comment: true
          github-deployment: true
```

### 10.2 Pipeline de CD (Deploy a Producción)

**Archivo**: `.github/workflows/cd.yml`

```yaml
name: CD

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm & Node.js
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm tsc --noEmit

      - name: Lint
        run: pnpm lint

      - name: Run tests
        run: pnpm test:run

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Apply Supabase migrations
        run: pnpm supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

### 10.3 Despliegue en Vercel

**Configuración del proyecto en Vercel:**

| Configuración | Valor |
|--------------|-------|
| Framework | Next.js (auto-detected) |
| Build Command | `next build` (default) |
| Output Directory | `.next` (default) |
| Install Command | `pnpm install` |
| Node.js Version | 20.x |

**Environment Variables** (configuradas en Vercel Dashboard):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo preview/prod)
- `NEXT_PUBLIC_APP_URL`

**Preview Deployments**: Cada PR genera un preview automático en Vercel con su propia base de datos Supabase branch.

### 10.4 Supabase Branching (Preview Environments)

Para cada PR, crear una branch de Supabase:

```bash
supabase branches create ${{ github.head_ref }} --project-id ${{ secrets.SUPABASE_PROJECT_ID }}
```

Esto nos da un entorno aislado para testing de integración en cada PR.

### 10.5 Scripts de package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:db:push": "supabase db push",
    "supabase:migration:new": "supabase migration new",
    "supabase:types": "supabase gen types typescript --local > src/types/supabase.ts",
    "db:migrate": "supabase db push",
    "db:seed": "supabase db execute --file supabase/seed.sql"
  }
}
```

---

## 11. Métricas de Éxito

### 11.1 Indicadores Técnicos

| Métrica | Objetivo | Herramienta |
|---------|----------|------------|
| Lighthouse Performance | ≥ 90 | Lighthouse CI |
| Lighthouse Accessibility | ≥ 95 | Lighthouse CI |
| Lighthouse Best Practices | ≥ 95 | Lighthouse CI |
| Core Web Vitals (LCP, FID, CLS) | Good | Vercel Analytics |
| Test Coverage | ≥ 80% | Vitest + Codecov |
| Bundle Size (initial JS) | < 100KB | @next/bundle-analyzer |
| Time to Interactive (mobile) | < 3s | Lighthouse |

### 11.2 Indicadores de Producto

| Métrica | Objetivo |
|---------|----------|
| Tasa de conversión (home → pedido) | > 15% |
| Pedidos personalizados vs prediseñados | 60/40 |
| Tiempo promedio en constructor | < 3 min |
| Pedidos vía WhatsApp (conversión) | > 80% |
| Usuarios que completan el stepper | > 70% |

---

## 12. Roadmap y Fases

### Fase 1 — MVP (Semanas 1-4)
- [ ] Setup del proyecto: Next.js + TypeScript + Tailwind + Supabase
- [ ] Design System: Tokens, componentes base (Button, Card, Input, Stepper, BottomNav)
- [ ] Autenticación: Email + Google + Invitado
- [ ] Home + "Más pedidos" carrusel
- [ ] Constructor de pastel (Stepper 5 pasos)
- [ ] Generación de mensaje WhatsApp y envío
- [ ] Migraciones SQL base + RLS

### Fase 2 — Órdenes y Seguimiento (Semanas 5-6)
- [ ] "Mis pedidos" + detalle con timeline
- [ ] Pastel personalizado (subir imagen)
- [ ] Panel admin: Dashboard con métricas
- [ ] Panel admin: Kanban de pedidos

### Fase 3 — Administración (Semanas 7-8)
- [ ] Panel admin: CRUD de ingredientes
- [ ] Panel admin: CRUD de pasteles prediseñados
- [ ] Configuración (WhatsApp, horarios, tema)
- [ ] Favoritos + compartir
- [ ] Dark Mode completo

### Fase 4 — Pulido y Producción (Semanas 9-10)
- [ ] Animaciones y microinteracciones restantes
- [ ] Pruebas E2E (Playwright) completas
- [ ] CI/CD pipelines
- [ ] Lighthouse audit y optimización
- [ ] PWA (manifest, service worker)
- [ ] Despliegue a producción

---

## Apéndice A: Glosario

| Término | Definición |
|---------|-----------|
| **Glassmorphism** | Efecto visual con transparencia, blur y sombras que simula vidrio esmerilado |
| **Stepper** | Componente de navegación multi-paso con progreso visual |
| **RLS** | Row Level Security — políticas de acceso a nivel de fila en PostgreSQL |
| **Server Action** | Función asíncrona que corre en el servidor, invocable desde el cliente |
| **Surface Token** | Variable de diseño que define el color de fondo según el nivel de elevación |
| **Stack Token** | Variable de espaciado vertical entre elementos |

## Apéndice B: Recursos

| Recurso | URL |
|---------|-----|
| Next.js App Router Docs | https://nextjs.org/docs |
| Supabase SSR Guide | https://supabase.com/docs/guides/auth/server-side |
| Supabase Local Dev | https://supabase.com/docs/guides/local-development |
| Tailwind CSS Docs | https://tailwindcss.com/docs |
| Vitest | https://vitest.dev/ |
| Playwright | https://playwright.dev/ |
| Vercel Deploy | https://vercel.com/docs |
| Material Symbols | https://fonts.google.com/icons |
