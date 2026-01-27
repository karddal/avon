"use server";

import { DatabaseSync } from "node:sqlite";
import { Pool } from "pg";
import {pool} from "@/lib/actions/db_pool";


export async function delete_user(
  user_id: string,
): Promise<{ success: boolean; msg: string }> {
  const isProd = process.env.NODE_ENV === "production";

  try {
    if (isProd) {
      const result = await pool.query('DELETE FROM "user" WHERE id = $1', [
        user_id,
      ]);

      if (result.rowCount === 0) {
        return { success: false, msg: "User not found" };
      }

      return { success: true, msg: "User deleted successfully" };
    } else {
      const db = new DatabaseSync("../sqlite.db");
      const query = db.prepare("DELETE FROM user WHERE id = ?");

      const result = query.run(user_id) as { changes: number };

      if (result.changes === 0) {
        return { success: false, msg: "User not found" };
      }

      return { success: true, msg: "User deleted successfully" };
    }
  } catch (error) {
    console.error("Database error during deletion:", error);
    return { success: false, msg: "Internal server error" };
  }
}
