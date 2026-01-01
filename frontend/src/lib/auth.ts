import {betterAuth} from "better-auth";
import {DatabaseSync} from "node:sqlite";
import { Pool } from "pg";
import {nextCookies} from "better-auth/next-js";
import {admin as adminPlugin, jwt} from "better-auth/plugins"
import {ac, user, admin, lecturer} from "@/lib/permissions";

const isProd = process.env.NODE_ENV === "production";

let db;
if (!isProd) {
  db = new DatabaseSync("../sqlite.db")
} else {
  // db = new Pool({
  //   connectionString: process.env.BA_DATABASE_URL
  // })
  db = new DatabaseSync("../sqlite.db")

}

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies(), adminPlugin({
    ac,
    roles: {
      admin,
      user,
      lecturer
    }
  }),
  jwt({
    jwt: {
      definePayload: ({user}) => {
        return {
          id: user.id,
          role: user.role,
        }
    }
    }
  }),]
})