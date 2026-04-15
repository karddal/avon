"use server";

import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { GridItem } from "@/components/modules/coursework_layout/coursework-types";
import { pool } from "@/lib/actions/auth/db_pool";
import {
  defaultCourseworkLayout,
  parseCourseworkLayout,
} from "@/lib/coursework-layout";

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

async function ensureCourseworkLayoutColumnExists(): Promise<void> {
  if (isProductionDatabase()) {
    await pool.query(
      'ALTER TABLE "coursework" ADD COLUMN IF NOT EXISTS coursework_layout text',
    );
    return;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const columns = db.prepare("PRAGMA table_info(coursework)").all() as Array<{
    name: string;
  }>;
  const hasCourseworkLayoutColumn = columns.some(
    (column) => column.name === "coursework_layout",
  );

  if (!hasCourseworkLayoutColumn) {
    db.exec("ALTER TABLE coursework ADD COLUMN coursework_layout TEXT");
  }
}

async function getRawCourseworkLayout(courseworkId: string): Promise<string | null> {
  await ensureCourseworkLayoutColumnExists();

  if (isProductionDatabase()) {
    const result = await pool.query(
      'SELECT coursework_layout FROM "coursework" WHERE id = $1',
      [courseworkId],
    );

    const row = result.rows[0] as
      | { coursework_layout: string | null }
      | undefined;
    return row?.coursework_layout ?? null;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const sqliteCourseworkId = normalizeSqliteUuid(courseworkId);
  const query = db.prepare("SELECT coursework_layout FROM coursework WHERE id = ?");
  const result = query.get(sqliteCourseworkId) as
    | { coursework_layout: string | null }
    | undefined;

  return result?.coursework_layout ?? null;
}

export async function getCourseworkLayoutForCurrentCoursework(cw_id: string): Promise<GridItem[]> {
  try {
    const rawLayout = await getRawCourseworkLayout(cw_id);
    return parseCourseworkLayout(rawLayout) ?? defaultCourseworkLayout;
  } catch (error) {
    console.error("Failed to load coursework layout from database", error);
    return defaultCourseworkLayout;
  }
}

export async function saveCourseworkLayoutForCurrentCoursework(
  layout: GridItem[], cw_id: string
): Promise<void> {
  const parsedLayout = parseCourseworkLayout(JSON.stringify(layout));

  if (!parsedLayout) {
    throw new Error("Invalid coursework layout");
  }

  const serializedLayout = JSON.stringify(parsedLayout);

  await ensureCourseworkLayoutColumnExists();

  if (isProductionDatabase()) {
    await pool.query(
      'UPDATE "coursework" SET coursework_layout = $1 WHERE id = $2',
      [serializedLayout, cw_id],
    );
    return;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const sqliteCourseworkId = normalizeSqliteUuid(cw_id);
  const query = db.prepare(
    "UPDATE coursework SET coursework_layout = ? WHERE id = ?",
  );
  query.run(serializedLayout, sqliteCourseworkId);
}
