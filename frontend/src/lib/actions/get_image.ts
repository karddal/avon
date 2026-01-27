"use server";

import { DatabaseSync } from "node:sqlite";
import { Pool } from "pg";

export async function get_user_image_from_id(user_id: string): Promise<string> {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    const db = new Pool({
      connectionString: process.env.BA_DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    const result = await db.query("SELECT image from user WHERE id = ?", [
      user_id,
    ]);
    const out = result.rows[0];
    if (!out) {
      throw new Error("cannot find user in db");
    }
    return out;
  } else {
    const db = new DatabaseSync("../sqlite.db");
    const _session = db.createSession();
    const query = db.prepare("SELECT image FROM user WHERE id = ?");
    const result = query.get(user_id) as { name: string } | undefined;
    if (!result) {
      throw new Error("cannot find user in db");
    }

    return result.name;
  }
}
