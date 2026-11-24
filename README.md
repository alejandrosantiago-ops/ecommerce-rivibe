# RIVIBE — tienda online (demo)

Next.js 16 · Tailwind v4 · PostgreSQL · Prisma 7. Plan y avance por fases en [`PLAN.md`](PLAN.md).

## En tu computadora (después de clonar el repo)

**Requisitos:** Node.js 20.12 o más nuevo y una base de datos **PostgreSQL**. La base de datos **no viene en el repo**: cada persona usa la suya. Tienes dos opciones:

- **PostgreSQL local**: instálalo (postgresql.org/download) y crea una base vacía llamada `rivibe` (por ejemplo, desde pgAdmin).
- **Neon** (neon.tech, gratis y sin instalar nada): crea un proyecto y copia la *connection string*.

Luego:

```bash
cp .env.example .env        # en PowerShell: Copy-Item .env.example .env
#   → abre .env y pon TU DATABASE_URL (usuario, clave y base de datos de tu PostgreSQL o de Neon)
npm install                 # instala dependencias y genera el cliente de Prisma
npm run db:setup            # crea las tablas y carga catálogo, portada, datos de ejemplo y el administrador
npm run dev                 # http://localhost:3000  ·  panel: /admin
```

Entra al panel `/admin` con el `ADMIN_EMAIL` y `ADMIN_PASSWORD` que pusiste en el `.env`.
`npm run admin:create` crea el administrador o le cambia la contraseña.

### Errores comunes con la base de datos

| Mensaje | Qué pasa | Solución |
|---|---|---|
| `Falta DATABASE_URL` / `datasource.url is required` | No existe el archivo `.env` | Copia `.env.example` a `.env` y complétalo |
| `P1000: Authentication failed` | Usuario o clave incorrectos en `DATABASE_URL` | Usa la clave que pusiste al instalar PostgreSQL |
| `P1001: Can't reach database server` | PostgreSQL no está encendido o la URL está mal | Inicia el servicio de PostgreSQL o revisa la URL |
| `P1003: Database rivibe does not exist` | La base de datos no existe | Créala en pgAdmin (`CREATE DATABASE rivibe;`) |
| `The table ... does not exist` (P2021) | No se crearon las tablas | Ejecuta `npm run db:setup` |
| Error al importar `@/generated/prisma` | No se generó el cliente | Ejecuta `npm run db:generate` |

Si cambias el esquema (`prisma/schema.prisma`), crea una migración con `npm run db:migrate` y súbela a GitHub junto con el cambio.

## Panel de administración (`/admin`)

- **Productos**: nombre, descripción, precios (unitario, +3 y +5 u.), fotos, colores, stock por talla, piezas de los packs, publicar/ocultar, orden.
- **Secciones**: crear, renombrar, cambiar portada, ordenar y borrar secciones del menú Productos.
- **Página de inicio**: editar textos, fotos y botones de cada bloque, ordenar, ocultar y agregar bloques nuevos (banner, grilla de productos, texto).

Los cambios se ven en la tienda en cuanto se guardan.

## Publicar en internet (Vercel + Neon)

El `.env` **no se sube a GitHub**: tiene contraseñas, y su `DATABASE_URL` apunta a `localhost` (tu PC), a la que un servidor de internet no puede entrar. En línea se usa una base de datos en la nube y las variables se guardan en Vercel.

1. **Neon** (neon.tech, gratis): crea un proyecto y copia la *connection string* (`postgresql://…?sslmode=require`).
2. **Cargar datos en Neon** desde tu PC (una sola vez):
   ```bash
   # PowerShell
   $env:DATABASE_URL="postgresql://…neon…?sslmode=require"; npx prisma migrate deploy; npm run db:seed
   ```
3. **Cloudinary** (cloudinary.com, gratis): copia la *API Environment variable* (`cloudinary://…`).
4. **Vercel** (vercel.com → *Add New Project* → importa el repo de GitHub). En *Environment Variables* agrega:
   `DATABASE_URL` (la de Neon *pooled*, con `-pooler` en el host), `DIRECT_URL` (la de Neon directa, para migraciones), `CLOUDINARY_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Luego *Deploy*.

Vercel ejecuta `vercel-build` (`prisma migrate deploy && next build`), así que los cambios futuros del esquema se aplican solos en cada despliegue.
