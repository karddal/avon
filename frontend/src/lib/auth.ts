import { DatabaseSync } from "node:sqlite";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, jwt } from "better-auth/plugins";
import { Pool } from "pg";
import { ac, admin, lecturer, user } from "@/lib/permissions";
import {
  getSqliteDbPath,
  shouldUseExternalDatabase,
} from "@/lib/server-runtime";

const dbPath = getSqliteDbPath();
const useSqlite = !shouldUseExternalDatabase();

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
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // stops users setting it during signup
      },
    },
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
