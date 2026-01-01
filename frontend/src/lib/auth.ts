import { headers } from "next/headers";

export async function getCurrentUser() {
  const headersList = await headers();
  const userRole = headersList.get("x-user-role");

  return userRole;
}

import {betterAuth} from "better-auth";
import { Database } from "bun:sqlite";
import { Pool } from "pg";
import {nextCookies} from "better-auth/next-js";

const isProd = process.env.NODE_ENV === "production";

let db;
if (!isProd) {
  db = new Database("./sqlite.db")
} else {
  db = new Pool({
    connectionString: process.env.BA_DATABASE_URL
  })
}

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()]
})