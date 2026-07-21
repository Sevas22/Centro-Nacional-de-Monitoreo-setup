import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// El resto del proyecto usa .env.local (convención Next.js); Prisma CLI no lo carga solo.
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Conexión directa (no pooled) para migraciones/introspección — ver lib/db.ts para runtime.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
