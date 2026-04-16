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

async function getRawCourseworkLayout(courseworkId: string, layoutType: "staff" | "student" = "staff"): Promise<string | null> {
  await ensureCourseworkLayoutColumnExists();

  if (isProductionDatabase()) {
    const result = await pool.query(
      'SELECT coursework_layout FROM "coursework" WHERE id = $1',
      [courseworkId],
    );

    const row = result.rows[0] as
      | { coursework_layout: string | null }
      | undefined;
    const rawLayout = row?.coursework_layout ?? null;
    return extractLayoutByType(rawLayout, layoutType);
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const sqliteCourseworkId = normalizeSqliteUuid(courseworkId);
  const query = db.prepare("SELECT coursework_layout FROM coursework WHERE id = ?");
  const result = query.get(sqliteCourseworkId) as
    | { coursework_layout: string | null }
    | undefined;

  const rawLayout = result?.coursework_layout ?? null;
  return extractLayoutByType(rawLayout, layoutType);
}

function extractLayoutByType(rawLayout: string | null, layoutType: "staff" | "student"): string | null {
  if (!rawLayout) return null;

  try {
    const parsed = JSON.parse(rawLayout) as unknown;
    
    // If it's an object with staff/student keys, extract the appropriate one
    if (parsed && typeof parsed === "object" && ("staff" in parsed || "student" in parsed)) {
      const layouts = parsed as Record<string, unknown>;
      return layouts[layoutType] ? JSON.stringify(layouts[layoutType]) : null;
    }
    
    // Otherwise assume it's a legacy single layout (treat as staff)
    return layoutType === "staff" ? rawLayout : null;
  } catch {
    return null;
  }
}

export async function getCourseworkLayoutForCurrentCoursework(cw_id: string, layoutType: "staff" | "student" = "staff"): Promise<GridItem[]> {
  try {
    const rawLayout = await getRawCourseworkLayout(cw_id, layoutType);
    const defaultLayout = layoutType === "staff" 
      ? (await import("@/lib/coursework-layout")).defaultStaffCourseworkLayout
      : (await import("@/lib/coursework-layout")).defaultStudentCourseworkLayout;
    return parseCourseworkLayout(rawLayout) ?? defaultLayout;
  } catch (error) {
    console.error("Failed to load coursework layout from database", error);
    const defaultLayout = layoutType === "staff"
      ? (await import("@/lib/coursework-layout")).defaultStaffCourseworkLayout
      : (await import("@/lib/coursework-layout")).defaultStudentCourseworkLayout;
    return defaultLayout;
  }
}

export async function saveCourseworkLayoutForCurrentCoursework(
  layout: GridItem[], cw_id: string, layoutType: "staff" | "student" = "staff"
): Promise<void> {
  const parsedLayout = parseCourseworkLayout(JSON.stringify(layout));

  if (!parsedLayout) {
    throw new Error("Invalid coursework layout");
  }

  // Get existing layout or create new structure
  const existingRaw = await getRawCourseworkLayout(cw_id, "staff");
  const existingLayoutStr = existingRaw ? existingRaw : JSON.stringify((await import("@/lib/coursework-layout")).defaultStaffCourseworkLayout);
  
  let existingLayout: GridItem[] = [];
  try {
    existingLayout = JSON.parse(existingLayoutStr) as GridItem[];
  } catch {
    existingLayout = (await import("@/lib/coursework-layout")).defaultStaffCourseworkLayout;
  }

  // Get student layout
  const studentRaw = await getRawCourseworkLayout(cw_id, "student");
  const studentLayoutStr = studentRaw ? studentRaw : JSON.stringify((await import("@/lib/coursework-layout")).defaultStudentCourseworkLayout);
  
  let studentLayout: GridItem[] = [];
  try {
    studentLayout = JSON.parse(studentLayoutStr) as GridItem[];
  } catch {
    studentLayout = (await import("@/lib/coursework-layout")).defaultStudentCourseworkLayout;
  }

  // Update appropriate layout
  if (layoutType === "staff") {
    existingLayout = parsedLayout;
  } else {
    studentLayout = parsedLayout;
  }

  const serializedLayout = JSON.stringify({
    staff: existingLayout,
    student: studentLayout,
  });

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
