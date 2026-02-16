// Make dotenv optional so Prisma commands don't fail when it's not installed.
try {
  require('dotenv/config');
} catch {
  // ignore if dotenv is not installed
}
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
