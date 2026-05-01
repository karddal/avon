"use server";

import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { GridItem } from "@/components/modules/coursework_layout/coursework-types";
import { pool } from "@/lib/actions/auth/db_pool";
import { parseCourseworkLayout } from "@/lib/coursework-layout";

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

function getLayoutColumn(
  layoutType: "staff" | "student",
): "coursework_layout_staff" | "coursework_layout_student" {
  return layoutType === "staff"
    ? "coursework_layout_staff"
    : "coursework_layout_student";
}

async function ensureCourseworkLayoutColumnsExist(): Promise<void> {
  if (isProductionDatabase()) {
    await pool.query(
      'ALTER TABLE "coursework" ADD COLUMN IF NOT EXISTS coursework_layout_staff text',
    );
    await pool.query(
      'ALTER TABLE "coursework" ADD COLUMN IF NOT EXISTS coursework_layout_student text',
    );
    return;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const columns = db.prepare("PRAGMA table_info(coursework)").all() as Array<{
    name: string;
  }>;
  const hasCourseworkLayoutStaffColumn = columns.some(
    (column) => column.name === "coursework_layout_staff",
  );
  const hasCourseworkLayoutStudentColumn = columns.some(
    (column) => column.name === "coursework_layout_student",
  );

  if (!hasCourseworkLayoutStaffColumn) {
    db.exec("ALTER TABLE coursework ADD COLUMN coursework_layout_staff TEXT");
  }

  if (!hasCourseworkLayoutStudentColumn) {
    db.exec("ALTER TABLE coursework ADD COLUMN coursework_layout_student TEXT");
  }
}

async function getRawCourseworkLayout(
  courseworkId: string,
  layoutType: "staff" | "student" = "staff",
): Promise<string | null> {
  await ensureCourseworkLayoutColumnsExist();
  const layoutColumn = getLayoutColumn(layoutType);

  if (isProductionDatabase()) {
    if (layoutColumn === "coursework_layout_staff") {
      const result = await pool.query(
        'SELECT coursework_layout_staff FROM "coursework" WHERE id = $1',
        [courseworkId],
      );

      const row = result.rows[0] as
        | { coursework_layout_staff: string | null }
        | undefined;
      return row?.coursework_layout_staff ?? null;
    }

    const result = await pool.query(
      'SELECT coursework_layout_student FROM "coursework" WHERE id = $1',
      [courseworkId],
    );

    const row = result.rows[0] as
      | { coursework_layout_student: string | null }
      | undefined;
    return row?.coursework_layout_student ?? null;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const sqliteCourseworkId = normalizeSqliteUuid(courseworkId);
  if (layoutColumn === "coursework_layout_staff") {
    const query = db.prepare(
      "SELECT coursework_layout_staff FROM coursework WHERE id = ?",
    );
    const result = query.get(sqliteCourseworkId) as
      | { coursework_layout_staff: string | null }
      | undefined;

    return result?.coursework_layout_staff ?? null;
  }

  const query = db.prepare(
    "SELECT coursework_layout_student FROM coursework WHERE id = ?",
  );
  const result = query.get(sqliteCourseworkId) as
    | { coursework_layout_student: string | null }
    | undefined;

  return result?.coursework_layout_student ?? null;
}

export async function getCourseworkLayoutForCurrentCoursework(
  cw_id: string,
  layoutType: "staff" | "student" = "staff",
): Promise<GridItem[]> {
  try {
    const rawLayout = await getRawCourseworkLayout(cw_id, layoutType);
    const defaultLayout =
      layoutType === "staff"
        ? (await import("@/lib/coursework-layout")).defaultStaffCourseworkLayout
        : (await import("@/lib/coursework-layout"))
            .defaultStudentCourseworkLayout;
    return parseCourseworkLayout(rawLayout) ?? defaultLayout;
  } catch (error) {
    console.error("Failed to load coursework layout from database", error);
    const defaultLayout =
      layoutType === "staff"
        ? (await import("@/lib/coursework-layout")).defaultStaffCourseworkLayout
        : (await import("@/lib/coursework-layout"))
            .defaultStudentCourseworkLayout;
    return defaultLayout;
  }
}

export async function saveCourseworkLayoutForCurrentCoursework(
  layout: GridItem[],
  cw_id: string,
  layoutType: "staff" | "student" = "staff",
): Promise<void> {
  const parsedLayout = parseCourseworkLayout(JSON.stringify(layout));

  if (!parsedLayout) {
    throw new Error("Invalid coursework layout");
  }

  const serializedLayout = JSON.stringify(parsedLayout);
  const layoutColumn = getLayoutColumn(layoutType);

  await ensureCourseworkLayoutColumnsExist();

  if (isProductionDatabase()) {
    if (layoutColumn === "coursework_layout_staff") {
      await pool.query(
        'UPDATE "coursework" SET coursework_layout_staff = $1 WHERE id = $2',
        [serializedLayout, cw_id],
      );
      return;
    }

    await pool.query(
      'UPDATE "coursework" SET coursework_layout_student = $1 WHERE id = $2',
      [serializedLayout, cw_id],
    );
    return;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const sqliteCourseworkId = normalizeSqliteUuid(cw_id);
  const query =
    layoutColumn === "coursework_layout_staff"
      ? db.prepare(
          "UPDATE coursework SET coursework_layout_staff = ? WHERE id = ?",
        )
      : db.prepare(
          "UPDATE coursework SET coursework_layout_student = ? WHERE id = ?",
        );
  query.run(serializedLayout, sqliteCourseworkId);
}
