import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, jwt } from "better-auth/plugins";
import { Pool } from "pg";
import { ac, admin, lecturer, user } from "@/lib/permissions";

var dbPath = "../sqlite.db";
// if (process.env.CI_MODE === "True") {
//   dbPath = path.resolve(process.cwd(), "../../..", "sqlite.db");
// }

console.log(dbPath);

const useSqlite =
  process.env.NODE_ENV !== "production" || process.env.TESTING_MODE === "True";

export const auth = betterAuth({
  database: useSqlite
    ? new DatabaseSync(dbPath)
    : new Pool({
        connectionString: process.env.BA_DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
        lecturer,
      },
    }),
    jwt({
      jwt: {
        definePayload: ({ user }) => {
          return {
            id: user.id,
            role: user.role,
          };
        },
      },
    }),
  ],
});
