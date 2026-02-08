"use server";

import { DatabaseSync } from "node:sqlite";
import { api_seed } from "@/scripts/seed_api";
import { headers } from "next/headers";
import { requireAdminSession } from "@/lib/auth-utils";

export async function seedDatabase() {
  const s = await requireAdminSession();

  try {
    const db = new DatabaseSync("../sqlite.db");
    await api_seed(db);
    db.close();

    return { success: true };
  } catch (error) {
    console.error("Seed error:", error);
    return { success: false, error: String(error) };
  }
}
