import type { DatabaseSync } from "node:sqlite";
import { create_coursework } from "@/scripts/util/coursework";
import { createUnitWithStudents } from "@/scripts/util/create-unit-w-students";
import { create_programme } from "@/scripts/util/programme";

export async function api_seed(db: DatabaseSync) {
  const rows = db.prepare("SELECT id FROM user").all();
  const userIds: string[] = rows.map((row) => String(row.id));

  const r = await create_programme({
    name: "Year 1 Computer Science 2025-2026",
    start_date: "2025-09-10",
    end_date: "2026-05-30",
  });

  if (!r.success) {
    console.log(r.data);
    throw new Error("Failed to create coursework");
  }

  const prog = db
    .prepare("SELECT id FROM programme WHERE name = ?")
    .get("Year 1 Computer Science 2025-2026");
  if (!prog) {
    throw new Error("Programme not created");
  }

  // COMS10015
  const unitIdCA = await createUnitWithStudents(
    db,
    String(prog.id),
    {
      name: "Computer Architecture",
      description: "Comp Arch",
      colour: "abcdef",
      unit_code: "COMS10015",
    },
    userIds,
  );

  await create_coursework({
    name: "Encrypt",
    description: "verilog",
    colour: "abcdef",
    due_date: "2026-05-04 12:12:09.665437",
    unit_id: String(unitIdCA),
  });

  // COMS10016
  const unitIdIMPFUNC = await createUnitWithStudents(
    db,
    String(prog.id),
    {
      name: "Imperative and Functional Programming",
      description: "IMP FUNC",
      colour: "abcdef",
      unit_code: "COMS10016",
    },
    userIds,
  );

  await create_coursework({
    name: "Power to the People",
    description: "Haskell",
    colour: "abcdef",
    due_date: "2026-04-10 12:12:09.665437",
    unit_id: String(unitIdIMPFUNC),
  });

  await create_coursework({
    name: "List",
    description: "C",
    colour: "abcdef",
    due_date: "2026-05-10 12:12:09.665437",
    unit_id: String(unitIdIMPFUNC),
  });

  await create_coursework({
    name: "Sketch",
    description: "C pt 2",
    colour: "abcdef",
    due_date: "2026-04-30 12:12:09.665437",
    unit_id: String(unitIdIMPFUNC),
  });

  // COMS10018
  const unitIdOOP = await createUnitWithStudents(
    db,
    String(prog.id),
    {
      name: "Object Oriented Programming and Algorithms I",
      description: "OOP Java",
      colour: "abcdef",
      unit_code: "COMS10018",
    },
    userIds,
  );

  await create_coursework({
    name: "Scotland Yard",
    description: "AI stuff",
    colour: "abcdef",
    due_date: "2026-05-10 12:12:09.665437",
    unit_id: String(unitIdOOP),
  });

  await create_coursework({
    name: "Algorithms Coursework",
    description: "Quicksort",
    colour: "abcdef",
    due_date: "2026-05-10 12:12:09.665437",
    unit_id: String(unitIdOOP),
  });
}
