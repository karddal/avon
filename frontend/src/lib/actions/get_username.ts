"use server";

import "node:sqlite";
import { DatabaseSync } from "node:sqlite";
import { pool } from "@/lib/actions/db_pool";

export async function get_username_from_id(user_id: string): Promise<string> {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    const db = pool;

    const result = await db.query('SELECT name from "user" WHERE id = $1', [
      user_id,
    ]);
    const out = result.rows[0];
    if (!out) {
      throw new Error("cannot find user in db");
    }
    return out.name;
  } else {
    const db = new DatabaseSync("../sqlite.db");
    const _session = db.createSession();
    const query = db.prepare("SELECT name FROM user WHERE id = ?");
    const result = query.get(user_id) as { name: string } | undefined;
    if (!result) {
      throw new Error("cannot find user in db");
    }

    return result.name;
  }
}
