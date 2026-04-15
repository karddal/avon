"use server";

import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { GridItem } from "@/components/modules/unit-types";
import { pool } from "@/lib/actions/auth/db_pool";
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

function normalizeSqliteUuid(id: string): string {
  return id.replace(/-/g, "");
}

async function ensureUnitLayoutColumnExists(): Promise<void> {
  if (isProductionDatabase()) {
    await pool.query(
      'ALTER TABLE "unit" ADD COLUMN IF NOT EXISTS unit_layout text',
    );
    return;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const columns = db.prepare("PRAGMA table_info(unit)").all() as Array<{
    name: string;
  }>;
  const hasUnitLayoutColumn = columns.some(
    (column) => column.name === "unit_layout",
  );

  if (!hasUnitLayoutColumn) {
    db.exec("ALTER TABLE unit ADD COLUMN unit_layout TEXT");
  }
}

async function getRawUnitLayout(unitId: string): Promise<string | null> {
  await ensureUnitLayoutColumnExists();

  if (isProductionDatabase()) {
    const result = await pool.query(
      'SELECT unit_layout FROM "unit" WHERE id = $1',
      [unitId],
    );

    const row = result.rows[0] as
      | { unit_layout: string | null }
      | undefined;
    return row?.unit_layout ?? null;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const sqliteUnitId = normalizeSqliteUuid(unitId);
  const query = db.prepare("SELECT unit_layout FROM unit WHERE id = ?");
  const result = query.get(sqliteUnitId) as
    | { unit_layout: string | null }
    | undefined;

  return result?.unit_layout ?? null;
}

export async function getUnitLayoutForCurrentUnit(unitId: string): Promise<GridItem[]> {
  try {
    const rawLayout = await getRawUnitLayout(unitId);
    return parseUnitLayout(rawLayout) ?? defaultUnitLayout;
  } catch (error) {
    console.error("Failed to load unit layout from database", error);
    return defaultUnitLayout;
  }
}

export async function saveUnitLayoutForCurrentUnit(
  layout: GridItem[],
  unitId: string
): Promise<void> {
  const parsedLayout = parseUnitLayout(JSON.stringify(layout));

  if (!parsedLayout) {
    throw new Error("Invalid unit layout");
  }

  const serializedLayout = JSON.stringify(parsedLayout);

  await ensureUnitLayoutColumnExists();

  if (isProductionDatabase()) {
    await pool.query(
      'UPDATE "unit" SET unit_layout = $1 WHERE id = $2',
      [serializedLayout, unitId],
    );
    return;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const sqliteUnitId = normalizeSqliteUuid(unitId);
  const query = db.prepare(
    "UPDATE unit SET unit_layout = ? WHERE id = ?",
  );
  query.run(serializedLayout, sqliteUnitId);
}
