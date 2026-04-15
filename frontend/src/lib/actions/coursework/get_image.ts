"use server";

import { DatabaseSync } from "node:sqlite";
import { pool } from "@/lib/actions/auth/db_pool";
import {
  getSqliteDbPath,
  shouldUseExternalDatabase,
} from "@/lib/server-runtime";

const dbPath = getSqliteDbPath();

export async function get_user_image_from_id(user_id: string): Promise<string> {
  const isProd = shouldUseExternalDatabase();

  if (isProd) {
    const db = pool;

    const result = await db.query('SELECT image from "user" WHERE id = $1', [
      user_id,
    ]);
    const out = result.rows[0];
    if (!out) {
      throw new Error("cannot find user in db");
    }
    return out;
  } else {
    const db = new DatabaseSync(dbPath);
    const _session = db.createSession();
    const query = db.prepare("SELECT image FROM user WHERE id = ?");
    const result = query.get(user_id) as { name: string } | undefined;
    if (!result) {
      throw new Error("cannot find user in db");
    }

    return result.name;
  }
}
