"use server";

// TODO: Probably WONT WORK ON PROD bc of SQLDB being directly checked

import { DatabaseSync, type SQLOutputValue } from "node:sqlite";
import { Pool } from "pg";

const pgPool =
  process.env.NODE_ENV === "production"
    ? new Pool({ connectionString: process.env.BA_DATABASE_URL })
    : null;

export async function get_batch_user_info(user_ids: string[]) {
  if (user_ids.length === 0) return [];

  const isProd = process.env.NODE_ENV === "production";

  if (isProd && pgPool) {
    const query = `
      SELECT id, name, image 
      FROM "user" 
      WHERE id = ANY($1::text[])
    `;
    const result = await pgPool.query(query, [user_ids]);

    return result.rows.map((row) => ({
      id: row.id,
      displayName: row.name || "Unknown",
      src: row.image,
    }));
  } else {
    const db = new DatabaseSync("../sqlite.db");

    const placeholders = user_ids.map(() => "?").join(",");
    const queryStr = `SELECT id, name, image FROM user WHERE id IN (${placeholders})`;

    const statement = db.prepare(queryStr);
    const results = statement.all(...user_ids) as Record<
      string,
      SQLOutputValue
    >[];

    return results.map((row) => ({
      id: row.id,
      displayName: row.name || "Unknown",
      src: row.image,
    }));
  }
}
