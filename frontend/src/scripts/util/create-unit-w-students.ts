import type { DatabaseSync } from "node:sqlite";
import {
  seed_batch_add_lecturers_to_unit,
  seed_batch_add_students_to_unit,
} from "@/scripts/util/add-students";
import { create_unit } from "@/scripts/util/unit";

export async function createUnitWithStudentsAndLecturers(
  db: DatabaseSync,
  programmeId: string,
  unitData: {
    name: string;
    description: string;
    colour: string;
    unit_code: string;
  },
  studentIds: string[],
  lecturerIds: string[],
): Promise<string | null> {
  await create_unit({
    name: unitData.name,
    description: unitData.description,
    colour: unitData.colour,
    unit_code: unitData.unit_code,
    programme_id: programmeId,
    unlocked: true,
  });

  const unit = db
    .prepare("SELECT id FROM unit WHERE name = ? AND programme_id = ?")
    .get(unitData.name, programmeId);

  if (!unit) {
    return null;
  }

  const unitId = String(unit.id);

  await seed_batch_add_students_to_unit(unitId, studentIds);
  await seed_batch_add_lecturers_to_unit(unitId, lecturerIds);

  return unitId;
}
