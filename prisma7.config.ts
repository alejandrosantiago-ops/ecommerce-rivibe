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
  datasource: {
    url: process.env["DATABASE_URL"],
  },
})
