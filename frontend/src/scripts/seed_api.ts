import type { DatabaseSync } from "node:sqlite";
import { create_coursework } from "@/scripts/util/coursework";
import { createUnitWithStudents } from "@/scripts/util/create-unit-w-students";
import { create_programme } from "@/scripts/util/programme";

export async function api_seed(db: DatabaseSync) {
  const rows = db.prepare("SELECT id FROM user").all();
  const userIds: string[] = rows.map((row) => String(row.id));
  console.log(userIds);

  // --- 1. Create Programmes ---
  const programmesToCreate = [
    {
      name: "Year 1 Computer Science 2025-2026",
      start_date: "2025-09-10",
      end_date: "2026-05-30",
    },
    {
      name: "Year 2 Computer Science 2025-2026",
      start_date: "2025-09-10",
      end_date: "2026-05-30",
    },
    {
      name: "Year 1 Computer Science 2024-2025",
      start_date: "2024-09-10",
      end_date: "2025-05-30",
    },
    {
      name: "Year 2 Computer Science 2024-2025",
      start_date: "2024-09-10",
      end_date: "2025-05-30",
    },
  ];

  for (const p of programmesToCreate) {
    const r = await create_programme(p);
    if (!r.success) throw new Error(`Failed to create programme: ${p.name}`);
  }

  // Helper to get ID by name
  const getProgId = (name: string) => {
    const row = db
      .prepare("SELECT id FROM programme WHERE name = ?")
      .get(name) as { id: string };
    if (!row) throw new Error(`Programme not found: ${name}`);
    return row.id;
  };

  const idY1_2526 = getProgId("Year 1 Computer Science 2025-2026");
  const idY2_2526 = getProgId("Year 2 Computer Science 2025-2026");
  const idY1_2425 = getProgId("Year 1 Computer Science 2024-2025");

  // --- 2. Create Units & Coursework ---

  // Y1 2024/2025 Units
  const _unitMaths24 = await createUnitWithStudents(
    db,
    idY1_2425,
    {
      name: "Mathematics for Computer Science A",
      description: "I love maths A",
      colour: "abcdef",
      unit_code: "COMS10014",
    },
    userIds,
  );

  const unitArch24 = await createUnitWithStudents(
    db,
    idY1_2425,
    {
      name: "Computer Architecture",
      description: "Encrypt coursework very hard",
      colour: "343434",
      unit_code: "COMS10015",
    },
    userIds,
  );

  const unitImpFunc24 = await createUnitWithStudents(
    db,
    idY1_2425,
    {
      name: "Imperative and Functional Programming",
      description: "malloc() and memory leaks",
      colour: "565656",
      unit_code: "COMS10016",
    },
    userIds,
  );

  // Y1 2025/2026 Units
  const _unitMaths25 = await createUnitWithStudents(
    db,
    idY1_2526,
    {
      name: "Mathematics for Computer Science A",
      description: "I love maths A, now in 2025!!",
      colour: "abcdef",
      unit_code: "COMS10014",
    },
    userIds,
  );

  const unitArch25 = await createUnitWithStudents(
    db,
    idY1_2526,
    {
      name: "Computer Architecture",
      description: "Encrypt coursework very hard",
      colour: "343434",
      unit_code: "COMS10015",
    },
    userIds,
  );

  const unitImpFunc25 = await createUnitWithStudents(
    db,
    idY1_2526,
    {
      name: "Imperative and Functional Programming",
      description: "malloc() and memory leaks",
      colour: "565656",
      unit_code: "COMS10016",
    },
    userIds,
  );

  // Y2 2025/2026 Units
  const unitSE25 = await createUnitWithStudents(
    db,
    idY2_2526,
    {
      name: "Software Engineering Project",
      description: "Agile agile agile",
      colour: "112233",
      unit_code: "COMS20006",
    },
    userIds,
  );

  await createUnitWithStudents(
    db,
    idY2_2526,
    {
      name: "Programming Languages and Computation",
      description: "Very hard unit",
      colour: "454545",
      unit_code: "COMS20007",
    },
    userIds,
  );

  await createUnitWithStudents(
    db,
    idY2_2526,
    {
      name: "Computer Systems A",
      description: "Go go go go go & Game of Life",
      colour: "676767",
      unit_code: "COMS20017",
    },
    userIds,
  );

  // --- 3. Create Coursework ---

  // 2024 Coursework
  await create_coursework({
    name: "Power to the People in 2024",
    description: "Easy Haskell 1",
    colour: "676767",
    due_date: "2024-12-15 23:59:00",
    unit_id: String(unitImpFunc24),
  });

  await create_coursework({
    name: "Double Linked List 2024",
    description: "literally the title",
    colour: "b01c2e",
    due_date: "2024-10-30 23:59:00",
    unit_id: String(unitImpFunc24),
  });

  await create_coursework({
    name: "Encrypt",
    description: "Did you know you can encrypt with binary? Includes v1 v2 v3",
    colour: "1a2b3c",
    due_date: "2024-11-10 14:00:00",
    unit_id: String(unitArch24),
  });

  // 2025/2026 Coursework
  await create_coursework({
    name: "Power to the People in 2025",
    description: "Easy Haskell 1",
    colour: "abcdef",
    due_date: "2025-12-15 23:59:00",
    unit_id: String(unitImpFunc25),
  });

  await create_coursework({
    name: "AI Bill Splitter",
    description: "Splitvise but with Vibes, should have been called splitvibes",
    colour: "f1d2c3",
    due_date: "2026-04-20 17:00:00",
    unit_id: String(unitSE25),
  });

  await create_coursework({
    name: "Encrypt",
    description: "Did you know you can encrypt with binary?",
    colour: "1a2b3c",
    due_date: "2026-05-10 14:00:00",
    unit_id: String(unitArch25),
  });
}
