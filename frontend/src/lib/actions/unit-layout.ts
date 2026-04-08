"use server";

import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { GridItem } from "@/components/modules/unit-types";
import { pool } from "@/lib/actions/db_pool";
import { requireSession } from "@/lib/auth-utils";
import {
  defaultUnitLayout,
  parseUnitLayout,
} from "@/lib/unit-layout";

var dbPath = "../sqlite.db";
if (process.env.CI_MODE === "True") {
  dbPath = path.resolve(process.cwd(), "../../..", "sqlite.db");
}

function isProductionDatabase() {
  return (
    process.env.NODE_ENV === "production" && process.env.TESTING_MODE !== "True"
  );
}

async function ensureUnitLayoutColumnExists(): Promise<void> {
  if (isProductionDatabase()) {
    await pool.query(
      'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS dashboard_layout text',
    );
    return;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const columns = db.prepare("PRAGMA table_info(user)").all() as Array<{
    name: string;
  }>;
  const hasUnitLayoutColumn = columns.some(
    (column) => column.name === "dashboard_layout",
  );

  if (!hasUnitLayoutColumn) {
    db.exec("ALTER TABLE user ADD COLUMN dashboard_layout TEXT");
  }
}

async function getRawUnitLayout(userId: string): Promise<string | null> {
  await ensureUnitLayoutColumnExists();

  if (isProductionDatabase()) {
    const result = await pool.query(
      'SELECT dashboard_layout FROM "user" WHERE id = $1',
      [userId],
    );

    const row = result.rows[0] as
      | { dashboard_layout: string | null }
      | undefined;
    return row?.dashboard_layout ?? null;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const query = db.prepare("SELECT dashboard_layout FROM user WHERE id = ?");
  const result = query.get(userId) as
    | { dashboard_layout: string | null }
    | undefined;

  return result?.dashboard_layout ?? null;
}

export async function getUnitLayoutForCurrentUser(): Promise<GridItem[]> {
  const session = await requireSession();

  try {
    const rawLayout = await getRawUnitLayout(session.user.id);
    return parseUnitLayout(rawLayout) ?? defaultUnitLayout;
  } catch (error) {
    console.error("Failed to load unit layout from database", error);
    return defaultUnitLayout;
  }
}

export async function saveUnitLayoutForCurrentUser(
  layout: GridItem[],
): Promise<void> {
  const session = await requireSession();
  const parsedLayout = parseUnitLayout(JSON.stringify(layout));

  if (!parsedLayout) {
    throw new Error("Invalid dashboard layout");
  }

  const serializedLayout = JSON.stringify(parsedLayout);
  const updatedAt = new Date().toISOString();

  await ensureUnitLayoutColumnExists();

  if (isProductionDatabase()) {
    await pool.query(
      'UPDATE "user" SET dashboard_layout = $1, "updatedAt" = $2 WHERE id = $3',
      [serializedLayout, updatedAt, session.user.id],
    );
    return;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const query = db.prepare(
    "UPDATE user SET dashboard_layout = ?, updatedAt = ? WHERE id = ?",
  );
  query.run(serializedLayout, updatedAt, session.user.id);
}
