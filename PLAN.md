# RIVIBE — Plan del ecommerce

Tienda online de ropa para hombre (polo oversize, polo boxyfit, camisero, tanktop, jogger, hoodies, conjuntos…).
Envíos a todo el Perú vía Shalom.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · shadcn/ui (Base UI) · PostgreSQL · Prisma
**Sistema visual:** `DESIGN.md` (lookbook editorial: blanco/negro, tipografía sans fina, radios 0px/4px, sin sombras).

---

## Fase 1 — Diseño de UI (completa)

Todas las pantallas navegables. Datos en `src/lib/catalog.ts` (precios y colores del catálogo de octubre 2026),
estado de cliente (carrito y favoritos) en `localStorage` mediante `src/lib/store.ts`.

- [x] Tokens del `DESIGN.md`, logos negro/blanco, favicon con el logo RIVIBE
- [x] Barra "ENVÍOS A NIVEL NACIONAL VÍA SHALOM", header con PRODUCTOS · CATÁLOGO · CONJUNTOS · OFERTAS · CONTACTO
- [x] Menú Productos por secciones (panel en escritorio, acordeón en móvil)
- [x] Hero a pantalla completa con 2 slides (escritorio y móvil)
- [x] Home: secciones, más vendidos, ofertas Shopping Days, precios por volumen, conjuntos, beneficios
- [x] `/productos` y `/productos/[categoria]` — por secciones, con orden por precio
- [x] `/catalogo` — todos los productos con agregar rápido (color + talla)
- [x] `/conjuntos` y `/ofertas` — talla distinta por cada pieza
- [x] `/producto/[slug]` — galería por color, tabla 1–2 / 3–4 / 5+ u., tallas por pieza, guía de tallas
- [x] **Precio por volumen** (`src/lib/pricing.ts`): +3 y +5 u. del MISMO producto, colores y tallas libres
- [x] Carrito (panel y `/carrito`), `/checkout` (datos, agencia Shalom, Yape/Plin/transferencia), `/favoritos`
- [x] `/contacto` (formulario + fotos), `/cuenta` (login/registro), `/guia-de-tallas`, `/ayuda`, 404, buscador
- [x] Botón flotante de WhatsApp (verde), Instagram y TikTok reales

- [x] Ofertas Shopping Days (7 packs, productos fijos de cada foto, talla por prenda; "Polera Star o Casaca" con opción)
- [x] Hero panorámico: el modelo se ve completo en cualquier ancho de pantalla
- [x] **Panel de administración (solo diseño)** en `/admin`: resumen (ventas, KPIs, más vendidos, stock bajo),
      productos (tabla + formulario de edición), pagos (verificación de Yape/Plin/transferencias), usuarios
      (clientes y administradores, invitar admin) y `/admin/login`. Datos de ejemplo en `src/lib/admin-data.ts`.

## Fase 2 — Base de datos (PostgreSQL + Prisma) · completa

PostgreSQL 18 local (servicio `postgresql-x64-18`), Prisma 7.10.1 con adaptador `@prisma/adapter-pg`.

- [x] Prisma instalado; config en `prisma7.config.ts` (lee `.env` con `process.loadEnvFile`)
- [x] Esquema `prisma/schema.prisma`: Category, Color, Product, ProductColor, ProductImage, ProductVariant
      (stock por color+talla), PriceTier (+3/+5 u.), BundlePiece (tallas/opciones por pieza), SizeGuide,
      User (CLIENTE/ADMIN), Cart/CartItem, Order/OrderItem (copia de precios), Payment (Yape/Plin/transferencia),
      ContactMessage. El envío Shalom va dentro de Order.
- [x] Seed `prisma/seed.ts`: catálogo real desde `src/lib/catalog-data.ts` + usuarios/pedidos/pagos de ejemplo
      (`SEED_DEMO=false` para solo catálogo)
- [x] Capa de datos `src/lib/data/catalog.ts` con `"use cache"` + `cacheTag("catalog")`; la tienda ya lee de la BD
      y los componentes de cliente reciben el catálogo por `CatalogProvider`
- [x] Scripts: `npm run db:migrate`, `db:seed`, `db:reset`, `db:studio`, `db:generate`
- [x] `DATABASE_URL` configurada; BD `rivibe` en PostgreSQL 18.6
- [x] Migración `20261104051239_init` aplicada; seed: 7 categorías, 36 colores, 20 productos, 291 variantes,
      4 guías de tallas, 18 usuarios y 16 pedidos con pago de ejemplo
- [x] Build y prueba en navegador contra la BD: páginas, precio por volumen en carrito, buscador y 404
- [ ] El panel `/admin` sigue con datos de ejemplo (se conecta en la fase 5)

## Fase 3 — Lógica de tienda · completa

- [x] Carrito en BD (`Cart`/`CartItem`) con cookie de sesión `rivibe_cart` (httpOnly, 60 días) y Server Actions
      (`src/app/actions/cart.ts`): agregar, cambiar cantidad, quitar, vaciar. El navegador actualiza al instante y
      el servidor confirma (precio y stock los decide el servidor). Migra el carrito antiguo de localStorage.
- [x] Precio por volumen: por producto (+3 / +5 u.), colores y tallas libres. Se recalcula en el servidor al
      crear el pedido (`priceCart` es una función pura compartida).
- [x] Stock por variante: tallas agotadas deshabilitadas, colores sin stock tachados, "Últimas N unidades",
      etiqueta "Agotado", cantidad limitada al stock; validación en servidor (`src/lib/cart/validate.ts`).
- [x] Pedidos reales desde `/checkout` (`src/app/actions/order.ts`): validación de datos (DNI, celular, Shalom),
      transacción con descuento atómico de stock, pago Yape/Plin/transferencia "por verificar", número RV-AAMMDD-XXXX.
- [x] Formulario de contacto guarda en `ContactMessage` (`src/app/actions/contact.ts`), con campo trampa anti-bots.
- [x] Filtros en catálogo y secciones: color, precio (por volumen), solo con stock + orden.
- [ ] Pendiente: los favoritos siguen en el navegador (pasan a la cuenta del usuario en la fase 5).

## Fase 4 — Checkout y pagos

- ~~Checkout en 3 pasos~~ (hecho en la fase 3, con pago manual Yape/Plin/transferencia)
- Pasarela peruana (Culqi / Mercado Pago / Izipay) + opción Yape/Plin con confirmación manual
- Correos de confirmación (Resend), seguimiento del pedido

## Fase 5 — Administración

- Conectar el panel `/admin` (ya diseñado) a Prisma y protegerlo con Auth.js (rol ADMIN) desde `proxy.ts`
- Subida de imágenes (Vercel Blob / Cloudinary)

## Fase 6 — Lanzamiento

- SEO (metadata por producto, sitemap, Open Graph), analítica, Pixel de Meta/TikTok
- Rendimiento (imágenes optimizadas, ISR/caché), accesibilidad
- Deploy (Vercel + Postgres gestionado: Neon/Supabase), dominio
