import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

let connectionString = databaseUrl;
// Hilangkan warning deprecation driver pg di log Vercel jika masih memakai sslmode=require
if (
  connectionString.includes("sslmode=require") &&
  !connectionString.includes("sslmode=verify-full") &&
  !connectionString.includes("uselibpqcompat")
) {
  connectionString = connectionString.replace("sslmode=require", "sslmode=verify-full");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
