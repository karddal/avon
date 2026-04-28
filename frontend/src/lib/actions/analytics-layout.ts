"use server";

import { DatabaseSync } from "node:sqlite";
import type { GridItem } from "@/components/analytics-page/analytics-types";
import { pool } from "@/lib/actions/auth/db_pool";
import {
  defaultAnalyticsLayout,
  parseAnalyticsLayout,
} from "@/lib/analytics-layout";
import { requireSession } from "@/lib/auth-utils";
import {
  getSqliteDbPath,
  shouldUseExternalDatabase,
} from "@/lib/server-runtime";

const dbPath = getSqliteDbPath();

function isProductionDatabase() {
  return shouldUseExternalDatabase();
}

async function ensureAnalyticsLayoutColumnExists(): Promise<void> {
  if (isProductionDatabase()) {
    await pool.query(
      'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS analytics_layout text',
    );
    return;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const columns = db.prepare("PRAGMA table_info(user)").all() as Array<{
    name: string;
  }>;
  const hasAnalyticsLayoutColumn = columns.some(
    (column) => column.name === "analytics_layout",
  );

  if (!hasAnalyticsLayoutColumn) {
    db.exec("ALTER TABLE user ADD COLUMN analytics_layout TEXT");
  }
}

async function getRawAnalyticsLayout(userId: string): Promise<string | null> {
  await ensureAnalyticsLayoutColumnExists();

  if (isProductionDatabase()) {
    const result = await pool.query(
      'SELECT analytics_layout FROM "user" WHERE id = $1',
      [userId],
    );

    const row = result.rows[0] as
      | { analytics_layout: string | null }
      | undefined;
    return row?.analytics_layout ?? null;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const query = db.prepare("SELECT analytics_layout FROM user WHERE id = ?");
  const result = query.get(userId) as
    | { analytics_layout: string | null }
    | undefined;

  return result?.analytics_layout ?? null;
}

export async function getAnalyticsLayoutForCurrentUser(): Promise<GridItem[]> {
  const session = await requireSession();

  try {
    const rawLayout = await getRawAnalyticsLayout(session.user.id);
    return parseAnalyticsLayout(rawLayout) ?? defaultAnalyticsLayout;
  } catch (error) {
    console.error("Failed to load analytics layout from database", error);
    return defaultAnalyticsLayout;
  }
}

export async function saveAnalyticsLayoutForCurrentUser(
  layout: GridItem[],
): Promise<void> {
  const session = await requireSession();
  const parsedLayout = parseAnalyticsLayout(JSON.stringify(layout));

  if (!parsedLayout) {
    throw new Error("Invalid analytics layout");
  }

  const serializedLayout = JSON.stringify(parsedLayout);
  const updatedAt = new Date().toISOString();

  await ensureAnalyticsLayoutColumnExists();

  if (isProductionDatabase()) {
    await pool.query(
      'UPDATE "user" SET analytics_layout = $1, "updatedAt" = $2 WHERE id = $3',
      [serializedLayout, updatedAt, session.user.id],
    );
    return;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const query = db.prepare(
    "UPDATE user SET analytics_layout = ?, updatedAt = ? WHERE id = ?",
  );
  query.run(serializedLayout, updatedAt, session.user.id);
}
