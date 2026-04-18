import type { DatabaseSync } from "node:sqlite";
import { create_coursework } from "@/scripts/util/coursework";
import { createUnitWithStudentsAndLecturers } from "@/scripts/util/create-unit-w-students";
import { fixtureRequest } from "@/scripts/util/fixture-api";
import { create_programme } from "@/scripts/util/programme";

export async function api_seed(db: DatabaseSync) {
  await fixtureRequest<void>("/testing/fixtures/reset-domain");

  const students = db
    .prepare("SELECT id FROM user WHERE user.role = 'user'")
    .all();
  const studentIds: string[] = students.map((student) => String(student.id));
  const lecturers = db
    .prepare("SELECT id FROM user WHERE user.role = 'lecturer'")
    .all();
  const lecturerIds: string[] = lecturers.map((lecturer) =>
    String(lecturer.id),
  );

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

  const programmeIds = new Map<string, string>();
  for (const p of programmesToCreate) {
    const createdProgramme = await create_programme(p);
    programmeIds.set(createdProgramme.name, createdProgramme.id);
  }

  const idY1_2526 = programmeIds.get("Year 1 Computer Science 2025-2026");
  const idY2_2526 = programmeIds.get("Year 2 Computer Science 2025-2026");
  const idY1_2425 = programmeIds.get("Year 1 Computer Science 2024-2025");

  if (!idY1_2526 || !idY2_2526 || !idY1_2425) {
    throw new Error(
      "Fixture programme creation did not return all expected IDs",
    );
  }

  // --- 2. Create Units & Coursework ---

  // Y1 2024/2025 Units
  const _unitMaths24 = await createUnitWithStudentsAndLecturers(
    db,
    idY1_2425,
    {
      name: "Mathematics for Computer Science A",
      description: "I love maths A",
      colour: "abcdef",
      unit_code: "COMS10014",
    },
    studentIds,
    lecturerIds,
  );

  const unitArch24 = await createUnitWithStudentsAndLecturers(
    db,
    idY1_2425,
    {
      name: "Computer Architecture",
      description: "Encrypt coursework very hard",
      colour: "343434",
      unit_code: "COMS10015",
    },
    studentIds,
    lecturerIds,
  );

  const unitImpFunc24 = await createUnitWithStudentsAndLecturers(
    db,
    idY1_2425,
    {
      name: "Imperative and Functional Programming",
      description: "malloc() and memory leaks",
      colour: "565656",
      unit_code: "COMS10016",
    },
    studentIds,
    lecturerIds,
  );

  // Y1 2025/2026 Units
  const _unitMaths25 = await createUnitWithStudentsAndLecturers(
    db,
    idY1_2526,
    {
      name: "Mathematics for Computer Science A",
      description: "I love maths A, now in 2025!!",
      colour: "abcdef",
      unit_code: "COMS10014",
    },
    studentIds,
    lecturerIds,
  );

  const unitArch25 = await createUnitWithStudentsAndLecturers(
    db,
    idY1_2526,
    {
      name: "Computer Architecture",
      description: "Encrypt coursework very hard",
      colour: "343434",
      unit_code: "COMS10015",
    },
    studentIds,
    lecturerIds,
  );

  const unitImpFunc25 = await createUnitWithStudentsAndLecturers(
    db,
    idY1_2526,
    {
      name: "Imperative and Functional Programming",
      description: "malloc() and memory leaks",
      colour: "565656",
      unit_code: "COMS10016",
    },
    studentIds,
    lecturerIds,
  );

  // Y2 2025/2026 Units
  const unitSE25 = await createUnitWithStudentsAndLecturers(
    db,
    idY2_2526,
    {
      name: "Software Engineering Project",
      description: "Agile agile agile",
      colour: "112233",
      unit_code: "COMS20006",
    },
    studentIds,
    lecturerIds,
  );

  await createUnitWithStudentsAndLecturers(
    db,
    idY2_2526,
    {
      name: "Programming Languages and Computation",
      description: "Very hard unit",
      colour: "454545",
      unit_code: "COMS20007",
    },
    studentIds,
    lecturerIds,
  );

  await createUnitWithStudentsAndLecturers(
    db,
    idY2_2526,
    {
      name: "Computer Systems A",
      description: "Go go go go go & Game of Life",
      colour: "676767",
      unit_code: "COMS20017",
    },
    studentIds,
    lecturerIds,
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
