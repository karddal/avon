import { DatabaseSync } from "node:sqlite";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, jwt } from "better-auth/plugins";
import { Pool } from "pg";
import { ac, admin, lecturer, user } from "@/lib/permissions";

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  database: !isProd
    ? new DatabaseSync("../sqlite.db")
    : new Pool({
        connectionString: process.env.BA_DATABASE_URL,
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
