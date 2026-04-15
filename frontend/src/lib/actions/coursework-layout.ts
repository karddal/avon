"use server";

import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { GridItem } from "@/components/modules/coursework_layout/coursework-types";
import { pool } from "@/lib/actions/auth/db_pool";
import { get_coursework_scopes } from "@/lib/actions/coursework/get_coursework_scopes";
import {
  availableCourseworkModulesStaff,
  availableCourseworkModulesStudent,
  type CourseworkLayoutTarget,
  getDefaultCourseworkLayoutForTarget,
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

function getLayoutColumn(target: CourseworkLayoutTarget) {
  return target === "staff" ? "coursework_layout_staff" : "coursework_layout_student";
}

function getAllowedModulesForTarget(target: CourseworkLayoutTarget) {
  return new Set(
    target === "staff"
      ? availableCourseworkModulesStaff
      : availableCourseworkModulesStudent,
  );
}

function sanitizeLayoutForTarget(
  layout: GridItem[],
  target: CourseworkLayoutTarget,
): GridItem[] {
  const allowedModules = getAllowedModulesForTarget(target);
  return layout.filter((item) => allowedModules.has(item.moduleKey));
}

function canEditLayoutFromScopes(scopes: Set<string>) {
  return (
    scopes.has("unit:coursework_manage") ||
    scopes.has("unit:coursework_gitlab") ||
    scopes.has("unit:coursework_engine") ||
    scopes.has("unit:coursework_delete")
  );
}

async function inferTargetFromScopes(
  courseworkId: string,
): Promise<CourseworkLayoutTarget> {
  const scopes = await get_coursework_scopes(courseworkId);
  return canEditLayoutFromScopes(scopes) ? "staff" : "student";
}

async function ensureCourseworkLayoutColumnsExist(): Promise<void> {
  if (isProductionDatabase()) {
    await pool.query(
      'ALTER TABLE "coursework" ADD COLUMN IF NOT EXISTS coursework_layout_student text',
    );
    await pool.query(
      'ALTER TABLE "coursework" ADD COLUMN IF NOT EXISTS coursework_layout_staff text',
    );
    return;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const columns = db.prepare("PRAGMA table_info(coursework)").all() as Array<{
    name: string;
  }>;

  const hasStudentColumn = columns.some(
    (column) => column.name === "coursework_layout_student",
  );
  const hasStaffColumn = columns.some(
    (column) => column.name === "coursework_layout_staff",
  );

  if (!hasStudentColumn) {
    db.exec("ALTER TABLE coursework ADD COLUMN coursework_layout_student TEXT");
  }
  if (!hasStaffColumn) {
    db.exec("ALTER TABLE coursework ADD COLUMN coursework_layout_staff TEXT");
  }
}

type CourseworkLayoutRow = {
  coursework_layout_student: string | null;
  coursework_layout_staff: string | null;
};

async function getRawCourseworkLayoutRow(
  courseworkId: string,
): Promise<CourseworkLayoutRow | null> {
  await ensureCourseworkLayoutColumnsExist();

  if (isProductionDatabase()) {
    const result = await pool.query(
      'SELECT coursework_layout_student, coursework_layout_staff FROM "coursework" WHERE id = $1',
      [courseworkId],
    );

    const row = result.rows[0] as CourseworkLayoutRow | undefined;
    return row ?? null;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const sqliteCourseworkId = normalizeSqliteUuid(courseworkId);
  const query = db.prepare(
    "SELECT coursework_layout_student, coursework_layout_staff FROM coursework WHERE id = ?",
  );
  const result = query.get(sqliteCourseworkId) as CourseworkLayoutRow | undefined;

  return result ?? null;
}

export async function getCourseworkLayoutForTarget(
  courseworkId: string,
  target: CourseworkLayoutTarget,
): Promise<GridItem[]> {
  try {
    const row = await getRawCourseworkLayoutRow(courseworkId);
    if (!row) {
      return getDefaultCourseworkLayoutForTarget(target);
    }

    const rawLayout = row[getLayoutColumn(target)];

    const parsed = parseCourseworkLayout(rawLayout);
    if (!parsed) {
      return getDefaultCourseworkLayoutForTarget(target);
    }

    const sanitized = sanitizeLayoutForTarget(parsed, target);
    return sanitized.length > 0
      ? sanitized
      : getDefaultCourseworkLayoutForTarget(target);
  } catch (error) {
    console.error("Failed to load coursework layout from database", error);
    return getDefaultCourseworkLayoutForTarget(target);
  }
}

export async function saveCourseworkLayoutForTarget(
  layout: GridItem[],
  courseworkId: string,
  target: CourseworkLayoutTarget,
): Promise<void> {
  const scopes = await get_coursework_scopes(courseworkId);

  if (!canEditLayoutFromScopes(scopes)) {
    throw new Error("Forbidden: students cannot edit coursework layout");
  }

  const parsedLayout = parseCourseworkLayout(JSON.stringify(layout));

  if (!parsedLayout) {
    throw new Error("Invalid coursework layout");
  }

  const sanitizedLayout = sanitizeLayoutForTarget(parsedLayout, target);
  const serializedLayout = JSON.stringify(sanitizedLayout);
  const targetColumn = getLayoutColumn(target);

  await ensureCourseworkLayoutColumnsExist();

  if (isProductionDatabase()) {
    await pool.query(
      `UPDATE "coursework" SET ${targetColumn} = $1 WHERE id = $2`,
      [serializedLayout, courseworkId],
    );
    return;
  }

  const db = new DatabaseSync(dbPath);
  db.createSession();

  const sqliteCourseworkId = normalizeSqliteUuid(courseworkId);
  const query = db.prepare(
    `UPDATE coursework SET ${targetColumn} = ? WHERE id = ?`,
  );
  query.run(serializedLayout, sqliteCourseworkId);
}

export async function getCourseworkLayoutForCurrentCoursework(
  courseworkId: string,
): Promise<GridItem[]> {
  const inferredTarget = await inferTargetFromScopes(courseworkId);
  return getCourseworkLayoutForTarget(courseworkId, inferredTarget);
}

export async function saveCourseworkLayoutForCurrentCoursework(
  layout: GridItem[],
  courseworkId: string,
  target?: CourseworkLayoutTarget,
): Promise<void> {
  const resolvedTarget = target ?? (await inferTargetFromScopes(courseworkId));
  return saveCourseworkLayoutForTarget(layout, courseworkId, resolvedTarget);
}
