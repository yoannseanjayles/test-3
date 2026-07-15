import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Renseignée en local via .env.local ; les migrations générées sont versionnées.
    url: process.env.DATABASE_URL ?? "postgresql://localhost/cineplus",
  },
});
