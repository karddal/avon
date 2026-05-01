import { DatabaseSync } from "node:sqlite";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, bearer, jwt } from "better-auth/plugins";
import { Pool } from "pg";
import { ac, admin, lecturer, user } from "@/lib/permissions";
import {
  getSqliteDbPath,
  shouldUseExternalDatabase,
} from "@/lib/server-runtime";

const dbPath = getSqliteDbPath();
const useSqlite = !shouldUseExternalDatabase();
const configuredTrustedOrigins =
  process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];
const productionTrustedOrigins = ["https://avon.ac", "https://www.avon.ac"];

const trustedOrigins = [
  ...(process.env.NODE_ENV === "production" ? productionTrustedOrigins : []),
  ...configuredTrustedOrigins,
  ...(process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:3000", "https://localhost:3000"]),
];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  rateLimit: {
    enabled: process.env.TESTING_MODE !== "True",
  },
  database: useSqlite
    ? new DatabaseSync(dbPath, { timeout: 5000 })
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
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
        lecturer,
      },
      impersonationSessionDuration: 60 * 60 * 24 * 7,
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
    bearer(),
    nextCookies(),
  ],
});
