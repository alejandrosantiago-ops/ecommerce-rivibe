import { defineConfig } from "prisma/config"

// Node ≥ 20.12 lee el .env sin dependencias extra (en vez de "dotenv/config")
try {
  process.loadEnvFile(".env")
} catch {
  // Sin .env: se usan las variables de entorno del sistema (ej. en producción)
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Migraciones: en Neon usa la conexión directa (DIRECT_URL); la app usa la "pooled" (DATABASE_URL).
  // Sin DIRECT_URL (en local) se usa DATABASE_URL.
  datasource: {
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
})
